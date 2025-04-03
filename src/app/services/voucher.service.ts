import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Modules } from '@urls';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  constructor(private http: HttpClient) { }

  public getVoucherByPatientId(id: string): Observable<any> {
    const url = `${Modules.GetVoucherByPatientId}/${id}`
    return this.http.get(url);
  }

  public getVouchers(): Observable<any> {
    const url = `${Modules.Voucher}`
    return this.http.get(url);
  }
}
