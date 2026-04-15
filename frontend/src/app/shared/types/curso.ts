export interface Curso {
    id: string;
    nombre: string;
    creditos: number;
    activo: number; 
    departamento_id: string; 

    departamento: { 
        id: string; 
        nombre: string; 
        descripcion: string;
        area_academica_id: string; 
        area_academica_nombre: string; 
        coordinador: string;
        coordinador_nombre: string;
    };
    modalidad: { 
        id: string; 
        nombre: string; 
        descripcion: string; 
    };
    
    modalidadNombre: string; 
    departamentoNombre: string; 
    areaAcademicaNombre: string; 
    coordinadorNombre: string;
    
    image?: string; 
}