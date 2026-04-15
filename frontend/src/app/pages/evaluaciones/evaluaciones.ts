import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionService } from '../../shared/services/evaluacion';
import { EvaluacionFormData, InscripcionInfo } from '../../shared/types/evaluacion';

@Component({
  selector: 'app-evaluaciones',
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluaciones.html',
  styleUrl: './evaluaciones.scss',
})
export class Evaluaciones implements OnInit {
   inscripcionId: string | null = null;
  inscripcionInfo: InscripcionInfo | null = null;
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  
  currentSection = 1;
  totalSections = 3;

  formData: EvaluacionFormData = {
    interaccion_evaluacion_p1: null,
    interaccion_evaluacion_p2: null,
    interaccion_evaluacion_p3: null,
    interaccion_evaluacion_p4: null,
    interaccion_evaluacion_p5: null,
    claridad_explicacion_p1: null,
    claridad_explicacion_p2: null,
    claridad_explicacion_p3: null,
    claridad_explicacion_p4: null,
    claridad_explicacion_p5: null,
    estilo_personalidad_p1: null,
    estilo_personalidad_p2: null,
    estilo_personalidad_p3: null,
    estilo_personalidad_p4: null,
    comentario: ''
  };

  seccion1Preguntas = [
    { key: 'interaccion_evaluacion_p1', texto: '¿Cómo calificarías tu experiencia general con el profesor en este curso?' },
    { key: 'interaccion_evaluacion_p2', texto: '¿Qué tan bien preparado y conocedor consideras al profesor en la materia que impartió?' },
    { key: 'interaccion_evaluacion_p3', texto: '¿Qué tan bien interactuó el profesor contigo y con el resto de los estudiantes durante el curso?' },
    { key: 'interaccion_evaluacion_p4', texto: '¿Qué tan puntual fue el profesor en las clases y actividades programadas?' },
    { key: 'interaccion_evaluacion_p5', texto: '¿Qué tan atento fue el profesor a tus dudas y necesidades como alumno?' }
  ];

  seccion2Preguntas = [
    { key: 'claridad_explicacion_p1', texto: '¿Qué tan claro consideras que fue el curso en general, en cuanto a los temas presentados por el profesor?' },
    { key: 'claridad_explicacion_p2', texto: '¿Qué tan claro fue el profesor al explicar los temas y conceptos durante las clases?' },
    { key: 'claridad_explicacion_p3', texto: '¿Qué tan fluido fue el profesor al explicar los temas durante las clases?' },
    { key: 'claridad_explicacion_p4', texto: '¿Qué tan útil y constructiva consideras la retroalimentación proporcionada por el profesor?' },
    { key: 'claridad_explicacion_p5', texto: '¿En qué medida consideras que el profesor fue efectivo para resolver tus dudas durante el curso?' }
  ];

  seccion3Preguntas = [
    { key: 'estilo_personalidad_p1', texto: '¿Qué tan equilibrado fue el enfoque del profesor entre teoría y práctica?', labels: { min: 'Muy Teórico', max: 'Muy Práctico' } },
    { key: 'estilo_personalidad_p2', texto: '¿Qué tan estricto o relajado consideras al profesor en su manera de manejar el curso?', labels: { min: 'Muy Estricto', max: 'Muy Relajado' } },
    { key: 'estilo_personalidad_p3', texto: '¿Cómo calificarías la personalidad del profesor durante el curso?', labels: { min: 'Muy Negativo', max: 'Muy Positivo' } },
    { key: 'estilo_personalidad_p4', texto: '¿Qué tan introvertido o extrovertido consideras al profesor?', labels: { min: 'Muy Intrv.', max: 'Muy Extrv.' } }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionService: EvaluacionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.inscripcionId = params.get('id');
      if (this.inscripcionId) {
        this.loadInscripcionInfo(this.inscripcionId);
      } else {
        this.error = 'No se proporcionó un ID de inscripción válido';
        this.isLoading = false;
      }
    });
  }

  loadInscripcionInfo(id: string): void {
    this.isLoading = true;
    
    this.evaluacionService.getInscripcionInfo(id).subscribe({
      next: (data) => {
        this.inscripcionInfo = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando información', err);
        this.error = 'Error al cargar la información de la inscripción';
        this.isLoading = false;
      }
    });
  }

  setRating(key: string, value: number): void {
    (this.formData as any)[key] = value;
  }

  getRating(key: string): number | null {
    return (this.formData as any)[key];
  }

  canGoNext(): boolean {
    if (this.currentSection === 1) {
      return this.seccion1Preguntas.every(p => this.getRating(p.key) !== null);
    } else if (this.currentSection === 2) {
      return this.seccion2Preguntas.every(p => this.getRating(p.key) !== null);
    } else if (this.currentSection === 3) {
      const allQuestionsAnswered = this.seccion3Preguntas.every(p => this.getRating(p.key) !== null);
      const hasComment = this.formData.comentario.trim().length > 0;
      return allQuestionsAnswered && hasComment;
    }
    return false;
  }

  canSubmit(): boolean{
  const s1Completa = this.seccion1Preguntas.every(p => this.getRating(p.key) !== null);
  const s2Completa = this.seccion2Preguntas.every(p => this.getRating(p.key) !== null);
  const s3Completa = this.seccion3Preguntas.every(p => this.getRating(p.key) !== null);
  const tieneComentario = !!this.formData.comentario && this.formData.comentario.trim().length > 0;

  return s1Completa && s2Completa && s3Completa && tieneComentario;
  }

  nextSection(): void {
    if (this.canGoNext() && this.currentSection < this.totalSections) {
      this.currentSection++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousSection(): void {
    if (this.currentSection > 1) {
      this.currentSection--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitEvaluacion(): void {
    if (!this.canGoNext() || !this.inscripcionInfo) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.evaluacionService.submitEvaluacion(
      this.inscripcionInfo.id,
      this.inscripcionInfo.curso_profesor_id,
      this.formData
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        alert('¡Evaluación enviada exitosamente!');
        this.router.navigate(['/profile']); 
      },
      error: (err) => {
        console.error('Error al enviar evaluación', err);
        this.error = 'Error al enviar la evaluación. Por favor, intenta de nuevo.';
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  getRemainingChars(): number {
    return 3000 - this.formData.comentario.length;
  }
}

