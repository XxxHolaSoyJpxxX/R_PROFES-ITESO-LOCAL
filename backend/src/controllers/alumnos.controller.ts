import { Request, Response } from "express";
import { AlumnoService } from "../services/alumno.service";
import { EvaluacionesService } from "../services/evaluaciones.service";

export const AlumnosController = {
    getAlumnoByExpediente,
    getAlumnoCursos,
    getAlumnoEvaluaciones,
    createAlumno,
    updateAlumno,
    deleteAlumno
};

export default AlumnosController;

async function getAlumnoByExpediente(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const alumno = await AlumnoService.obtenerAlumnoPorExpediente(expediente);
        if (alumno.error) {
            return res.status(alumno.status).json({ message: alumno.error });
        }
        res.json(alumno);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el alumno', error });
    }
}

// REVISAR ESTA FUNCION
async function getAlumnoCursos(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await AlumnoService.obtenerAlumnoCursos(expediente);

        if (result.error) {
            return res.status(Number(result.status) || 400).json({ message: result.error });
        }

        res.json(result);

    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener los cursos', error });
    }
}


// FALTA IMPLEMENTAR
async function getAlumnoEvaluaciones(req: Request, res: Response) {
    try { 
        const { expediente } = req.params;
        const result = await EvaluacionesService.obtenerEvaluacionesPorAlumno(expediente);

        // El servicio puede devolver un arreglo o un objeto de error
        if (!Array.isArray(result) && 'error' in result) {
            return res.status(Number(result.status) || 400).json({ message: result.error });
        }

        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las evaluaciones del alumno', error });
    }
}

async function createAlumno(req: Request, res: Response) {
    try {
        const alumnoData = req.body;
        const result = await AlumnoService.crearAlumno(alumnoData);
        res.status(201).json({ message: 'Alumno creado exitosamente', result });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el alumno', error });
    }
}

async function updateAlumno(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const alumnoData = req.body;
        
        const result = await AlumnoService.actualizarAlumno(expediente, alumnoData);
        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        res.json({ message: 'Alumno actualizado exitosamente', result });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el alumno', error });
    }
}

async function deleteAlumno(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await AlumnoService.eliminarAlumno(expediente);
        res.json({ message: 'Alumno eliminado exitosamente', result });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el alumno', error });
    }
}
