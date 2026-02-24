import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.sharpfly';

export interface AircraftSoap {
  aircraftId: number;
  code: string;
  model: string;
  seatCapacity: number;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AircraftSoapService {
  private http = inject(HttpClient);

  // Apunta al gateway igual que el resto de tu app
  private url = `${environment.apiUrl}/ws`;

  private headers = new HttpHeaders({
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': '',
  });

  // Listar todos los aviones 
  getAllAircraft(): Observable<AircraftSoap[]> {
    const body = `
      <soapenv:Envelope
          xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
          xmlns:tns="http://example.com/soapaircraft">
        <soapenv:Body>
          <tns:getAircraftsRequest/>
        </soapenv:Body>
      </soapenv:Envelope>`;

    return this.http
      .post(this.url, body, {
        headers: this.headers,
        responseType: 'text',   // respuesta es XML, no JSON
      })
      .pipe(map(xml => this.parseAircraftList(xml)));
  }

  //Parser XML → objetos TypeScript 
  private parseAircraftList(xml: string): AircraftSoap[] {
    const parser  = new DOMParser();
    const doc     = parser.parseFromString(xml, 'text/xml');
    const nodes   = doc.getElementsByTagNameNS(
      'http://example.com/soapaircraft', 'aircraft'
    );

    const result: AircraftSoap[] = [];
    for (let i = 0; i < nodes.length; i++) {
      result.push(this.nodeToAircraft(nodes[i]));
    }
    return result;
  }

  private nodeToAircraft(node: Element): AircraftSoap {
    const get = (tag: string) =>
      node.getElementsByTagNameNS('http://example.com/soapaircraft', tag)[0]
          ?.textContent ?? '';

    return {
      aircraftId:   parseInt(get('aircraftId')),
      code:         get('code'),
      model:        get('model'),
      seatCapacity: parseInt(get('seatCapacity')),
      isActive:     get('isActive') === 'true',
      createdAt:    get('createdAt'),
    };
  }
}