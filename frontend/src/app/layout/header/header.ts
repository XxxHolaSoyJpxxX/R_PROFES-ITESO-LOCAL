import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Token } from '../../shared/services/token';


@Component({
selector: 'app-header',
standalone: true,
imports: [CommonModule, RouterLink],
templateUrl: './header.html',
styleUrls: ['./header.scss'],
})
export class Header {
menuOpen: boolean = false;


constructor(private router: Router, private TokenSerivice: Token) {}


toggleMenu() {
this.menuOpen = !this.menuOpen;
}


goBack() {
window.history.back();
}


verPerfil() {
this.router.navigate(['/profile']);
}


ayuda() {
this.router.navigate(['/ayuda']);
}


cerrarSesion() {
console.log('Sesión cerrada');
this.TokenSerivice.removeToken();
this.TokenSerivice.removeUsuario();
this.router.navigate(['/login']);
}
}