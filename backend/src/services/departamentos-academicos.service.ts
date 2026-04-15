import Models from "../models/sql/models";
import { AreaAcademicaService } from "./areas-academicas.service";
import { UsuarioService } from "./usuario.service";

export const DepartamentosAcademicosService = {
    obtenerDepartamentosAcademicos,
    obtenerDepartamentoAcademicoPorId,
    crearDepartamentoAcademico,
    actualizarDepartamentoAcademico,
    eliminarDepartamentoAcademico
}

async function obtenerDepartamentosAcademicos() {
    const departamentos = await Models.DepartamentoAcademicoModel.getDepartamentosAcademicos();
    const areas_academicas = await AreaAcademicaService.obtenerAreasAcademicas();
    const usuarios = await UsuarioService.obtenerUsuarios();

    for (const departamento of departamentos) {
        const area_academica = areas_academicas.find(area => area.id === departamento.area_academica_id);
        if (area_academica) {
            (departamento as any).area_academica_nombre = area_academica.nombre;
        }

        const coordinador = usuarios.find(user => user.expediente === departamento.coordinador);
        if (coordinador) {
            (departamento as any).coordinador_nombre = `${coordinador.nombre} ${coordinador.apellido_paterno} ${coordinador.apellido_materno}`;
        }
    }


    return departamentos;
}

async function obtenerDepartamentoAcademicoPorId(id: string) {
    const departamento = await Models.DepartamentoAcademicoModel.getDepartamentoAcademicoById(id);
    if (!departamento) {
        return { error: 'Departamento Académico no encontrado', status: 404 };
    }

    const area_academica = await AreaAcademicaService.obtenerAreaAcademicaPorId(departamento.area_academica_id);
    if (area_academica && !('error' in area_academica)) {
        (departamento as any).area_academica_nombre = area_academica.nombre;
    }
    else {
        return {error: area_academica.error, status: area_academica.status};
    }

    const coordinador = await UsuarioService.obtenerUsuarioPorId(departamento.coordinador);
    if (coordinador && !('error' in coordinador)) {
        (departamento as any).coordinador_nombre = `${coordinador.nombre} ${coordinador.apellido_paterno} ${coordinador.apellido_materno}`;
    }
    else {
        return {error: coordinador.error, status: coordinador.status};
    }
    
    return departamento;
}

async function crearDepartamentoAcademico(data: any) {
    return await Models.DepartamentoAcademicoModel.createDepartamentoAcademico(data);
}

async function actualizarDepartamentoAcademico(id: string, data: any) {
    const departamento = await Models.DepartamentoAcademicoModel.getDepartamentoAcademicoById(id);
    if (!departamento) {
        return { error: 'Departamento Académico no encontrado', status: 404 };
    }
    return await Models.DepartamentoAcademicoModel.updateDepartamentoAcademico(id, data);
}

async function eliminarDepartamentoAcademico(id: string) {
    const departamento = await Models.DepartamentoAcademicoModel.getDepartamentoAcademicoById(id);
    if (!departamento) {
        return { error: 'Departamento Académico no encontrado', status: 404 };
    }
    return await Models.DepartamentoAcademicoModel.deleteDepartamentoAcademico(id);
}