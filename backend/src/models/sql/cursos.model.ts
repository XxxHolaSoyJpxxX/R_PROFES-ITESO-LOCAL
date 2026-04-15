import { pool } from "../../config/sql.client";

// CREATE TABLE cursos (
//     id CHAR(36) NOT NULL,
//     nombre VARCHAR(255) NOT NULL,
//     creditos INT NOT NULL,
//     activo BOOLEAN NOT NULL,
//     departamento_id CHAR(36) NOT NULL,
//     modalidad CHAR(36) NOT NULL,
//     PRIMARY KEY (id)
// ) 

export interface Curso{
    id: string;
    nombre: string;
    creditos: number;
    activo: boolean;
    departamento_id: string;
    modalidad: string;
}

const getCursos = async (): Promise<Curso[]> => {
    const query = 'SELECT * FROM cursos';
    const [rows] = await pool.query(query);
    return rows as Curso[];
}

const getCursoById = async (id: string): Promise<Curso | null> => {
    const query = 'SELECT * FROM cursos WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as Curso[];
    return results.length > 0 ? results[0] : null;
}

const createCurso = async (curso: Curso) => {
    const query = `
    INSERT INTO 
    cursos (id, nombre, creditos, activo, departamento_id, modalidad) 
    VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
        curso.id,
        curso.nombre,
        curso.creditos,
        curso.activo,
        curso.departamento_id,
        curso.modalidad
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateCurso = async (id: string, curso: Partial<Curso>) => {
    // Build set clause excluding undefined values and the id field
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(curso)) {
        if (key === 'id') continue;
        if (value === undefined) continue;
        fields.push(`${key} = ?`);
        values.push(value);
    }

    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }

    values.push(id);

    const query = `
    UPDATE cursos
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

const deleteCurso = async (id: string) => {
    const query = "UPDATE cursos SET activo = false WHERE id = ?";
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const CursoModel = {
    getCursos,
    getCursoById,
    createCurso,
    updateCurso,
    deleteCurso
};