import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../../shared/services/profesor';
import { Comentario } from '../../../shared/types/profesor';

@Component({
  selector: 'app-profesor-curso-evaluacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './profesor-curso-evaluacion.html',
  styleUrl: './profesor-curso-evaluacion.scss'
})
export class ProfesorCursoEvaluacion implements OnInit {
  profesorId: string | null = null;
  cursoId: string | null = null;
  evaluacionesRaw: any[] = [];
  comentarios: Comentario[] = [];
  isLoading = true;
  error: string | null = null;

  evaluacion: any = null;

  filtroCalificacion: string = 'todas';
  ordenComentarios: string = 'recientes';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profesorService: ProfesorService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.profesorId = params.get('id');
      this.cursoId = params.get('cursoId');
      
      if (this.profesorId && this.cursoId) {
        this.loadEvaluaciones();
      } else {
        this.error = 'Parámetros inválidos';
        this.isLoading = false;
      }
    });
  }

  loadEvaluaciones(): void {
    this.isLoading = true;

    this.profesorService.getCursoDetalle(this.profesorId!, this.cursoId!).subscribe({
      next: (curso) => {
        const cursoNombre = curso.nombre || 'Curso';
        const profesorNombre = curso.profesores && curso.profesores.length > 0 
          ? `${curso.profesores[0].nombre} ${curso.profesores[0].apellido_paterno} ${curso.profesores[0].apellido_materno || ''}`.trim()
          : 'Profesor';

        this.profesorService.getEvaluacionCurso(this.profesorId!, this.cursoId!).subscribe({
          next: (data) => {
            this.evaluacionesRaw = data;
            this.procesarEvaluaciones(cursoNombre, profesorNombre);
            this.loadComentarios();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error cargando evaluación', err);
            this.error = 'Error al cargar la evaluación';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error cargando curso', err);
        this.error = 'Error al cargar la información del curso';
        this.isLoading = false;
      }
    });
  }

  procesarEvaluaciones(cursoNombre: string, profesorNombre: string): void {
    if (this.evaluacionesRaw.length === 0) {
      this.error = 'No hay evaluaciones disponibles para este curso';
      return;
    }


    const totalEvaluaciones = this.evaluacionesRaw.length;
    

    const categorias = {
      dominio: this.calcularPromedio(['interaccion_evaluacion_p2']),
      claridad: this.calcularPromedio([
        'claridad_explicacion_p1',
        'claridad_explicacion_p2',
        'claridad_explicacion_p3'
      ]),
      disponibilidad: this.calcularPromedio([
        'interaccion_evaluacion_p3',
        'interaccion_evaluacion_p5'
      ]),
      material: this.calcularPromedio([
        'claridad_explicacion_p4'
      ]),
      evaluacion: this.calcularPromedio([
        'claridad_explicacion_p5'
      ])
    };

    const todasLasPreguntas = [
      'interaccion_evaluacion_p1',
      'interaccion_evaluacion_p2',
      'interaccion_evaluacion_p3',
      'interaccion_evaluacion_p4',
      'interaccion_evaluacion_p5',
      'claridad_explicacion_p1',
      'claridad_explicacion_p2',
      'claridad_explicacion_p3',
      'claridad_explicacion_p4',
      'claridad_explicacion_p5'
    ];
    const calificacionPromedio = this.calcularPromedio(todasLasPreguntas);

    const distribucion: { [key: string]: number } = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    
    this.evaluacionesRaw.forEach(ev => {
      const promedio = this.calcularPromedioEvaluacion(ev);
      const redondeado = Math.round(promedio);
      if (redondeado >= 1 && redondeado <= 5) {
        distribucion[redondeado.toString()]++;
      }
    });

    this.evaluacion = {
      cursoId: this.cursoId,
      cursoNombre: cursoNombre,
      profesorNombre: profesorNombre,
      periodo: this.evaluacionesRaw[0]?.periodo || 'N/A',
      calificacionPromedio: calificacionPromedio,
      totalEvaluaciones: totalEvaluaciones,
      distribucionCalificaciones: distribucion,
      categorias: categorias
    };
  }

  calcularPromedio(campos: string[]): number {
    let suma = 0;
    let count = 0;

    this.evaluacionesRaw.forEach(ev => {
      campos.forEach(campo => {
        const valor = ev[campo];
        if (valor !== null && valor !== undefined) {
          suma += valor;
          count++;
        }
      });
    });

    return count > 0 ? suma / count : 0;
  }

  calcularPromedioEvaluacion(evaluacion: any): number {
    const preguntas = [
      evaluacion.interaccion_evaluacion_p1,
      evaluacion.interaccion_evaluacion_p2,
      evaluacion.interaccion_evaluacion_p3,
      evaluacion.interaccion_evaluacion_p4,
      evaluacion.interaccion_evaluacion_p5,
      evaluacion.claridad_explicacion_p1,
      evaluacion.claridad_explicacion_p2,
      evaluacion.claridad_explicacion_p3,
      evaluacion.claridad_explicacion_p4,
      evaluacion.claridad_explicacion_p5
    ].filter(p => p !== null && p !== undefined);

    const suma = preguntas.reduce((acc, p) => acc + p, 0);
    return preguntas.length > 0 ? suma / preguntas.length : 0;
  }

  loadComentarios(): void {

    this.comentarios = this.evaluacionesRaw.map(ev => ({
      id: ev.id,
      estudianteNombre: 'Estudiante Anónimo',
      calificacion: this.calcularPromedioEvaluacion(ev),
      comentario: ev.comentario || 'Sin comentarios',
      fecha: ev.fecha_evaluacion || new Date().toISOString(),
      periodo: ev.periodo || 'N/A',
      helpful: 0
    }));

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let comentariosFiltrados = [...this.comentarios];

    if (this.filtroCalificacion !== 'todas') {
      const rating = parseInt(this.filtroCalificacion);
      comentariosFiltrados = comentariosFiltrados.filter(c => 
        Math.round(c.calificacion) === rating
      );
    }

    if (this.ordenComentarios === 'recientes') {
      comentariosFiltrados.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    } else if (this.ordenComentarios === 'antiguos') {
      comentariosFiltrados.sort((a, b) => 
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
    } else if (this.ordenComentarios === 'mejores') {
      comentariosFiltrados.sort((a, b) => b.calificacion - a.calificacion);
    } else if (this.ordenComentarios === 'peores') {
      comentariosFiltrados.sort((a, b) => a.calificacion - b.calificacion);
    }

    this.comentarios = comentariosFiltrados;
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  getRatingStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.round(rating));
  }

  getBarWidth(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
  }

  goBack(): void {
    this.router.navigate(['/profesores', this.profesorId]);
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}