import { pool } from "../../config/sql.client";

// CREATE TABLE alumnos (
//     expediente CHAR(36) NOT NULL,
//     carrera CHAR(36) NOT NULL,
//     status VARCHAR(255) NOT NULL,
//     PRIMARY KEY (expediente)
// )

export interface Alumno {
    expediente: string;
    carrera: string;
    status: string;
}

const getAllAlumnos = async (): Promise<Alumno[]> => {
    const query = 'SELECT * FROM alumnos';
    const [rows] = await pool.query (query);
    return rows as Alumno[];
}

const getAlumnosDetails = async (): Promise<Alumno[]> => {
    const query = 'SELECT * FROM alumnos';
    const [rows] = await pool.query(query);
    return rows as Alumno[];
}

const getAlumnoByExpediente = async (expediente: string): Promise<Alumno | null> => {
    const query = 'SELECT * FROM alumnos WHERE expediente = ?';
    const values = [expediente];
    const [rows] = await pool.query(query, values);
    const results = rows as Alumno[];
    return results.length > 0 ? results[0] : null;
}

const createAlumno = async (alumno: Alumno) => {
    const query = `
    INSERT INTO alumnos 
    (expediente, carrera, status) 
    VALUES (?, ?, ?)`;
    const values = [
        alumno.expediente,
        alumno.carrera,
        alumno.status
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateAlumno = async (expediente: string, alumno: Partial<Alumno>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(alumno)) {
        if (key === 'expediente') continue;
        if (value === undefined) continue;
        fields.push(`${key} = ?`);
        values.push(value);
    }

    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }

    values.push(expediente);

    const query = `
    UPDATE alumnos 
    SET ${fields.join(', ')}
    WHERE expediente = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

export const AlumnoModel = {
    getAlumnosDetails,
    getAlumnoByExpediente,
    createAlumno,
    updateAlumno,
    getAllAlumnos
}