import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Token {
  getToken(): string {
    return localStorage.getItem('token')||'';
  }
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  removeToken(): void {
    localStorage.removeItem('token');
  }

  hasToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired(token);
  }

   isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    } catch (e) {
      return true;
    }
  }

  setUsuario(expediente: string): void {
    localStorage.setItem('expediente', expediente);
  }
  getUsuario(): string {
    return localStorage.getItem('expediente')||'';
  }
  removeUsuario(): void {
    localStorage.removeItem('expediente');
  }
  setRol(rol: string):void{
    localStorage.setItem('rol',rol)
  }
    getRol(): string {
    return localStorage.getItem('rol')||'';
  }
  removeRol(): void {
    localStorage.removeItem('rol');
  }
}