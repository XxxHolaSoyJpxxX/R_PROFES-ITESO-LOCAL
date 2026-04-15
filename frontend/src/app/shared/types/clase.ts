export interface Profesor {
  expediente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_de_nacimiento: string;
  email: string;
  rol: {
    id: number;
    rol: string;
    activo: number;
  };
  imagen_url: string;
  curso_profesor_id: number;
  periodo: {
    id: string;
    name: string;
  };
}