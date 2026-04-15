import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Token } from '../../shared/services/token';
import { UserAlumno } from './user-alumno/user-alumno';
import { UserProfesor } from './user-profesor/user-profesor';


@Component({
  selector: 'app-user',
  imports: [CommonModule,UserAlumno, UserProfesor],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User implements OnInit {
  userRole: 'ALUMNO' | 'PROFESOR' | null = null;
  loading = true;
  error: string | null = null;

  constructor(private tokenService: Token) {}

  ngOnInit(): void {
    try {
      // Obtener el rol del localStorage
      const rol = this.tokenService.getRol();
      
      if (!rol) {
        this.error = 'No se encontró información de rol en la sesión.';
        this.loading = false;
        return;
      }

      // Normalizar el rol a mayúsculas
      const rolNormalizado = rol.toUpperCase();
      
      if (rolNormalizado === 'ALUMNO' || rolNormalizado === 'PROFESOR') {
        this.userRole = rolNormalizado;
      } else {
        this.error = `Rol no reconocido: ${rol}`;
      }

      this.loading = false;
    } catch (err) {
      console.error('Error al determinar el rol:', err);
      this.error = 'Error al cargar la información del usuario.';
      this.loading = false;
    }
  }
  }
