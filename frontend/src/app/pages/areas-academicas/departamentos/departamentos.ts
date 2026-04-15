import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Departamento } from '../../../shared/services/departamento';
import { Departamento as IDepartamento } from '../../../shared/types/departamento';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-departamentos',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './departamentos.html',
  styleUrl: './departamentos.scss',
})
export class Departamentos implements OnInit, OnChanges {
  @Input() areaId!: string;
  departamentos: IDepartamento[] = [];
  filtered: IDepartamento[] = [];
  selected: IDepartamento | null = null;
  selectedForDetails: IDepartamento | null = null;

  constructor(
    private departamentosService: Departamento,
    private router: Router
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['areaId']) {
      this.selected = null;
      if (this.areaId) {
        this.loadDepartamentos();
      }
    }
  }
  ngOnInit(): void {
    if (this.areaId) {
      this.loadDepartamentos();
    }
  }
  loadDepartamentos(): void {
    this.departamentosService.fetchDepartamentosFromApi(this.areaId).subscribe({
      next: (data) => {
        this.departamentos = data;
        this.filtered = [...this.departamentos];
      },
      error: (err) => {
        console.error('Error al cargar los departamentos:', err);
      }
    });
  }

  selectDept(dep: IDepartamento) {
    this.selected = dep;
    if (dep && dep.id) {
      this.router.navigate(['/cursos', dep.id]);
      console.log(`Navegando a Cursos para Departamento ID: ${dep.id}`);
    }
    else {
      console.error('Departamento o ID inválido:', dep);
    }
  }
  toggleDescription(dep: IDepartamento) {
    if (this.selectedForDetails && this.selectedForDetails.id === dep.id) {
      this.selectedForDetails = null;
    } else {
      this.selectedForDetails = dep;
    }
    this.selected = null;
  }
  goToCursos(dep: IDepartamento) {
    if (dep && dep.id) {
      this.router.navigate(['/cursos', dep.id]);
    }
  }
}


