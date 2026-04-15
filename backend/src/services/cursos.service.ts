import Models from "../models/sql/models";
import { DepartamentosAcademicosService } from "./departamentos-academicos.service";
import { ModalidadService } from "./modalidad.service";
import { UsuarioService } from "./usuario.service";
import { CarrerasService } from "./carreras.service";

export const CursoService = {
    obtenerCursos,
    obtenerCursoPorId,
    obtenerProfesoresDelCurso,
    crearCurso,
    actualizarCurso,
    eliminarCurso
}

async function obtenerCursos(filters?: { carreraId?: string, profesorId?: string }) {

    let cursos = await Models.CursoModel.getCursos();
    
    // Filtrado inicial
    if (filters?.carreraId) {
        const relaciones = await Models.CursoCarreraModel.getCursosByCarreraID(filters.carreraId);
        const cursoIds = new Set(relaciones.map(r => r.curso_id));
        cursos = cursos.filter(c => cursoIds.has(c.id));
    }
    
    if (filters?.profesorId) {
        const relaciones = await Models.CursoProfesorModel.getCursosByProfesorID(filters.profesorId);
        const cursoIds = new Set(relaciones.map(r => r.curso_id));
        cursos = cursos.filter(c => cursoIds.has(c.id));
    }

    const departamentos = await DepartamentosAcademicosService.obtenerDepartamentosAcademicos();
    const modalidades = await ModalidadService.obtenerModalidades();
    
    // Obtener datos para enriquecer relaciones
    const cursosProfesores = await Models.CursoProfesorModel.getAllCursosProfesores();
    const cursosCarreras = await Models.CursoCarreraModel.getCursosCarreras();
    
    // Obtener catálogos completos para mapeo
    const profesoresResult = await UsuarioService.obtenerUsuariosPorRol("2");
    const profesores = (profesoresResult && !('error' in profesoresResult)) ? profesoresResult : [];
    
    const carreras = await CarrerasService.obtenerCarreras();

    for (const curso of cursos) {

        // Agregar datos del departamento académico
        const departamento = departamentos.find(dep => dep.id === curso.departamento_id);
        if (departamento) {
            (curso as any).departamento = departamento;
        }

        // Agregar datos de la modalidad
        const modalidad = modalidades.find(mod => mod.id === curso.modalidad);
        if (modalidad) {
            (curso as any).modalidad = modalidad;
        }

        // Agregar Profesores
        const relacionesProfesor = cursosProfesores.filter(cp => cp.curso_id === curso.id);
        (curso as any).profesores = relacionesProfesor.map(cp => {
             const profe = (profesores as any[]).find(p => p.expediente === cp.profesor_expediente);
             return profe ? { ...profe, curso_profesor_id: cp.id, periodo: cp.periodo } : { expediente: cp.profesor_expediente, curso_profesor_id: cp.id };
        });

        // Agregar Carreras
        const relacionesCarrera = cursosCarreras.filter(cc => cc.curso_id === curso.id);
        (curso as any).carreras = relacionesCarrera.map(cc => {
            const carrera = (carreras as any[]).find(c => c.id === cc.carrera_id);
            return carrera || { id: cc.carrera_id };
        });
    }

    return cursos;
}

async function obtenerProfesoresDelCurso(cursoId: string) {
    const cursosProfesores = await Models.CursoProfesorModel.getCursosProfesoresByCursoID(cursoId);
    if (!cursosProfesores || cursosProfesores.length === 0) {
        return [];
    }

    const profesoresResult = await UsuarioService.obtenerUsuariosPorRol("2");
    if (!profesoresResult || 'error' in profesoresResult) {
        return [];
    }

    const periodos = await Models.PeriodoModel.getPeriodos();



    const profesores = profesoresResult as any[];
    return cursosProfesores.map(cp => {
        const profe = profesores.find(p => p.expediente === cp.profesor_expediente);
        const periodo = periodos.find(per => per.id === cp.periodo);
        return profe ? { ...profe, curso_profesor_id: cp.id, periodo: periodo } : null;
    }).filter(p => p !== null);

}

async function obtenerCursoPorId(id: string) {

    const curso = await Models.CursoModel.getCursoById(id);
    if (!curso) {
        return { error: 'Curso no encontrado', status: 404 };
    }

    const departamento = await DepartamentosAcademicosService.obtenerDepartamentoAcademicoPorId(curso.departamento_id);
    if (departamento && !('error' in departamento)) {
        delete (curso as any).departamento_id;
        (curso as any).departamento = departamento;
    }
    else {
        return { error: departamento.error, status: departamento.status };
    }

    const modalidad = await ModalidadService.obtenerModalidadPorId(curso.modalidad);
    if (modalidad && !('error' in modalidad)) {
        (curso as any).modalidad = modalidad;
    }
    else {
        return { error: modalidad.error, status: modalidad.status };
    }

    // Enriquecer con Profesores
    const cursosProfesores = await Models.CursoProfesorModel.getCursosProfesoresByCursoID(id);
    if (cursosProfesores) {
        const profesoresResult = await UsuarioService.obtenerUsuariosPorRol("2");
        const profesores = (profesoresResult && !('error' in profesoresResult)) ? profesoresResult : [];
        
        (curso as any).profesores = cursosProfesores.map(cp => {
            const profe = (profesores as any[]).find(p => p.expediente === cp.profesor_expediente);
            return profe ? { ...profe, curso_profesor_id: cp.id, periodo: cp.periodo } : { expediente: cp.profesor_expediente, curso_profesor_id: cp.id };
        });
    }

    // Enriquecer con Carreras
    const cursosCarreras = await Models.CursoCarreraModel.getCarrerasByCursoID(id);
    if (cursosCarreras) {
        const carreras = await CarrerasService.obtenerCarreras();
        (curso as any).carreras = cursosCarreras.map(cc => {
            const carrera = (carreras as any[]).find(c => c.id === cc.carrera_id);
            return carrera || { id: cc.carrera_id };
        });
    }

    return curso;
}

async function crearCurso(data: any) {
    return await Models.CursoModel.createCurso(data);
}

async function actualizarCurso(id: string, data: any) {
    const curso = await Models.CursoModel.getCursoById(id);
    if (!curso) {
        return { error: 'Curso no encontrado', status: 404 };
    }
    return await Models.CursoModel.updateCurso(id, data);
}

async function eliminarCurso(id: string) {
    const curso = await Models.CursoModel.getCursoById(id);
    if (!curso) {
        return { error: 'Curso no encontrado', status: 404 };
    }
    return await Models.CursoModel.deleteCurso(id);
}

// async function testCursos() {
//     try {
//         const data = await obtenerCursoPorId("2");
//         console.log("DATA:", data);
//     } catch (e) {
//         console.log("ERROR:", e);
//     }
// }

// testCursos();