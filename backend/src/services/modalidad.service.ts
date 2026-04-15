import Models from "../models/sql/models";

export const ModalidadService = {
    obtenerModalidades,
    obtenerModalidadPorId,
    crearModalidad,
    actualizarModalidad,
    eliminarModalidad
}

async function obtenerModalidades() {
    return await Models.ModalidadModel.getModalidades();
}

async function obtenerModalidadPorId(id: string) {
    const modalidad = await Models.ModalidadModel.getModalidadById(id);
    if (!modalidad) {
        return { error: 'Modalidad no encontrada', status: 404 };
    }
    return modalidad;
}

async function crearModalidad(data: any) {
    return await Models.ModalidadModel.createModalidad(data);
}

async function actualizarModalidad(id: string, data: any) {
    const modalidad = await Models.ModalidadModel.getModalidadById(id);
    if (!modalidad) {
        return { error: 'Modalidad no encontrada', status: 404 };
    }
    return await Models.ModalidadModel.updateModalidad(id, data);
}

async function eliminarModalidad(id: string) {
    const modalidad = await Models.ModalidadModel.getModalidadById(id);
    if (!modalidad) {
        return { error: 'Modalidad no encontrada', status: 404 };
    }
    return await Models.ModalidadModel.deleteModalidad(id);
}