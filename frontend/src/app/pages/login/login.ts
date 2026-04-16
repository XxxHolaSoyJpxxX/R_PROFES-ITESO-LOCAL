import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Token } from '../../shared/services/token';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  email    = '';
  password = '';
  error    = '';
  loading  = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: Token
  ) {}

  ngOnInit() {
    if (this.tokenService.hasToken()) {
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.error   = '';
    this.loading = true;

    // En dev usa el proxy Angular (/keycloak/...) para evitar CORS
    // En prod (build dentro del backend) llama directo a Keycloak
    const base = environment.useKeycloakProxy
      ? '/keycloak'
      : environment.keycloakUrl;

    const keycloakTokenUrl =
      `${base}/realms/${environment.keycloakRealm}/protocol/openid-connect/token`;

    const body = new HttpParams()
      .set('grant_type',    'password')
      .set('client_id',     environment.keycloakClient)
      .set('client_secret', environment.keycloakSecret)
      .set('username',      this.email)
      .set('password',      this.password)
      .set('scope',         'openid profile email');

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    // Paso 1: obtener id_token de Keycloak
    this.http.post<any>(keycloakTokenUrl, body.toString(), { headers }).subscribe({
      next: (keycloakResp) => {
        const idToken = keycloakResp.id_token;

        // Paso 2: mandar id_token al backend (misma ruta que usaba Google)
        this.http.post<any>('/api/auth/google', { credential: idToken }).subscribe({
          next: (backendResp) => {
            this.tokenService.setToken(backendResp.token);
            this.tokenService.setUsuario(backendResp.usuario);
            this.tokenService.setRol(backendResp.rol.rol);
            this.router.navigate(['/home']);
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.msg || 'Error al verificar la sesión con el servidor.';
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Email o contraseña incorrectos.';
      }
    });
  }
}
