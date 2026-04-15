import { pool } from "../../config/sql.client";

// CREATE TABLE cursos_carreras (
//     id CHAR(36) NOT NULL,
//     carrera_id CHAR(36) NOT NULL,
//     curso_id CHAR(36) NOT NULL,
//     PRIMARY KEY (id)
// )

export interface CursoCarrera {
    id: string;
    carrera_id: string;
    curso_id: string;
}

const getCursosCarreras = async (): Promise<CursoCarrera[]> => {
    const query = 'SELECT * FROM cursos_carreras';
    const [rows] = await pool.query(query);
    return rows as CursoCarrera[];
}

const getCursosByCarreraID = async (carrera_id: string): Promise<CursoCarrera[]> => {
    const query = 'SELECT * FROM cursos_carreras WHERE carrera_id = ?';
    const values = [carrera_id];
    const [rows] = await pool.query(query, values);
    return rows as CursoCarrera[];
}

const getCarrerasByCursoID = async (curso_id: string): Promise<CursoCarrera[]> => {
    const query = 'SELECT * FROM cursos_carreras WHERE curso_id = ?';
    const values = [curso_id];
    const [rows] = await pool.query(query, values);
    return rows as CursoCarrera[];
}

const getCursoCarreraById = async (id: string): Promise<CursoCarrera | null> => {
    const query = 'SELECT * FROM cursos_carreras WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as CursoCarrera[];
    return results.length > 0 ? results[0] : null;
}

const createCursoCarrera = async (cursoCarrera: CursoCarrera) => {
    const query = `
    INSERT INTO
    cursos_carreras (id, carrera_id, curso_id) 
    VALUES (?, ?, ?)`;
    const values = [
        cursoCarrera.id,
        cursoCarrera.carrera_id,
        cursoCarrera.curso_id
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateCursoCarrera = async (id: string, cursoCarrera: Partial<CursoCarrera>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(cursoCarrera)) {
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
    UPDATE cursos_carreras 
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

export const CursoCarreraModel = {
    getCursosCarreras,
    getCursosByCarreraID,
    getCarrerasByCursoID,
    createCursoCarrera,
    updateCursoCarrera,
    getCursoCarreraById
};