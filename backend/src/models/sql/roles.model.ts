import { pool } from "../../config/sql.client";

// CREATE TABLE roles (
//     id CHAR(36) NOT NULL,
//     rol VARCHAR(255) NOT NULL,
//     PRIMARY KEY (id)
// )

export interface Role {
    id: string;
    rol: string;
}

const getRoles = async (): Promise<Role[]> => {
    const query = 'SELECT * FROM roles';
    const [rows] = await pool.query(query);
    return rows as Role[];
}

const getRoleById = async (id: string): Promise<Role | null> => {
    const query = 'SELECT * FROM roles WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    const results = rows as Role[];
    return results.length > 0 ? results[0] : null;
}

const createRole = async (role: Role) => {
    const query = `
    INSERT INTO roles (id, rol) VALUES (?, ?)`;
    const values = [role.id, role.rol];
    const [result] = await pool.query(query, values);
    return result;
}

const updateRole = async (id: string, role: Partial<Role>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(role)) {
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
    UPDATE roles 
    SET ${fields.join(', ')}
    WHERE id = ?`;
    const [result] = await pool.query(query, values);
    return result;
}

export const RoleModel = {
    getRoles,
    getRoleById,
    createRole,
    updateRole
};

