import { Component, NgZone, AfterViewInit } from '@angular/core'; // 1. Import AfterViewInit
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
export class Login implements AfterViewInit { // 2. Add implements AfterViewInit

  googleClientId = environment.googleClientId;

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone,
    private tokenService: Token
  ) { }

  // 3. Change ngOnInit to ngAfterViewInit
  ngAfterViewInit() { 
    if (this.tokenService.hasToken()) {
      this.router.navigate(['/home']);
      return;
    }
    
    // It's a good practice to use your environment variable here instead of the hardcoded string
    google.accounts.id.initialize({
      client_id: this.googleClientId, 
      callback: (response: any) => this.handleCredential(response)
    });

    const googleBtnContainer = document.getElementById("googleBtn");
    
    if (googleBtnContainer) {
      google.accounts.id.renderButton(
        googleBtnContainer,
        { theme: "filled_blue", size: "large" }
      );
    } else {
      console.error("Could not find the Google Button container in the DOM!");
    }
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