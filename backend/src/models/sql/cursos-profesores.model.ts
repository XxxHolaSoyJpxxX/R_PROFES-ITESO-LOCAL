import { pool } from "../../config/sql.client";

// CREATE TABLE cursos_profesores (
//     id CHAR(36) NOT NULL,
//     profesor_expediente CHAR(36) NOT NULL,
//     curso_id CHAR(36) NOT NULL,
//     periodo CHAR(36) NOT NULL,
//     PRIMARY KEY (id)
// ) 

export interface CursoProfesor {
    id: string;
    profesor_expediente: string;
    curso_id: string;
    periodo: string;
}

const getAllCursosProfesores = async (): Promise<CursoProfesor[]> => {
    const query = 'SELECT * FROM cursos_profesores';
    const [rows] = await pool.query(query);
    return rows as CursoProfesor[];
}

const getCursoProfesorByID = async (id: string): Promise<CursoProfesor | null> => {
    const query = 'SELECT * FROM cursos_profesores WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as CursoProfesor[];
    return results.length > 0 ? results[0] : null;
}

const getCursosByProfesorID = async (expediente: string): Promise<CursoProfesor[]> => {
    const query = 'SELECT * FROM cursos_profesores WHERE profesor_expediente = ?';
    const values = [expediente];
    const [rows] = await pool.query(query, values);
    return rows as CursoProfesor[];
}

const getCursosProfesoresByCursoID = async (id: string): Promise<CursoProfesor[]> => {
    const query = 'SELECT * FROM cursos_profesores WHERE curso_id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    return rows as CursoProfesor[];
}

const getCursoByProfesorExpedienteAndCursoID = async (profesor_expediente: string, curso_id: string): Promise<CursoProfesor[]> => {
    const query = 'SELECT * FROM cursos_profesores WHERE profesor_expediente = ? AND curso_id = ?';
    const values = [profesor_expediente, curso_id];
    const [rows] = await pool.query(query, values);
    return rows as CursoProfesor[];
}

const createCursoProfesor = async (cursoProfesor: CursoProfesor) => {
    const query = `
    INSERT INTO cursos_profesores (id, profesor_expediente, curso_id, periodo) 
    VALUES (?, ?, ?, ?)`;
    const values = [
        cursoProfesor.id,
        cursoProfesor.profesor_expediente,
        cursoProfesor.curso_id,
        cursoProfesor.periodo
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateCursoProfesor = async (id: string, cursoProfesor: Partial<CursoProfesor>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(cursoProfesor)) {
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
    UPDATE cursos_profesores 
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

const deleteCursoProfesor = async (id: string) => {
    const query = 'DELETE FROM cursos_profesores WHERE id = ?';
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const CursoProfesorModel = {
    getAllCursosProfesores,
    getCursosByProfesorID,
    getCursosProfesoresByCursoID,
    getCursoByProfesorExpedienteAndCursoID,
    getCursoProfesorByID,
    createCursoProfesor,
    updateCursoProfesor,
    deleteCursoProfesor
};