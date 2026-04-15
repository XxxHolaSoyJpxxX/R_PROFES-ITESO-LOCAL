import { Request, Response } from "express";
import { AreaAcademicaService } from "../services/areas-academicas.service";

export const AreasAcademicasController = {
    getAreasAcademicas,
    getAreaAcademicaById,
    createAreaAcademica,
    updateAreaAcademica,
    deleteAreaAcademica
};

async function getAreasAcademicas(req: Request, res: Response) {
    try {
        const result = await AreaAcademicaService.obtenerAreasAcademicas();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las áreas académicas', error });
    }
}

async function getAreaAcademicaById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await AreaAcademicaService.obtenerAreaAcademicaPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el área académica', error });
    }
}

async function createAreaAcademica(req: Request, res: Response) {
    try {
        const result = await AreaAcademicaService.crearAreaAcademica(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el área académica', error });
    }
}

async function updateAreaAcademica(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await AreaAcademicaService.actualizarAreaAcademica(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el área académica', error });
    }
}

async function deleteAreaAcademica(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await AreaAcademicaService.eliminarAreaAcademica(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el área académica', error });
    }
}
