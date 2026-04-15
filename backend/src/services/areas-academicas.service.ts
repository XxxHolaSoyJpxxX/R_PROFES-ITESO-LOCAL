import Models from "../models/sql/models";

export const AreaAcademicaService = {
    obtenerAreasAcademicas,
    obtenerAreaAcademicaPorId,
    crearAreaAcademica,
    actualizarAreaAcademica,
    eliminarAreaAcademica
}

async function obtenerAreasAcademicas(){
    return await Models.AreaAcademicaModel.getAreasAcademicas();
}

async function obtenerAreaAcademicaPorId(id: string) {
    const areaAcademica = await Models.AreaAcademicaModel.getAreaAcademicaById(id);
    if (!areaAcademica) {
        return { error: 'Área académica no encontrada', status: 404 };
    }
    return areaAcademica;
}

async function crearAreaAcademica(data: any) {
    return await Models.AreaAcademicaModel.createAreaAcademica(data);
}

async function actualizarAreaAcademica(id: string, data: any) {
    const areaAcademica = await Models.AreaAcademicaModel.getAreaAcademicaById(id);
    if (!areaAcademica) {
        return { error: 'Área académica no encontrada', status: 404 };
    }
    return await Models.AreaAcademicaModel.updateAreaAcademica(id, data);
}

async function eliminarAreaAcademica(id: string) {
    const areaAcademica = await Models.AreaAcademicaModel.getAreaAcademicaById(id);
    if (!areaAcademica) {
        return { error: 'Área académica no encontrada', status: 404 };
    }
    return await Models.AreaAcademicaModel.deleteAreaAcademica(id);
}