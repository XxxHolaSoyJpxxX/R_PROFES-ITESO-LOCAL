export interface EvaluacionFormData {

  interaccion_evaluacion_p1: number | null; // Experiencia general
  interaccion_evaluacion_p2: number | null; // Preparación del profesor
  interaccion_evaluacion_p3: number | null; // Interacción con estudiantes
  interaccion_evaluacion_p4: number | null; // Puntualidad
  interaccion_evaluacion_p5: number | null; // Atención a dudas


  claridad_explicacion_p1: number | null; // Claridad general del curso
  claridad_explicacion_p2: number | null; // Claridad al explicar
  claridad_explicacion_p3: number | null; // Fluidez al explicar
  claridad_explicacion_p4: number | null; // Retroalimentación útil
  claridad_explicacion_p5: number | null; // Efectividad resolviendo dudas

  estilo_personalidad_p1: number | null; // Teoría vs Práctica (1=Muy Teórico, 5=Muy Práctico)
  estilo_personalidad_p2: number | null; // Estricto vs Relajado (1=Muy Estricto, 5=Muy Relajado)
  estilo_personalidad_p3: number | null; // Personalidad (1=Negativo, 5=Positivo)
  estilo_personalidad_p4: number | null; // Introvertido vs Extrovertido (1=Muy Intro, 5=Muy Extra)

  comentario: string;
}

export interface InscripcionInfo {
  id: string;
  curso_profesor_id: string;
  profesorNombre: string;
  cursoNombre: string;
  codigoCurso: string;
}

export interface EvaluacionResponse {
  success: boolean;
  message: string;
  evaluacionId?: string;
}