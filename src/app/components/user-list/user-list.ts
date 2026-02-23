import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService} from '../../services/user.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})
export class UserList implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef);

  allUsers: User[]      = [];
  filteredUsers: User[] = [];
  loading = true;
  error   = '';

  searchQuery = '';
  filterRole: string = 'ALL';

  // Modal
  showModal    = false;
  editMode     = false;
  saving       = false;
  checkingUsername = false;
  usernameExists   = false;

  deleteConfirmId: number | null = null;

  // Form
  form: Partial<User> & { confirmPassword?: string } = this.emptyForm();
  showPassword        = false;
  showConfirmPassword = false;

  readonly roles = ['ADMIN', 'USER'];

  private usernameCheck$ = new Subject<string>();

  // ID del usuario logueado (para no dejarlo eliminar/editar a sí mismo)
  get currentUserId(): number | null {
    const token = this.authService.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.uid ?? null;
    } catch { return null; }
  }

  ngOnInit(): void {
    this.loadUsers();

    // Debounce check username
    this.usernameCheck$.pipe(debounceTime(400), distinctUntilChanged()).subscribe(username => {
      if (!username || this.editMode) { this.usernameExists = false; return; }
      this.checkingUsername = true;
      this.userService.existsByUsername(username).subscribe({
        next: (exists) => {
          this.usernameExists = exists;
          this.checkingUsername = false;
          this.cdr.detectChanges();
        },
        error: () => { this.checkingUsername = false; }
      });
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load users.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.allUsers.filter(u => {
      const matchSearch = !q || u.username.toLowerCase().includes(q);
      const matchRole   = this.filterRole === 'ALL' || u.role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  setRoleFilter(role: string): void {
    this.filterRole = role;
    this.applyFilters();
  }

  openCreate(): void {
    this.form      = this.emptyForm();
    this.editMode  = false;
    this.showModal = true;
    this.usernameExists = false;
  }

  openEdit(user: User): void {
    this.form = { ...user, password: '', confirmPassword: '' };
    this.editMode  = true;
    this.showModal = true;
    this.usernameExists = false;
  }

  closeModal(): void {
    this.showModal = false;
    this.saving    = false;
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  onUsernameInput(): void {
    this.usernameCheck$.next(this.form.username ?? '');
  }

  get formValid(): boolean {
    if (!this.form.username || !this.form.role) return false;
    if (this.usernameExists && !this.editMode) return false;
    if (!this.editMode) {
      if (!this.form.password || this.form.password.length < 6) return false;
      if (this.form.password !== this.form.confirmPassword) return false;
    } else {
      // En edición, si pone password debe coincidir
      if (this.form.password && this.form.password !== this.form.confirmPassword) return false;
    }
    return true;
  }

  get passwordMismatch(): boolean {
    return !!this.form.password && !!this.form.confirmPassword &&
           this.form.password !== this.form.confirmPassword;
  }

  save(): void {
    if (!this.formValid || this.saving) return;
    this.saving = true;

    const payload: User = {
      username: this.form.username!,
      role:     this.form.role!,
      ...(this.form.password ? { password: this.form.password } : {}),
    };

    const request$ = this.editMode && this.form.id
      ? this.userService.updateUser(this.form.id, payload)
      : this.userService.createUser(payload);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadUsers(); },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void            { this.deleteConfirmId = null; }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadUsers(); },
      error: (err) => console.error(err),
    });
  }

  isSelf(user: User): boolean {
    return user.id === this.currentUserId;
  }

  roleClass(role: string): string {
    return role === 'ADMIN' ? 'chip--amber' : 'chip--blue';
  }

  private emptyForm() {
    return { username: '', password: '', confirmPassword: '', role: 'USER' };
  }

  get adminCount() { return this.allUsers.filter(u => u.role === 'ADMIN').length; }
  get userCount()  { return this.allUsers.filter(u => u.role === 'USER').length; }
}