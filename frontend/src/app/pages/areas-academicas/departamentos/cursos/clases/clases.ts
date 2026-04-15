import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Clase, ProfesorUI } from '../../../../../shared/services/clase';

@Component({
  selector: 'app-clases',
  imports: [CommonModule],
  templateUrl: './clases.html',
  styleUrl: './clases.scss'
})
export class Clases implements OnInit {

  cursoId: number | null = null;
  profesores: ProfesorUI[] = [];
  isLoading = true;
  nombreCurso: string = 'Cargando...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claseService: Clase
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('cursoId');
      if (id) {
        this.cursoId = parseInt(id, 10);
        this.loadProfesores(this.cursoId);
        
      } else {
        this.isLoading = false;
        console.error('No se recibió cursoId');
      }
    });
  }

    loadProfesores(id: number): void {
    this.isLoading = true;
    
    this.claseService.getProfesoresDeClase(id).subscribe({
      next: (data) => {
        this.profesores = data;
        this.isLoading = false;
        if (data.length > 0) {
          this.nombreCurso = `Profesores del Curso ${id}`;
        } else {
          this.nombreCurso = `Curso ID: ${id} (Sin profesores asignados)`;
        }
        console.log('Profesores cargados:', this.profesores);
      },
      error: (err) => {
        console.error('Error cargando profesores', err);
        this.isLoading = false;
        this.nombreCurso = 'Error al cargar';
      }
    });
  }
  goToProfesor(expediente: string): void {
    if (expediente) {
      this.router.navigate(['/profesores', expediente]);
      console.log(`Navegando al perfil del profesor: ${expediente}`);
    }
  }

}