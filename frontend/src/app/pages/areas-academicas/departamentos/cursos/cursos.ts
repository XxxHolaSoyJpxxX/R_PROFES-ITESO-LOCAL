import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Curso } from '../../../../shared/services/curso'; 
import { Curso as ICurso } from '../../../../shared/types/curso';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cursos',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss',
})
export class Cursos implements OnInit {
  departamentoId!: string;
  cursos: ICurso[] = [];
  filteredCursos: ICurso[] = [];
  selectedCurso: ICurso | null = null;
readonly DEFAULT_IMAGE_URL = 'assets/images/Iteso.jpg';
constructor(
    private route: ActivatedRoute,
    private cursoService: Curso,
    private router: Router
  ) {}
ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.departamentoId = params['departamentoId']; 
      console.log('Departamento ID recibido en Cursos:', this.departamentoId);
      if (this.departamentoId) {
        this.loadCursos(this.departamentoId);
      }
    });
  }

  loadCursos(departamentoId: string): void {
    this.cursoService.fetchCursosFromApi(departamentoId).subscribe({
      next: (data: ICurso[]) => {
        this.cursos = data.map(curso => ({
            ...curso,
            image: (curso as any).image || this.DEFAULT_IMAGE_URL 
        })) as ICurso[];
        this.filteredCursos = [...this.cursos];
        console.log(`Cursos cargados para ID ${departamentoId}:`, this.cursos);
      },
      error: (err) => {
        console.error('Error al cargar los cursos:', err);
      }
    });
  }
  
  selectCurso(curso: ICurso) {
    this.selectedCurso = curso;
  }
  clearSelectedCurso() {
    this.selectedCurso = null;
  }
goToClases(curso: ICurso) {
        if (curso && curso.id) {
            this.router.navigate(['/clases', curso.id]);
            console.log(`Navegando a Clases para Curso ID: ${curso.id}`);
        }
    }
}
