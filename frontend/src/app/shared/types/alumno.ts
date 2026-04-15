// 1. Interfaces básicas (Hojas del árbol)
export interface IRol {
  id: string;
  rol: string;
  activo?: number;
}

export interface IDepartamento {
  id: string;
  nombre: string;
  activo: number;
}

export interface ICarrera {
  id: string;
  nombre: string;
  departamento: IDepartamento; 
  activo: number;
}

// 2. Definición del Profesor (que viene dentro del curso)
export interface IProfesor {
  expediente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_de_nacimiento: string;
  email: string;
  rol: IRol;
  activo: number;
  imagen: string;
}

// 3. Definición de la Materia/Curso base
export interface ICursoMateria {
  id: string;
  nombre: string;
  creditos: number;
  activo: number;
  departamento_id: string; // Nota: En tu JSON esto viene como string "1"
  modalidad: string;       // Nota: En tu JSON esto viene como string "1"
}

// 4. EL OBJETO CLAVE: La vinculación Profesor-Materia-Periodo
// Este es el objeto que viene dentro de "curso_profesor_id"
export interface ICursoProfesorVinculo {
  id: string;
  profesor_expediente: IProfesor; // Objeto completo del profesor
  curso_id: ICursoMateria;        // Objeto completo de la materia
  periodo: string;
}

// 5. El item principal dentro del array "cursos"
export interface ICursoAlumno {
  id: string; 
  // AQUI estaba el error anterior. No es string, es el objeto vinculo completo:
  curso_profesor_id: ICursoProfesorVinculo; 
  alumno_id: string;
  calificacion: number;
  activo: number; 
}

// 6. El objeto raíz (Respuesta del API)
export interface IAlumno {
  expediente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_de_nacimiento: string; 
  email: string;
  rol: IRol;
  imagen: string;
  carrera: ICarrera; 
  status: string;
  // El endpoint devuelve el alumno CON el array de cursos dentro
  cursos?: ICursoAlumno[]; 
}