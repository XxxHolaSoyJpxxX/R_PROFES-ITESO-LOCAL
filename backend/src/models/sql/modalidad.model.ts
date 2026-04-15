import { pool } from "../../config/sql.client";

// CREATE TABLE modalidad (
//     id CHAR(36) NOT NULL,
//     nombre VARCHAR(255) NOT NULL,
//     descripcion TEXT NOT NULL,
//     PRIMARY KEY (id)
// )

export interface Modalidad {
    id: string;
    nombre: string;
    descripcion: string;
}

const getModalidades = async (): Promise<Modalidad[]> => {
    const query = 'SELECT * FROM modalidad';
    const [rows] = await pool.query(query);
    return rows as Modalidad[];
}

const getModalidadById = async (id: string): Promise<Modalidad | null> => {
    const query = 'SELECT * FROM modalidad WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as Modalidad[];
    return results.length > 0 ? results[0] : null;
}

const createModalidad = async (modalidad: Modalidad) => {
    const query = `
    INSERT INTO
    modalidad (id, nombre, descripcion) 
    VALUES (?, ?, ?)`;
    const values = [
        modalidad.id,
        modalidad.nombre,
        modalidad.descripcion
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateModalidad = async (id: string, modalidad: Partial<Modalidad>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(modalidad)) {
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
    UPDATE modalidad 
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}   

const deleteModalidad = async (id: string) => {
    const query = 'DELETE FROM modalidad WHERE id = ?';
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const ModalidadModel = {
    getModalidades,
    getModalidadById,
    createModalidad,
    updateModalidad,
    deleteModalidad
};

