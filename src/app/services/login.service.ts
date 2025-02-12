import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  usr_id: string='';
  private environment = environment.apibank;

  constructor(private http:HttpClient) { }

  login(objlogin: any) {
    const url = `${this.environment}login`;
    return this.http.post<any>(url, {
      usr_correo: objlogin.usr_correo,
      password: objlogin.password
    }).pipe(
      tap(response => {
        if (response && response.data) {
          localStorage.setItem('userData', JSON.stringify({
            usr_id: response.data.usr_id,
            usr_correo: response.data.usr_correo,
            usr_nombre: response.data.usr_usuario
          }));
          this.setUsrId(response.data.usr_id);
        }
      })
    );
  }

  setUsrId(usr_id: string) {
    this.usr_id = usr_id;
  }
  
  getUsserId(): string {
    return this.usr_id;
  }
}
