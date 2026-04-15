import { pool } from "../../config/sql.client";

// CREATE TABLE periodo (
//     id CHAR(36) NOT NULL,
//     start_date DATE NOT NULL,
//     end_date DATE NOT NULL,
//     name VARCHAR(255) NOT NULL,
//     PRIMARY KEY (id)
// ) 

export interface Periodo {
    id: string;
    start_date: Date;
    end_date: Date;
    name: string;
}

const getPeriodos = async (): Promise<Periodo[]> => {
    const query = 'SELECT * FROM periodo';
    const [rows] = await pool.query(query);
    return rows as Periodo[];
}

const getPeriodoById = async (id: string): Promise<Periodo | null> => {
    const query = 'SELECT * FROM periodo WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as Periodo[];
    return results.length > 0 ? results[0] : null;
}

const createPeriodo = async (periodo: Periodo) => {
    const query = `
    INSERT INTO
    periodo (id, start_date, end_date, name) 
    VALUES (?, ?, ?, ?)`;
    const values = [
        periodo.id,
        periodo.start_date,
        periodo.end_date,
        periodo.name
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updatePeriodo = async (id: string, periodo: Partial<Periodo>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(periodo)) {
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
    UPDATE periodo 
    SET ${fields.join(', ')}
    WHERE id = ?`;
 
    const [result] = await pool.query(query, values);
    return result;
}

export const PeriodoModel = {
    getPeriodos,
    getPeriodoById,
    createPeriodo,
    updatePeriodo,
};