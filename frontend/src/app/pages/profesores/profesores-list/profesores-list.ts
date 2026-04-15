import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../../shared/services/profesor';
import { ProfesorListItem } from '../../../shared/types/profesor';

@Component({
  selector: 'app-profesores-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './profesores-list.html',
  styleUrl: './profesores-list.scss'
})
export class ProfesoresList implements OnInit {
  profesores: ProfesorListItem[] = [];
  profesoresFiltrados: ProfesorListItem[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(
    private router: Router,
    private profesorService: ProfesorService
  ) {}

  ngOnInit(): void {
    this.loadProfesores();
  }

  loadProfesores(): void {
    this.isLoading = true;
    
    this.profesorService.getAllProfesores().subscribe({
      next: (data) => {
        this.profesores = data;
        this.profesoresFiltrados = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando profesores', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.profesoresFiltrados = this.profesores;
      return;
    }

    this.profesoresFiltrados = this.profesores.filter(profesor => 
      profesor.nombreCompleto.toLowerCase().includes(term) ||
      profesor.email.toLowerCase().includes(term) ||
      profesor.expediente.toLowerCase().includes(term)
    );
  }

  goToProfesor(expediente: string): void {
    this.router.navigate(['/profesores', expediente]);
  }

  getInitials(nombre: string): string {
    const names = nombre.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }
}