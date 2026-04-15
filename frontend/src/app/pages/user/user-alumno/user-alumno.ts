import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Alumno } from '../../../shared/services/alumno';
import { Token } from '../../../shared/services/token';
import { IAlumno, ICursoAlumno } from '../../../shared/types/alumno';

@Component({
  selector: 'app-user-alumno',
  imports: [CommonModule],
  templateUrl: './user-alumno.html',
  styleUrl: './user-alumno.scss'
})
export class UserAlumno implements OnInit {
  alumno: IAlumno | null = null;
  cursos: ICursoAlumno[] = [];
  evaluaciones: any[] = [];
  loading = false;
  error: string | null = null;
  expediente: string | null = null;

  constructor(
    private router: Router,
    private alumnoService: Alumno,
    private tokenService: Token
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.expediente = this.tokenService.getUsuario();
    
    if (!this.expediente) {
      this.error = 'No se pudo obtener el expediente del usuario.';
      this.loading = false;
      return;
    }

    this.loadAlumnoData(this.expediente);
  }

  private loadAlumnoData(expediente: string): void {
    this.alumnoService.fetchAlumnoByExpediente(expediente)
      .pipe(
        catchError(err => {
          this.error = 'No se pudo obtener la información del alumno.';
          console.error('Error al obtener alumno:', err);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(alumno => {
        this.alumno = alumno;

        if (!this.alumno) {
          this.loading = false;
          if (!this.error) {
            this.error = 'No se encontró información del alumno.';
          }
          return;
        }

        // Cargar cursos del alumno
        this.alumnoService.fetchAlumnoCursos(expediente)
          .pipe(
            catchError(e => {
              console.error('Error al obtener cursos:', e);
              return of([]);
            })
          )
          .subscribe(c => {
            this.cursos = c || [];
            console.log('Cursos obtenidos:', this.cursos);
            this.loading = false;
            this.error = null;
          });
      });
  }

  public evaluarCurso(inscripcionId: string): void {
    // Navegar a la página de evaluación
    this.router.navigate(['/evaluacion', inscripcionId]);
  }

  public getNombreCompleto(): string {
    if (!this.alumno) return '';
    return `${this.alumno.nombre} ${this.alumno.apellido_paterno} ${this.alumno.apellido_materno || ''}`.trim();
  }

  public editarPerfil(): void {
    this.router.navigate(['/perfil', 'editar']);
  }
}