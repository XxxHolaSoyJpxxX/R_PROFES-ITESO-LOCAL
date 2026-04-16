import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Token {

  // ── JWT del backend ───────────────────────────────────────────────────────
  getToken(): string      { return localStorage.getItem('token') || ''; }
  setToken(t: string)     { localStorage.setItem('token', t); }
  removeToken()           { localStorage.removeItem('token'); }

  hasToken(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : true;
    } catch { return true; }
  }

  // ── Datos de sesión ───────────────────────────────────────────────────────
  setUsuario(expediente: string) { localStorage.setItem('expediente', expediente); }
  getUsuario(): string           { return localStorage.getItem('expediente') || ''; }
  removeUsuario()                { localStorage.removeItem('expediente'); }

  setRol(rol: string)  { localStorage.setItem('rol', rol); }
  getRol(): string     { return localStorage.getItem('rol') || ''; }
  removeRol()          { localStorage.removeItem('rol'); }

  // ── Cerrar sesión completa ────────────────────────────────────────────────
  clearSession() {
    this.removeToken();
    this.removeUsuario();
    this.removeRol();
  }
}
