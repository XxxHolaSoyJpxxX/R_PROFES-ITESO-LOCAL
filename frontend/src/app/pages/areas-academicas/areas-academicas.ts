import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaAcademica } from '../../shared/services/area-academica';
import { AreaAcademica as IAreaAcademica } from '../../shared/types/area-academica';
import { Router } from '@angular/router';
import { Departamentos } from './departamentos/departamentos';
@Component({
  selector: 'app-departametos',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    Departamentos
  ],
  templateUrl: './areas-academicas.html',
  styleUrl: './areas-academicas.scss',
})
export class AreasAcademicas implements OnInit {
  readonly DEFAULT_IMAGE_URL = 'assets/images/Iteso.jpg';
  areas: IAreaAcademica[] = [];
  filtered: IAreaAcademica[] = [];
  selectedArea: IAreaAcademica | null = null;

  searchText = '';
  sortBy = 'name';

  constructor(private AreasAcademicasService: AreaAcademica, private router: Router) { }
  imageMap: { [key: string]: string } = {
  'Ingeniería': 'https://worldcampus.saintleo.edu/img/article/que-hace-un-ingeniero-de-software.webp',
  'Humanidades': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
  'Negocios': 'https://images.unsplash.com/photo-1522199710521-72d69614c702',
};

  ngOnInit(): void {
    this.AreasAcademicasService.fetchAreasFromApi().subscribe({
        next: (data) => {
            this.areas = data.map(area => ({
                ...area,
                image: this.imageMap[area.nombre] || this.DEFAULT_IMAGE_URL
              }));
            console.log('Datos recibidos de la API:', this.areas);
            this.filtered = [...this.areas]; 
            console.log('Datos de la API cargados con éxito.');
        },
        error: (err) => {
            console.error('Error al cargar datos de la API:', err);
        }
    });
  }
  selectAreas(areas: IAreaAcademica) {
    this.selectedArea = areas;
  }
  
  goToArea(area: any) {
    this.router.navigate(['/departamentos', area.id]);
    console.log(area.id);
  }

}