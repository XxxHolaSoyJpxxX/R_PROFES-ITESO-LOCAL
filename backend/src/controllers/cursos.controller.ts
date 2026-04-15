import { Request, Response } from "express";
import { CursoService } from "../services/cursos.service";

export const CursosController = {
    getCursos,
    getCursoById,
    getProfesoresByCurso,
    createCurso,
    updateCurso,
    deleteCurso
};

async function getCursos(req: Request, res: Response) {
    try {
        const carreraId = req.query.carrera as string;
        const profesorId = req.query.profesor as string;
        
        const result = await CursoService.obtenerCursos({ carreraId, profesorId });

        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cursos', error });
    }
}

async function getProfesoresByCurso(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CursoService.obtenerProfesoresDelCurso(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los profesores del curso', error });
    }
}

async function getCursoById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CursoService.obtenerCursoPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el curso', error });
    }
}

async function createCurso(req: Request, res: Response) {
    try {
        const result = await CursoService.crearCurso(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el curso', error });
    }
}

async function updateCurso(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CursoService.actualizarCurso(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el curso', error });
    }
}

async function deleteCurso(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CursoService.eliminarCurso(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el curso', error });
    }
}
