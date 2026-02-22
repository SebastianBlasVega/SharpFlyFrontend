export interface Passenger {
  passengerId?: number;
  // 'booking' se omite para evitar referencia circular
  firstName: string;
  lastName: string;
  docType: string;        // String libre en Java: 'DNI', 'PASSPORT', 'CE', etc.
  docNumber: string;
  createdAt?: string;
}
