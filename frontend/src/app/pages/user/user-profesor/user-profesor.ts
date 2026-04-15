import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfesorService } from '../../../shared/services/profesor';
import { Token } from '../../../shared/services/token';
import { ProfesorDetalle, CursoProfesor, Recurso} from '../../../shared/types/profesor';


@Component({
  selector: 'app-user-profesor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profesor.html',
  styleUrl: './user-profesor.scss'
})
export class UserProfesor implements OnInit {
  profesor: ProfesorDetalle | null = null;
  cursosImpartidos: CursoProfesor[] = [];
  loading = false;
  error: string | null = null;
  expediente: string | null = null;
  recursos: Recurso[] = [];

  // Upload de archivos
  nombreRecurso: string = '';
  isUploadingFile = false;
  previewUrl: string = '';
  selectedFile: File | null = null;
  isDragOver = false;
  showUploadModal = false;

  constructor(
    private router: Router,
    private profesorService: ProfesorService,
    private tokenService: Token,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.expediente = this.tokenService.getUsuario();
    
    if (!this.expediente) {
      this.error = 'No se pudo obtener el expediente del usuario.';
      this.loading = false;
      return;
    }

    this.loadProfesorData(this.expediente);
    this.loadRecursosProfesor(this.expediente);
  }

  private loadProfesorData(expediente: string): void {
    this.profesorService.getProfesorDetalle(expediente)
      .pipe(
        catchError(err => {
          this.error = 'No se pudo obtener la información del profesor.';
          console.error('Error al obtener profesor:', err);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(profesor => {
        this.profesor = profesor;

        if (!this.profesor) {
          this.loading = false;
          if (!this.error) {
            this.error = 'No se encontró información del profesor.';
          }
          return;
        }

        // Cargar cursos que imparte
        this.profesorService.getCursosProfesor(expediente)
          .pipe(
            catchError(e => {
              console.error('Error al obtener cursos:', e);
              return of([]);
            })
          )
          .subscribe(cursos => {
            this.cursosImpartidos = cursos || [];
            console.log('Cursos impartidos:', this.cursosImpartidos);
            this.loading = false;
            this.error = null;
          });
      });
  }

  // ============================================
  // FUNCIONES DE UPLOAD DE RECURSOS
  // ============================================
  
  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.clearFile();
  }

  onFileSelected(input: HTMLInputElement): void {
    if (input.files && input.files.length === 1) {
      const file = input.files[0];
      
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no debe superar los 10MB');
        return;
      }

      this.selectedFile = file;
      this.nombreRecurso = file.name;
      // Solo crear preview si es imagen
      if (file.type.startsWith('image/')) {
        if (this.previewUrl) {
          URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = URL.createObjectURL(file);
      } else {
        this.previewUrl = '';
      }
    }
  }

  triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }

  clearFile(): void {
    if (this.selectedFile) {
      this.selectedFile = null;
      this.previewUrl = '';
    }
  }

  // Drag and Drop
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;

    const files = e.dataTransfer?.files;
    
    if (files && files.length > 1) {
      alert('Solo puedes subir un archivo a la vez');
      return;
    }

    const file = files?.[0];

    if (file) {
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo no debe superar los 10MB');
        return;
      }

      this.selectedFile = file;
      this.nombreRecurso = file.name;
      // Solo crear preview si es imagen
      if (file.type.startsWith('image/')) {
        if (this.previewUrl) {
          URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = URL.createObjectURL(file);
      } else {
        this.previewUrl = '';
      }
    }
  }

  getFileIcon(): string {
    if (!this.selectedFile) return 'insert_drive_file';
    
    const type = this.selectedFile.type;
    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf') || extension === 'pdf') return 'picture_as_pdf';
    if (type.includes('word') || extension === 'doc' || extension === 'docx') return 'description';
    if (type.includes('excel') || extension === 'xls' || extension === 'xlsx') return 'table_chart';
    if (type.includes('powerpoint') || extension === 'ppt' || extension === 'pptx') return 'slideshow';
    if (type.includes('text') || extension === 'txt') return 'article';
    if (type.includes('zip') || extension === 'zip' || extension === 'rar') return 'folder_zip';
    
    return 'insert_drive_file';
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    
    const bytes = this.selectedFile.size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.expediente) return;

    this.isUploadingFile = true;
    const formData = new FormData();
    formData.append('archivo', this.selectedFile);
    formData.append('expediente', this.expediente);
    formData.append('nombre', this.nombreRecurso);
    this.http.post(`/api/profesores/${this.expediente}/recursos`, formData).subscribe({
      next: (response: any) => {
        alert('Archivo subido correctamente');
        this.isUploadingFile = false;
        this.closeUploadModal();
      },
      error: (err) => {
        console.error('Error al subir archivo:', err);
        alert('Ocurrió un error al subir el archivo. Intenta nuevamente.');
        this.isUploadingFile = false;
      }
    });
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  public verCursoDetalle(cursoId: string): void {
    this.router.navigate(['/profesores', this.expediente, 'curso', cursoId]);
  }

  public verEstadisticas(): void {
    //this.router.navigate(['/profesor', this.expediente, 'estadisticas']);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  public getNombreCompleto(): string {
    if (!this.profesor) return '';
    return `${this.profesor.nombre} ${this.profesor.apellido_paterno} ${this.profesor.apellido_materno || ''}`.trim();
  }

  public getInitials(): string {
    if (!this.profesor) return '';
    const nombre = this.profesor.nombre || '';
    const apellido = this.profesor.apellido_paterno || '';
    return (nombre[0] || '') + (apellido[0] || '');
  }

  ngOnDestroy(): void {
    // Limpiar el preview URL para evitar memory leaks
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

    loadRecursosProfesor(expediente: string): void{
    this.profesorService.getRecursosProfesor(expediente).subscribe({
      next:(data) => {
        this.recursos = data;
        console.log('Recursos cargados:',this.recursos)
      },
      error: (err) =>{
        console.error('Error cargardo Recursos',err)
      }
    })
  }
}