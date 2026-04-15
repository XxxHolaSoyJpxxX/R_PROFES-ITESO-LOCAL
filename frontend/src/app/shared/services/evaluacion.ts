import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluacionFormData, EvaluacionResponse, InscripcionInfo } from '../types/evaluacion';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionService {
  private baseUrl = '/api/inscripciones';

  constructor(private http: HttpClient) {}

  submitEvaluacion(inscripcionId: string, cursoProfesorId: string, data: EvaluacionFormData): Observable<EvaluacionResponse> {
    const payload = {
      ...data,
      curso_profesor_id: cursoProfesorId
    };
    
    return this.http.post<EvaluacionResponse>(
      `${this.baseUrl}/${inscripcionId}/evaluaciones`,
      payload
    );
  }

  getInscripcionInfo(inscripcionId: string): Observable<InscripcionInfo> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          id: inscripcionId,
          curso_profesor_id: '1',
          profesorNombre: 'Fernando Casas',
          cursoNombre: 'Diseño UX/UI',
          codigoCurso: 'DUXUIFC'
        });
        observer.complete();
      }, 500);
    });
  }
}