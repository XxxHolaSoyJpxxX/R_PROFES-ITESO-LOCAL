import Models from "../models/sql/models";

export const RolesService = {
    obtenerRolPorId,
    obtenerRoles,
    crearRol,
    actualizarRol
}

async function obtenerRolPorId(id: string) {
    const role = await Models.RoleModel.getRoleById(id);
    if (!role) {
        return { error: 'Rol no encontrado', status: 404 };
    }
    return role;
}

async function obtenerRoles() {
    return await Models.RoleModel.getRoles();
}

async function crearRol(data: any) {
    return await Models.RoleModel.createRole(data);
}

async function actualizarRol(id: string, data: any) {
    const role = await Models.RoleModel.getRoleById(id);
    if (!role) {
        return { error: 'Rol no encontrado', status: 404 };
    }
    return await Models.RoleModel.updateRole(id, data);
}
