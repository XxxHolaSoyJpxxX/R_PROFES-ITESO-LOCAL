import Models from "../models/sql/models";

export const PeriodoService = {
    obtenerPeriodos,
    obtenerPeriodoPorId,
    crearPeriodo,
    actualizarPeriodo
}

async function obtenerPeriodos() {
    return await Models.PeriodoModel.getPeriodos();
}

async function obtenerPeriodoPorId(id: string) {
    const periodo = await Models.PeriodoModel.getPeriodoById(id);
    if (!periodo) {
        return { error: 'Periodo no encontrado', status: 404 };
    }
    return periodo;
}

async function crearPeriodo(data: any) {
    return await Models.PeriodoModel.createPeriodo(data);
}

async function actualizarPeriodo(id: string, data: any) {
    const periodo = await Models.PeriodoModel.getPeriodoById(id);
    if (!periodo) {
        return { error: 'Periodo no encontrado', status: 404 };
    }
    return await Models.PeriodoModel.updatePeriodo(id, data);
}