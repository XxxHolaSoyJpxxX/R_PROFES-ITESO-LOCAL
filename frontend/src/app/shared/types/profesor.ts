// Types basados en la API real

export interface Rol {
  id: string;
  rol: string;
}

export interface Profesor {
  expediente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_de_nacimiento: string;
  email: string;
  rol: Rol;
  activo: number;
  imagen: string | null;
}

export interface ProfesorListItem extends Profesor {
  nombreCompleto: string;
  profesorImagen: string;
  departamento?: string;
  calificacionGeneral?: number;
}

export interface Modalidad {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Departamento {
  id: string;
  nombre: string;
  descripcion: string;
  coordinador: string;
  area_academica_id: string;
  area_academica_nombre: string;
  coordinador_nombre: string;
}

export interface DepartamentoCarrera {
  id: string;
  nombre: string;
}

export interface Carrera {
  id: string;
  nombre: string;
  departamento: DepartamentoCarrera;
  activo: number;
}

export interface ProfesorCurso extends Profesor {
  curso_profesor_id: string;
  periodo: string;
}

export interface Curso {
  id: string;
  nombre: string;
  creditos: number;
  activo: number;
  departamento_id: string;
  modalidad: Modalidad;
  departamento: Departamento;
  profesores: ProfesorCurso[];
  carreras: Carrera[];
  periodo: string;
  curso_profesor_id: string;
}

export interface CursoProfesor {
  cursoId: string;
  cursoNombre: string;
  periodo: string;
  creditos: number;
  calificacion?: number;
}

export interface Recurso {
  id: string;
  titulo: string;
  url: string;
  profesor_expediente: string;
  fecha_subida: string;
  signedUrl: string;
}

export interface ProfesorDetalle extends Profesor {
  nombreCompleto: string;
  profesorImagen: string;
  titulo?: string;
  telefono?: string;
  departamento?: string;
  calificacionGeneral?: number;
  totalEvaluaciones?: number;
  formacionAcademica?: FormacionAcademica[];
  areasEspecializacion?: string[];
  publicaciones?: Publicacion[];
  biografia?: string;
}

export interface FormacionAcademica {
  grado: string;
  institucion: string;
  anio?: number;
}

export interface Publicacion {
  titulo: string;
  revista: string;
  anio: number;
  autores?: string;
}

export interface EvaluacionCurso {
  cursoId: string;
  cursoNombre: string;
  profesorNombre: string;
  periodo: string;
  calificacionPromedio: number;
  totalEvaluaciones: number;
  distribucionCalificaciones: {
    [key: string]: number;
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  categorias: {
    dominio: number;
    claridad: number;
    disponibilidad: number;
    material: number;
    evaluacion: number;
  };
}

export interface Comentario {
  id: string;
  estudianteNombre: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  periodo: string;
  helpful?: number;
}