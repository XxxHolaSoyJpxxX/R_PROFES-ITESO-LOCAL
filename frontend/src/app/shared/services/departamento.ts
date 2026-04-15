import { Injectable } from '@angular/core';
import { Departamento as IDepartamento } from '../types/departamento';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { fixResponseEncodingPipe } from '../../utils/rx-ops.operator'; 

@Injectable({
  providedIn: 'root',
})
export class Departamento {
  constructor(private http: HttpClient) {}
  
  fetchDepartamentosFromApi(areaId: string): Observable<IDepartamento[]> { 
    return this.http.get<IDepartamento[]>('api/departamentos-academicos').pipe(
      fixResponseEncodingPipe(),
      map((list: IDepartamento[]) => {
        const filteredList = list.filter(d => d.area_academica_id === areaId);
        console.log('Departamentos filtrados:', filteredList); 
        return filteredList;
      })
    );
  }
} 