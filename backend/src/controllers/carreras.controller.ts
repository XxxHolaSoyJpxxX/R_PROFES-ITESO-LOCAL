import { Request, Response } from "express";
import { CarrerasService } from "../services/carreras.service";

export const CarrerasController = {
    getCarreras,
    getCarreraById,
    createCarrera,
    updateCarrera,
    deactivateCarrera
};

async function getCarreras(req: Request, res: Response) {
    try {
        const area = req.query.area as string;
        const result = await CarrerasService.obtenerCarreras({ area });
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las carreras', error });
    }
}

async function getCarreraById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CarrerasService.obtenerCarreraPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la carrera', error });
    }
}

async function createCarrera(req: Request, res: Response) {
    try {
        const result = await CarrerasService.crearCarrera(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la carrera', error });
    }
}

async function updateCarrera(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CarrerasService.actualizarCarrera(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la carrera', error });
    }
}

async function deactivateCarrera(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await CarrerasService.desactivarCarrera(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar la carrera', error });
    }
}
