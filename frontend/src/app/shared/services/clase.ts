import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Profesor } from '../types/clase';
import { fixResponseEncodingPipe } from '../../utils/rx-ops.operator'; 

// Interfaz extendida con datos procesados
export interface ProfesorUI extends Profesor {
  nombreCompleto?: string;
  profesorImagen?: string;
}


@Injectable({
  providedIn: 'root',
})
export class Clase {
  private baseUrl = '/api/cursos';
   private DEFAULT_AVATAR = 'assets/images/Iteso.jpg';
  constructor(private http: HttpClient) { }

  // Versión mejorada con pipe y mapeo
  getProfesoresDeClase(cursoId: number): Observable<ProfesorUI[]> {
    const apiUrl = `${this.baseUrl}/${cursoId}/profesores`;
    return this.http.get<Profesor[]>(apiUrl).pipe(
      fixResponseEncodingPipe(),
      map((profesores: Profesor[]) => {
        return profesores.map(profesor => ({
          ...profesor,
          nombreCompleto: `${profesor.nombre} ${profesor.apellido_paterno} ${profesor.apellido_materno || ''}`.trim(),
          profesorImagen: profesor.imagen_url || this.DEFAULT_AVATAR,
        })) as ProfesorUI[];
      })
    );
  }


}