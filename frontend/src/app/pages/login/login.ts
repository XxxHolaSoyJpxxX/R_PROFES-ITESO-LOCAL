import { Component, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Token } from '../../shared/services/token';
import { environment } from '../../../environments/environment';

declare const google: any;
@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  googleClientId = environment.googleClientId;
  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone,
    private tokenService: Token
  ) { }

  ngOnInit() {

    if (this.tokenService.hasToken()) {
      this.router.navigate(['/home']);
      return;
    }
    google.accounts.id.initialize({
      client_id: '152305242233-4de38h7c2g1m6jm2tl908c1o8hkua75g.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredential(response)
    });

    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "filled_blue", size: "large" }
    );
  }

  handleCredential(response: any) {
    const idToken = response.credential;

    this.http.post('api/auth/google', { credential: idToken })
      .subscribe((resp: any) => {
        console.log(resp)
        this.tokenService.setToken(resp.token);
        this.tokenService.setUsuario(resp.usuario);
        this.tokenService.setRol(resp.rol.rol)

        this.zone.run(() => {
          this.router.navigate(['/home']);
        });
      });
  }
}
