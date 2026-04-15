import { pool } from "../../config/sql.client";

// CREATE TABLE areas_academicas (
//     id CHAR(36) NOT NULL,
//     nombre VARCHAR(255) NOT NULL,
//     PRIMARY KEY (id)
// )

export interface AreaAcademica {
    id: string;
    nombre: string;
}

const getAreasAcademicas = async (): Promise<AreaAcademica[]> => {
    const query = 'SELECT * FROM areas_academicas';
    const [rows] = await pool.query(query);
    return rows as AreaAcademica[];
}

const getAreaAcademicaById = async (id: string): Promise<AreaAcademica | null> => {
    const query = 'SELECT * FROM areas_academicas WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as AreaAcademica[];
    return results.length > 0 ? results[0] : null;
}

const createAreaAcademica = async (areaAcademica: AreaAcademica) => {
    const query = `
    INSERT INTO
    areas_academicas (id, nombre) 
    VALUES (?, ?)`;
    const values = [
        areaAcademica.id,
        areaAcademica.nombre
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateAreaAcademica = async (id: string, areaAcademica: Partial<AreaAcademica>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(areaAcademica)) {
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
    UPDATE areas_academicas 
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

const deleteAreaAcademica = async (id: string) => {
    const query = 'DELETE FROM areas_academicas WHERE id = ?';
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const AreaAcademicaModel = {
    getAreasAcademicas,
    getAreaAcademicaById,
    createAreaAcademica,
    updateAreaAcademica,
    deleteAreaAcademica
};