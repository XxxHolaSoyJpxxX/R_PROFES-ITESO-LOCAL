import { pool } from "../../config/sql.client";

// CREATE TABLE usuario (
//     expediente CHAR(36) NOT NULL,
//     nombre VARCHAR(255) NOT NULL,
//     apellido_paterno VARCHAR(255) NOT NULL,
//     apellido_materno VARCHAR(255) NOT NULL,
//     fecha_de_nacimiento DATE NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     rol CHAR(36) NOT NULL,
//     activo BOOLEAN NOT NULL,
//     imagen TEXT NOT NULL,
//     PRIMARY KEY (expediente)
// )

export interface Usuario {
    expediente: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_de_nacimiento: Date;
    email: string;
    rol: string;
    activo: boolean;
    imagen?: string | null;
}

const getUsuarios = async (): Promise<Usuario[]> => {
    const query = 'SELECT * FROM usuario WHERE activo = true';
    const [rows] = await pool.query(query);
    return rows as Usuario[];
}

const getUsuariosByRol = async (rol: string): Promise<Usuario[]> => {
    const query = 'SELECT * FROM usuario WHERE rol = ? AND activo = true';
    const values = [rol];
    const [rows] = await pool.query(query, values);
    return rows as Usuario[];
}

const getUsuarioByExpediente = async (expediente: string): Promise<Usuario | null> => {
    const query = 'SELECT * FROM usuario WHERE expediente = ?';
    const values = [expediente];
    const [rows] = await pool.query(query, values);
    const results = rows as Usuario[];
    return results.length > 0 ? results[0] : null;
}

const createUsuario = async (usuario: Usuario) => {
    const query = `
    INSERT INTO usuario 
    (expediente, nombre, apellido_paterno, apellido_materno, fecha_de_nacimiento, email, rol, activo, imagen) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        usuario.expediente,
        usuario.nombre,
        usuario.apellido_paterno, 
        usuario.apellido_materno, 
        usuario.fecha_de_nacimiento, 
        usuario.email, 
        usuario.rol, 
        usuario.activo, 
        usuario.imagen ?? null
    ];
    const [result] = await pool.query(query, values);
    return result;
}

const updateUsuario = async (expediente: string, usuario: Partial<Usuario>) => {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(usuario)) {
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
    UPDATE usuario
    SET ${fields.join(', ')}
    WHERE expediente = ?`;

    const [result] = await pool.query(query, values);
    return result;
}

const deleteUsuario = async (expediente: string) => {
    const query = 'UPDATE usuario SET activo = false WHERE expediente = ?';
    const values = [expediente];
    const [result] = await pool.query(query, values);
    return result;
}

export const UsuarioModel = {
    getUsuarios,
    getUsuariosByRol,
    getUsuarioByExpediente,
    createUsuario,
    updateUsuario,
    deleteUsuario
}

// async function test() {
// console.log(await getUsuarioByExpediente("201"));
// }

// test()