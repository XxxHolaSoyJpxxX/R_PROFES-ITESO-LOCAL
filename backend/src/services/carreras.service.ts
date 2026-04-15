import Models from "../models/sql/models";
import { AreaAcademicaService } from "./areas-academicas.service";

export const CarrerasService = {
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    desactivarCarrera
}

async function obtenerCarreras(filters?: { area?: string }){
    let carreras = await Models.CarreraModel.getCarreras();
    const departamentos = await AreaAcademicaService.obtenerAreasAcademicas();

    if (filters && filters.area) {
        carreras = carreras.filter(carrera => carrera.departamento === filters.area);
    }

    for (const carrera of carreras) {
        const departamento = departamentos.find(dep => dep.id === carrera.departamento);
        if (departamento) {
            (carrera as any).departamento = departamento;
        }
    }

    return carreras;
}

async function obtenerCarreraPorId(id: string) {
    const carrera = await Models.CarreraModel.getCarreraById(id);
    
    if (!carrera) {
        return { error: 'Carrera no encontrada', status: 404 };
    }

    const areaAcademica = await AreaAcademicaService.obtenerAreaAcademicaPorId(carrera.departamento);

    if (areaAcademica && !('error' in areaAcademica)) {
        (carrera as any).departamento = areaAcademica;
    }

    return carrera;
}

async function crearCarrera(data: any) {
    return await Models.CarreraModel.createCarrera(data);
}

async function actualizarCarrera(id: string, data: any) {
    const carrera = await Models.CarreraModel.getCarreraById(id);
    if (!carrera) {
        return { error: 'Carrera no encontrada', status: 404 };
    }
    return await Models.CarreraModel.updateCarrera(id, data);
}

async function desactivarCarrera(id: string) {
    const carrera = await Models.CarreraModel.getCarreraById(id);
    if (!carrera) {
        return { error: 'Carrera no encontrada', status: 404 };
    }
    return await Models.CarreraModel.deactivateCarrera(id);
}

// async function testCarreras() {
//     try {
//         const data = await obtenerCarreras();
//         // const data = await obtenerCarreraPorId("1");
//         console.log("DATA:", data);
//     } catch (e) {
//         console.log("ERROR:", e);
//     }
// }

// testCarreras();