import { pool } from "../../config/sql.client";

// CREATE TABLE departamentos_academicos (
//     id CHAR(36) NOT NULL,
//     nombre VARCHAR(255) NOT NULL,
//     descripcion TEXT NOT NULL,
//     coordinador CHAR(36) NOT NULL,
//     area_academica_id CHAR(36) NOT NULL,
//     PRIMARY KEY (id)
// )

export interface DepartamentoAcademico {
    id: string;
    nombre: string;
    descripcion: string;
    coordinador: string;
    area_academica_id: string;
}

const getDepartamentosAcademicos = async (): Promise<DepartamentoAcademico[]> => {
    const query = 'SELECT * FROM departamentos_academicos';
    const [rows] = await pool.query(query);
    return rows as DepartamentoAcademico[];
}

const getDepartamentoAcademicoById = async (id: string): Promise<DepartamentoAcademico | null> => {
    const query = 'SELECT * FROM departamentos_academicos WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as DepartamentoAcademico[];
    return results.length > 0 ? results[0] : null;
}

const createDepartamentoAcademico = async (departamento: DepartamentoAcademico) => {
    const query = `
    INSERT INTO
    departamentos_academicos (id, nombre, descripcion, coordinador, area_academica_id)
    VALUES (?, ?, ?, ?, ?)`;
    const values = [
        departamento.id,
        departamento.nombre,
        departamento.descripcion,
        departamento.coordinador,
        departamento.area_academica_id
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateDepartamentoAcademico = async (id: string, departamento: Partial<DepartamentoAcademico>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(departamento)) {
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
    UPDATE departamentos_academicos 
    SET ${fields.join(', ')}
    WHERE id = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

const deleteDepartamentoAcademico = async (id: string) => {
    const query = 'DELETE FROM departamentos_academicos WHERE id = ?';
    const values = [id];
    const [result] = await pool.query(query, values);
    return result;
}

export const DepartamentoAcademicoModel = {
    getDepartamentosAcademicos,
    getDepartamentoAcademicoById,
    createDepartamentoAcademico,
    updateDepartamentoAcademico,
    deleteDepartamentoAcademico
};

