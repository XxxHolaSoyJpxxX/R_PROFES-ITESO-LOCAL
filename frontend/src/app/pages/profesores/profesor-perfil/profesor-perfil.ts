import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfesorService } from '../../../shared/services/profesor';
import { ProfesorDetalle, CursoProfesor,Recurso } from '../../../shared/types/profesor';

@Component({
  selector: 'app-profesor-perfil',
  imports: [CommonModule],
  templateUrl: './profesor-perfil.html',
  styleUrl: './profesor-perfil.scss'
})
export class ProfesorPerfil implements OnInit {
  expediente: string | null = null;
  profesor: ProfesorDetalle | null = null;
  cursosActivos: CursoProfesor[] = [];
  isLoading = true;
  error: string | null = null;
  recursos: Recurso[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profesorService: ProfesorService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.expediente = params.get('id');
      if (this.expediente) {
        this.loadProfesorDetalle(this.expediente);
        this.loadCursosProfesor(this.expediente);
        this.loadRecursosProfesor(this.expediente);
      } else {
        this.error = 'No se proporcionó un ID de profesor válido';
        this.isLoading = false;
      }
    });

  }

  loadProfesorDetalle(expediente: string): void {
    this.isLoading = true;
    
    this.profesorService.getProfesorDetalle(expediente).subscribe({
      next: (data) => {
        this.profesor = data;
        this.isLoading = false;
        console.log('Profesor detalle loaded:', this.profesor);
      },
      error: (err) => {
        console.error('Error cargando profesor', err);
        this.error = 'Error al cargar el perfil del profesor';
        this.isLoading = false;
      }
    });
  }

  loadCursosProfesor(expediente: string): void {
    this.profesorService.getCursosProfesor(expediente).subscribe({
      next: (data) => {
        this.cursosActivos = data;
        console.log('Cursos del profesor cargados:', this.cursosActivos);
      },
      error: (err) => {
        console.error('Error cargando cursos', err);
      }
    });
  }

  goToCursoEvaluacion(cursoId: string): void {
    if (this.expediente) {
      this.router.navigate(['/profesores', this.expediente, 'curso', cursoId]);
    }
  }

  loadRecursosProfesor(expediente: string): void{
    this.profesorService.getRecursosProfesor(expediente).subscribe({
      next:(data) => {
        this.recursos = data;
        console.log('Recursos cargados:',this.recursos)
      },
      error: (err) =>{
        console.error('Error cargardo Recursos',err)
      }
    })
  }

  goBack(): void {
    this.router.navigate(['/profesores']);
  }

  getInitials(nombre: string): string {
    const names = nombre.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  getRatingStars(rating: number): boolean[] {
    return Array(5).fill(true).map((_, i) => i < Math.round(rating));
  }
}