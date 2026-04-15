import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { fixResponseEncodingPipe } from '../../utils/rx-ops.operator'; 
import { Curso as ICurso } from '../types/curso';

@Injectable({
  providedIn: 'root',
})
export class Curso {

  readonly DEFAULT_IMAGE_URL = 'assets/images/Iteso.jpg'; 
  constructor(private http: HttpClient) {}
  fetchCursosFromApi(departamentoId: string): Observable<ICurso[]> { 
    return this.http.get<ICurso[]>('api/cursos').pipe(
      fixResponseEncodingPipe(),
      map((cursos: ICurso[]) => {
        
        const processedCursos = cursos.map(curso => ({
          ...curso, 
          modalidadNombre: curso.modalidad.nombre,
          departamentoNombre: curso.departamento.nombre,
          areaAcademicaNombre: curso.departamento.area_academica_nombre,
          coordinadorNombre: curso.departamento.coordinador_nombre,
          image: (curso as any).image || this.DEFAULT_IMAGE_URL 
        })) as ICurso[]; 
        const filteredCursos = processedCursos.filter(curso => 
          curso.departamento_id === departamentoId
        );
        return filteredCursos;
      })
    );
  }
}
