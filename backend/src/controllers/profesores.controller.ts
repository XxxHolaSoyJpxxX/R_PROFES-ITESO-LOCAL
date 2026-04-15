import { Request, Response } from 'express';
import { ProfesoresService } from '../services/profesores.service';

const ProfesoresController = {
    obtenerProfesores,
    obtenerProfesor,
    obtenerCursosDeProfesor,
    obtenerCursoDeProfesor,
    obtenerRecursosDeProfesor,
    crearRecursoParaProfesor,
    obtenerRecursoDeProfesor,
    actualizarRecursoDeProfesor,
    eliminarRecursoDeProfesor,
    crearProfesor,
    actualizarProfesor,
    eliminarProfesor
};

// Gestión de profesores

async function obtenerProfesores(req: Request, res: Response) {
    try {
        const result = await ProfesoresService.obtenerProfesores();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los profesores', error });
    }
};

async function obtenerProfesor(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await ProfesoresService.obtenerProfesorPorExpediente(expediente);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el profesor', error });
    }
}

async function obtenerCursosDeProfesor(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await ProfesoresService.obtenerCursosDeProfesor(expediente);
        
        if (result && (result as any).error) {
            if ((result as any).status === 404) return res.json([]);
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los cursos del profesor', error });
    }
}

async function obtenerCursoDeProfesor(req: Request, res: Response) {
    try {
        const { expediente, cursoId } = req.params;
        const result = await ProfesoresService.obtenerCursoDeProfesor(expediente, cursoId);
        
        if (result && (result as any).error) {
             return res.status((result as any).status).json({ message: (result as any).error });
        }

        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el curso del profesor', error });
    }
}

// Recursos de profesor

async function obtenerRecursosDeProfesor(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await ProfesoresService.obtenerRecursosDeProfesor(expediente);
        res.json(result); 
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los recursos del profesor', error });
    }
}

async function crearRecursoParaProfesor(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const { nombre, tipo } = req.body;
        const anyFiles = (req as any).files as Express.Multer.File[] | undefined;
        const file = req.file ?? (Array.isArray(anyFiles) ? anyFiles[0] : undefined);

        if (!file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo" });
        }

        const nombreFinal = nombre?.trim() || file.originalname;

        if (!nombreFinal) {
            return res.status(400).json({ message: "El nombre del recurso es obligatorio" });
        }

        const result = await ProfesoresService.crearRecursoParaProfesor(expediente, file, nombreFinal, tipo);
        res.status(201).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el recurso para el profesor', error });
    }
}

async function obtenerRecursoDeProfesor(req: Request, res: Response) {
    try {
        const { recursoId } = req.params;
        const result = await ProfesoresService.obtenerRecursoDeProfesor(recursoId);
        
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }

        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el recurso del profesor', error });
    }
}

async function actualizarRecursoDeProfesor(req: Request, res: Response) {
    try {
        const { recursoId } = req.params;
        const { nombre, tipo } = req.body;

        if (!nombre && !tipo) {
            return res.status(400).json({ message: "Se debe proporcionar al menos nombre o tipo" });
        }

        const result = await ProfesoresService.actualizarRecursoDeProfesor(recursoId, nombre, tipo);
        
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }

        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el recurso del profesor', error });
    }
}

async function eliminarRecursoDeProfesor(req: Request, res: Response) {
    try {
        const { recursoId } = req.params;
        const result = await ProfesoresService.eliminarRecursoDeProfesor(recursoId);
        
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }

        res.json({ message: "Recurso eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el recurso del profesor', error });
    }
}

// CRUD de profesores

async function crearProfesor(req: Request, res: Response) {
    try {
        const result = await ProfesoresService.crearProfesor(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el profesor', error });
    }
}
async function actualizarProfesor(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await ProfesoresService.actualizarProfesor(expediente, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el profesor', error });
    }
}
async function eliminarProfesor(req: Request, res: Response) {
    try {
        const { expediente } = req.params;
        const result = await ProfesoresService.eliminarProfesor(expediente);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el profesor', error });
    }
}

export default ProfesoresController;