import Models from "../models/sql/models";
import { RolesService } from "./roles.service";

export const UsuarioService = {
    obtenerUsuarios,
    obtenerUsuariosPorRol,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
}

async function obtenerUsuarios() {
    const usuarios = await Models.UsuarioModel.getUsuarios();
    const roles = await RolesService.obtenerRoles();

    for (const usuario of usuarios) {
        const rol = roles.find(r => r.id === usuario.rol);
        if (rol) {
            (usuario as any).rol = rol;
        }
    }

    return usuarios;
}

async function obtenerUsuariosPorRol(rolId: string) {
    const usuarios = await Models.UsuarioModel.getUsuariosByRol(rolId);
    if (!usuarios) {
        return { error: 'Usuarios no encontrados', status: 404 };
    }

    const roles = await RolesService.obtenerRoles();

    for (const usuario of usuarios) {
        const rol = roles.find(r => r.id === usuario.rol);
        if (rol) {
            (usuario as any).rol = rol;
        }
    }

    return usuarios;
}

async function obtenerUsuarioPorId(id: string) {
    const usuario = await Models.UsuarioModel.getUsuarioByExpediente(id);
    if (!usuario) {
        return { error: 'Usuario no encontrado', status: 404 };
    }
    const rol = await RolesService.obtenerRolPorId(usuario.rol);
    if (rol && !('error' in rol)) {
        (usuario as any).rol = rol;
    }
    else {
        return { error: rol.error, status: rol.status };
    }

    return usuario;
}

async function crearUsuario(data: any) {
    return await Models.UsuarioModel.createUsuario(data);
}

async function actualizarUsuario(id: string, data: any) {
    const usuario = await Models.UsuarioModel.getUsuarioByExpediente(id);
    if (!usuario) {
        return { error: 'Usuario no encontrado', status: 404 };
    }
    return await Models.UsuarioModel.updateUsuario(id, data);
}

// Baja lógica de usuario (activo = false)
async function eliminarUsuario(id: string) {
    const usuario = await Models.UsuarioModel.getUsuarioByExpediente(id);
    if (!usuario) {
        return { error: 'Usuario no encontrado', status: 404 };
    }
    return await Models.UsuarioModel.deleteUsuario(id);
}