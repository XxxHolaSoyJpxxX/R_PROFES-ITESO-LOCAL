import { Request, Response } from "express";
import { DepartamentosAcademicosService } from "../services/departamentos-academicos.service";

export const DepartamentosAcademicosController = {
    getDepartamentosAcademicos,
    getDepartamentoAcademicoById,
    createDepartamentoAcademico,
    updateDepartamentoAcademico,
    deleteDepartamentoAcademico
};

async function getDepartamentosAcademicos(req: Request, res: Response) {
    try {
        const result = await DepartamentosAcademicosService.obtenerDepartamentosAcademicos();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los departamentos académicos', error });
    }
}

async function getDepartamentoAcademicoById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await DepartamentosAcademicosService.obtenerDepartamentoAcademicoPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el departamento académico', error });
    }
}

async function createDepartamentoAcademico(req: Request, res: Response) {
    try {
        const result = await DepartamentosAcademicosService.crearDepartamentoAcademico(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el departamento académico', error });
    }
}

async function updateDepartamentoAcademico(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await DepartamentosAcademicosService.actualizarDepartamentoAcademico(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el departamento académico', error });
    }
}

async function deleteDepartamentoAcademico(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await DepartamentosAcademicosService.eliminarDepartamentoAcademico(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el departamento académico', error });
    }
}
