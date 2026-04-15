import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fixResponseEncodingPipe } from '../../utils/rx-ops.operator';
import { IAlumno, ICursoAlumno } from '../types/alumno';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Alumno {
  constructor(private http: HttpClient) {}

  fetchAlumnoByExpediente(expediente: string): Observable<IAlumno> {
    return this.http.get<IAlumno>(`api/alumnos/${expediente}`).pipe(fixResponseEncodingPipe());
  }

fetchAlumnoCursos(expediente: string): Observable<ICursoAlumno[]> {
    return this.http.get<IAlumno>(`api/alumnos/${expediente}/cursos`).pipe(
      fixResponseEncodingPipe(),
      map((alumnoData: IAlumno) => {
        return alumnoData.cursos || []; 
      })
    );
  }
  fetchAlumnoEvaluaciones(expediente: string): Observable<any[]> {
    return this.http.get<any[]>(`api/alumnos/${expediente}/evaluaciones`).pipe(fixResponseEncodingPipe());
  }
}
