import Models from "../models/sql/models";
import { CursoService } from "./cursos.service";
import { UsuarioService } from "./usuario.service";
import { PeriodoService } from "./periodo.service";

export const CursosProfesoresService = {
    obtenerCursosProfesores,
    obtenerCursoProfesorPorID,
    ObtenerCursosPorProfesorID,
    ObtenerProfesoresPorCursoID,
    obtenerCursosProfesorPorProfesorYCurso,
    crearCursoProfesor,
    actualizarCursoProfesor,
    eliminarCursoProfesor
}

async function obtenerCursosProfesores() {
    const cursosProfesores = await Models.CursoProfesorModel.getAllCursosProfesores();
    const cursos = await CursoService.obtenerCursos();

    const usuarios = await UsuarioService.obtenerUsuariosPorRol("2");
    if(!usuarios || 'error' in usuarios) {
        return { error: 'Profesores no encontrados', status: 404 };
    }

    for (const cursoProfesor of cursosProfesores) {

        // Agregar datos del curso
        const curso = cursos.find(cur => cur.id === cursoProfesor.curso_id);
        if (curso) {
            (cursoProfesor as any).curso = curso;
        }

        // Agregar datos del profesor
        const profesor = usuarios.find(user => user.expediente === cursoProfesor.profesor_expediente);
        if (profesor) {
            (cursoProfesor as any).profesor = profesor;
        }
    }

    return cursosProfesores;
}

async function obtenerCursoProfesorPorID(id: string) {
    const cursoProfesor = await Models.CursoProfesorModel.getCursoProfesorByID(id);
    if (!cursoProfesor) {
        return { error: 'Curso-Profesor no encontrado', status: 404 };
    }

    const curso = await CursoService.obtenerCursoPorId(cursoProfesor.curso_id);
    if (curso && !('error' in curso)) {
        (cursoProfesor as any).curso = curso;
    }
    else {
        return { error: curso.error, status: curso.status };
    }

    const profesor = await UsuarioService.obtenerUsuarioPorId(cursoProfesor.profesor_expediente);
    if (profesor && !('error' in profesor)) {
        (cursoProfesor as any).profesor = profesor;
    }
    else {
        return { error: profesor.error, status: profesor.status };
    }

    return cursoProfesor;
}

async function ObtenerCursosPorProfesorID(profesorId: string) {
    const cursosProfesores = await Models.CursoProfesorModel.getCursosByProfesorID(profesorId);
    if (!cursosProfesores) {
        return { error: 'Curso-Profesores no encontrado', status: 404 };
    }

    const cursos = await CursoService.obtenerCursos();

    for (const cursoProfesor of cursosProfesores) {

        // Agregar datos del curso
        const curso = cursos.find(cur => cur.id === cursoProfesor.curso_id);
        if (curso) {
            (cursoProfesor as any).curso = curso;
        }
    }

    return cursosProfesores;
}

async function ObtenerProfesoresPorCursoID(cursoId: string) {
    const cursosProfesores = await Models.CursoProfesorModel.getCursosProfesoresByCursoID(cursoId);
    if (!cursosProfesores) {
        return { error: 'Curso-Profesores no encontrado', status: 404 };
    }

    const usuarios = await UsuarioService.obtenerUsuariosPorRol("2");
    if(!usuarios || 'error' in usuarios) {
        return { error: 'Profesores no encontrados', status: 404 };
    }

    for (const cursoProfesor of cursosProfesores) {
        // Agregar datos del profesor
        const profesor = usuarios.find(user => user.expediente === cursoProfesor.profesor_expediente);
        if (profesor) {
            (cursoProfesor as any).profesor = profesor;
        }
    }

    return cursosProfesores;
}

async function obtenerCursosProfesorPorProfesorYCurso(profesorExpediente: string, cursoId: string) {

    const cursosProfesor = await Models.CursoProfesorModel.getCursoByProfesorExpedienteAndCursoID(profesorExpediente, cursoId);
    if (!cursosProfesor) {
        return { error: 'Curso-Profesor no encontrado', status: 404 };
    }

    const periodos = await PeriodoService.obtenerPeriodos();

    for (const cursoProfesor of cursosProfesor) {
        // Agregar datos del periodo
        const periodo = periodos.find(per => per.id === cursoProfesor.periodo);
        if (periodo) {
            (cursoProfesor as any).periodo = periodo;
        }
    }

    return cursosProfesor;
}

async function crearCursoProfesor(data: any) {
    return await Models.CursoProfesorModel.createCursoProfesor(data);
}

async function actualizarCursoProfesor(id: string, data: any) {
    return await Models.CursoProfesorModel.updateCursoProfesor(id, data);
}

async function eliminarCursoProfesor(id: string) {
    return await Models.CursoProfesorModel.deleteCursoProfesor(id);
}