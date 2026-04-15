import { pool } from "../../config/sql.client";

// CREATE TABLE carreras (
//     id CHAR(36) NOT NULL,
//     nombre VARCHAR(255) NOT NULL,
//     departamento CHAR(36) NOT NULL,
//     activo BOOLEAN NOT NULL,
//     PRIMARY KEY (id)
// )

export interface Carrera {
    id: string;
    nombre: string;
    departamento: string;
    activo: boolean;
}

const getCarreras = async (): Promise<Carrera[]> => {
    const query = 'SELECT * FROM carreras';
    const [rows] = await pool.query(query);
    return rows as Carrera[];
}

const getCarreraById = async (id: string): Promise<Carrera | null> => {
    const query = 'SELECT * FROM carreras WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as Carrera[];
    return results.length > 0 ? results[0] : null;
}

const createCarrera = async (carrera: Carrera) => {
    const query = `
    INSERT INTO
    carreras (id, nombre, departamento, activo) 
    VALUES (?, ?, ?, ?)`;
    const values = [
        carrera.id,
        carrera.nombre,
        carrera.departamento,
        carrera.activo
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateCarrera = async (id: string, carrera: Partial<Carrera>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(carrera)) {
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
    UPDATE carreras 
    SET ${fields.join(', ')}
    WHERE id = ?`;
    const [result] = await pool.query(query, values);
    return result;
}

const deactivateCarrera = async (id: string) => {
    const query = `
    UPDATE carreras
    SET activo = false
    WHERE id = ?`;
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const CarreraModel = {
    getCarreras,
    getCarreraById,
    createCarrera,
    updateCarrera,
    deactivateCarrera
};

