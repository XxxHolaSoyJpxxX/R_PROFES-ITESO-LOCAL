import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Profesor, 
  ProfesorListItem, 
  ProfesorDetalle, 
  Curso, 
  CursoProfesor,
  Recurso,
  EvaluacionCurso,
  Comentario
} from '../types/profesor';
import { fixResponseEncodingPipe } from '../../utils/rx-ops.operator';

@Injectable({
  providedIn: 'root',
})
export class ProfesorService {
  private baseUrl = '/api/profesores';
  private DEFAULT_AVATAR = '/assets/images/profile.png';

  constructor(private http: HttpClient) {}

  getAllProfesores(): Observable<ProfesorListItem[]> {
    return this.http.get<Profesor[]>(this.baseUrl).pipe(
      fixResponseEncodingPipe(),
      map((profesores: Profesor[]): ProfesorListItem[] => {
        return profesores.map((profesor): ProfesorListItem => ({
          ...profesor,
          nombreCompleto: `${profesor.nombre} ${profesor.apellido_paterno} ${profesor.apellido_materno || ''}`.trim(),
          profesorImagen: profesor.imagen || this.DEFAULT_AVATAR,
        }));
      })
    );
  }

  getProfesorDetalle(expediente: string): Observable<ProfesorDetalle> {
    return this.http.get<Profesor>(`${this.baseUrl}/${expediente}`).pipe(
      fixResponseEncodingPipe(),
      map((profesor: Profesor): ProfesorDetalle => ({
        ...profesor,
        nombreCompleto: `${profesor.nombre} ${profesor.apellido_paterno} ${profesor.apellido_materno || ''}`.trim(),
        profesorImagen: profesor.imagen || this.DEFAULT_AVATAR,
        titulo: 'Profesor',
        totalEvaluaciones: 0,
      }))
    );
  }

  getCursosProfesor(expediente: string): Observable<CursoProfesor[]> {
    return this.http.get<Curso[]>(`${this.baseUrl}/${expediente}/cursos`).pipe(
      fixResponseEncodingPipe(),
      map((cursos: Curso[]): CursoProfesor[] => {
        return cursos.map((curso): CursoProfesor => ({
          cursoId: curso.id,
          cursoNombre: curso.nombre,
          periodo: curso.periodo,
          creditos: curso.creditos,
        }));
      })
    );
  }

  getCursoDetalle(expediente: string, cursoId: string): Observable<Curso> {
    return this.http.get<Curso[]>(`${this.baseUrl}/${expediente}/cursos/${cursoId}`).pipe(
      fixResponseEncodingPipe(),
      map((cursos: Curso[]) => cursos[0])
    );
  }

  getRecursosProfesor(expediente: string): Observable<Recurso[]> {
    console.log('cargando recursos')
    return this.http.get<any[]>(`${this.baseUrl}/${expediente}/recursos`).pipe(
    fixResponseEncodingPipe(),
    map((response: any[]) => {
      console.log('respuesta:',response)
      return response.map(item => {
        const data = item._doc || item; 
        console.log('data llegada:',data)
        return {
          id: data._id || item.id,
          titulo: data.nombre || item.nombre || 'Recurso sin nombre',
          url: data.url || item.url,
          profesor_expediente: data.profesor_expediente || item.profesor_expediente,
          fecha_subida: data.createdAt || item.createdAt,
          signedUrl: item.signedUrl || data.signedUrl
        } as Recurso;
      });
    })
  );
  }
  getEvaluacionCurso(expediente: string, cursoId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${expediente}/curso/${cursoId}/evaluaciones`).pipe(
      fixResponseEncodingPipe()
    );
  }

  getComentariosCurso(expediente: string, cursoId: string): Observable<Comentario[]> {
    return this.getEvaluacionCurso(expediente, cursoId).pipe(
      map((evaluaciones: any[]) => {
        return evaluaciones.map((ev: any) => ({
          id: ev.id,
          estudianteNombre: ev.nombre||'Estudiante Anónimo', 
          calificacion: this.calcularPromedioEvaluacion(ev),
          comentario: ev.comentario || '',
          fecha: ev.fecha_evaluacion || new Date().toISOString(),
          periodo: ev.periodo || 'N/A',
          helpful: 0
        }));
      })
    );
  }

  private calcularPromedioEvaluacion(evaluacion: any): number {
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
      evaluacion.claridad_explicacion_p5,
      evaluacion.estilo_personalidad_p1,
      evaluacion.estilo_personalidad_p2,
      evaluacion.estilo_personalidad_p3,
      evaluacion.estilo_personalidad_p4
    ].filter(p => p !== null && p !== undefined);

    const suma = preguntas.reduce((acc, p) => acc + p, 0);
    return preguntas.length > 0 ? suma / preguntas.length : 0;
  }
}