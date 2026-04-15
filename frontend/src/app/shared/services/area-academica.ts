import { Injectable } from '@angular/core';
import { AreaAcademica as IAreaAcademica } from '../types/area-academica';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fixResponseEncodingPipe } from '../../utils/rx-ops.operator';


@Injectable({
  providedIn: 'root',
})
export class AreaAcademica {
  constructor(private http: HttpClient) {}

  fetchAreasFromApi(): Observable<IAreaAcademica[]> {
    return this.http.get<IAreaAcademica[]>('api/areas-academicas').pipe(
      fixResponseEncodingPipe()
    );
  }

}