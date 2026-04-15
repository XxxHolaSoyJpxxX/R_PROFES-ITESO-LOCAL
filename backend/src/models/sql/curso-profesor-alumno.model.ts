import { pool } from "../../config/sql.client";

// CREATE TABLE curso_profesor_alumno (
//     id CHAR(36) NOT NULL,
//     curso_profesor_id CHAR(36) NOT NULL,
//     alumno_id CHAR(36) NOT NULL,
//     calificacion INT NOT NULL,
//     activo BOOLEAN NOT NULL,
//     PRIMARY KEY (id)
// )

export interface CursoProfesorAlumno {
    id: string;
    curso_profesor_id: string;
    alumno_id: string;
    calificacion: number;
    activo: boolean;
}

const getCursosByAlumnoID = async (alumno_id: string): Promise<CursoProfesorAlumno[]> => {
    const query = 'SELECT * FROM curso_profesor_alumno WHERE alumno_id = ?';
    const values = [alumno_id];
    const [rows] = await pool.query(query, values);
    return rows as CursoProfesorAlumno[];
}

const getCursoById = async (id: string): Promise<CursoProfesorAlumno | null> => {
    const query = 'SELECT * FROM curso_profesor_alumno WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as CursoProfesorAlumno[];
    return results.length > 0 ? results[0] : null;
}

const getCursoByCursoProfesorID = async (curso_profesor_id: string): Promise<CursoProfesorAlumno[]> => {
    const query = 'SELECT * FROM curso_profesor_alumno WHERE curso_profesor_id = ?';
    const values = [curso_profesor_id];
    const [rows] = await pool.query(query, values);
    return rows as CursoProfesorAlumno[];
}

const createCursoProfesorAlumno = async (cursoProfesorAlumno: CursoProfesorAlumno) => {
    const query = `
    INSERT INTO curso_profesor_alumno
    (id, curso_profesor_id, alumno_id, calificacion, activo) 
    VALUES (?, ?, ?, ?, ?)`;
    const values = [
        cursoProfesorAlumno.id,
        cursoProfesorAlumno.curso_profesor_id,
        cursoProfesorAlumno.alumno_id,
        cursoProfesorAlumno.calificacion,
        cursoProfesorAlumno.activo
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateCursoProfesorAlumno = async (id: string, cursoProfesorAlumno: Partial<CursoProfesorAlumno>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(cursoProfesorAlumno)) {
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
    UPDATE curso_profesor_alumno 
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

const deactivateCursoProfesorAlumno = async (id: string) => {
    const query = `
    UPDATE curso_profesor_alumno
    SET activo = false
    WHERE id = ?`;
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const CursoProfesorAlumnoModel = {
    getCursosByAlumnoID,
    getCursoById,
    getCursoByCursoProfesorID,
    createCursoProfesorAlumno,
    updateCursoProfesorAlumno,
    deactivateCursoProfesorAlumno
};