import { UsuarioService } from "./usuario.service";
import { CursoService } from "./cursos.service";
import { RecursoMongoModelExport } from "../models/mongo/recursos.model";
import { S3Service } from "./s3.service";
import { randomUUID } from "crypto";

export const ProfesoresService = {
    obtenerProfesores,
    obtenerProfesorPorExpediente,
    crearProfesor,
    actualizarProfesor,
    eliminarProfesor,
    obtenerCursosDeProfesor,
    obtenerCursoDeProfesor,
    obtenerRecursosDeProfesor,
    crearRecursoParaProfesor,
    obtenerRecursoDeProfesor,
    actualizarRecursoDeProfesor,
    eliminarRecursoDeProfesor
}

async function obtenerProfesores() {
    return await UsuarioService.obtenerUsuariosPorRol("2");
}

async function obtenerProfesorPorExpediente(expediente: string) {
    return await UsuarioService.obtenerUsuarioPorId(expediente);
}

async function crearProfesor(data: any) {
    const profesorData = { ...data, rol: "2" };
    return await UsuarioService.crearUsuario(profesorData);
}

async function actualizarProfesor(expediente: string, data: any) {
    return await UsuarioService.actualizarUsuario(expediente, data);
}

async function eliminarProfesor(expediente: string) {
    return await UsuarioService.eliminarUsuario(expediente);
}

async function obtenerCursosDeProfesor(expediente: string) {
    const result = await CursoService.obtenerCursos({ profesorId: expediente });
    
    if (result && (result as any).error) {
        return result;
    }
    
    // Mapeo de metadatos para incluir periodo y curso_profesor_id en el nivel superior
    const cursosMapeados = (result as any[]).map(curso => {
        const relacionProfesor = (curso.profesores as any[]).find((p: any) => p.expediente === expediente);
        return {
            ...curso,
            periodo: relacionProfesor?.periodo,
            curso_profesor_id: relacionProfesor?.curso_profesor_id
        };
    });
    
    return cursosMapeados;
}

async function obtenerCursoDeProfesor(expediente: string, cursoId: string) {
    const cursos = await obtenerCursosDeProfesor(expediente);
    
    if (cursos && (cursos as any).error) {
        return cursos;
    }
    
    const curso = (cursos as any[]).find(c => c.id === cursoId);
    
    if (!curso) {
        return { error: "Curso no encontrado para este profesor", status: 404 };
    }
    
    return [curso]; // We return an array with the single course to maintain consistency
}

async function obtenerRecursosDeProfesor(expediente: string) {
    const recursos = await RecursoMongoModelExport.getRecursosByProfesor(expediente);
    // Generate signed URLs for each resource
    const recursosConUrl = await Promise.all(recursos.map(async (r) => {
        try {
            const signedUrl = await S3Service.getFileUrl(r.url);
            return { ...r, signedUrl };
        } catch (e) {
            return { ...r, signedUrl: null, error: "Error generating URL" };
        }
    }));
    return recursosConUrl;
}

async function crearRecursoParaProfesor(expediente: string, file: Express.Multer.File, nombre: string, tipo: string) {
    // Upload to S3
    const key = await S3Service.uploadFile(file, `profesores/${expediente}`);
    
    // Save to DB
    const recurso = {
        _id: randomUUID(),
        profesor_expediente: expediente,
        url: key,
        nombre: nombre,
        tipo: tipo
    };
    
    return await RecursoMongoModelExport.createRecurso(recurso);
}

async function obtenerRecursoDeProfesor(id: string) {
    const recurso = await RecursoMongoModelExport.getRecursoById(id);
    if (!recurso) {
        return { error: "Recurso no encontrado", status: 404 };
    }
    const signedUrl = await S3Service.getFileUrl(recurso.url);
    return { ...recurso, signedUrl };
}

async function actualizarRecursoDeProfesor(id: string, nombre?: string, tipo?: string) {
    const recurso = await RecursoMongoModelExport.getRecursoById(id);
    if (!recurso) {
        return { error: "Recurso no encontrado", status: 404 };
    }

    const updates: any = {};
    if (nombre) updates.nombre = nombre;
    if (tipo) updates.tipo = tipo;

    const recursoActualizado = await RecursoMongoModelExport.updateRecurso(id, updates);
    if (!recursoActualizado) {
        return { error: "Error al actualizar el recurso", status: 500 };
    }

    const signedUrl = await S3Service.getFileUrl(recursoActualizado.url);
    return { ...recursoActualizado.toObject(), signedUrl };
}

async function eliminarRecursoDeProfesor(id: string) {
    const recurso = await RecursoMongoModelExport.getRecursoById(id);
    if (!recurso) {
        return { error: "Recurso no encontrado", status: 404 };
    }
    
    // Delete from S3
    try {
        await S3Service.deleteFile(recurso.url);
    } catch (e) {
        console.error("Error deleting file from S3, but proceeding to delete from DB", e);
    }
    
    // Delete from DB
    return await RecursoMongoModelExport.deleteRecurso(id);
}
