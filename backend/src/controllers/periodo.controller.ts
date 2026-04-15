import { Request, Response } from "express";
import { PeriodoService } from "../services/periodo.service";

export const PeriodoController = {
    getPeriodos,
    getPeriodoById,
    createPeriodo,
    updatePeriodo
};

async function getPeriodos(req: Request, res: Response) {
    try {
        const result = await PeriodoService.obtenerPeriodos();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los periodos', error });
    }
}

async function getPeriodoById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await PeriodoService.obtenerPeriodoPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el periodo', error });
    }
}

async function createPeriodo(req: Request, res: Response) {
    try {
        const result = await PeriodoService.crearPeriodo(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el periodo', error });
    }
}

async function updatePeriodo(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await PeriodoService.actualizarPeriodo(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el periodo', error });
    }
}
