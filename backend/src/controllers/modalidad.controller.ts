import { Request, Response } from "express";
import { ModalidadService } from "../services/modalidad.service";

export const ModalidadController = {
    getModalidades,
    getModalidadById,
    createModalidad,
    updateModalidad,
    deleteModalidad
};

async function getModalidades(req: Request, res: Response) {
    try {
        const result = await ModalidadService.obtenerModalidades();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las modalidades', error });
    }
}

async function getModalidadById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await ModalidadService.obtenerModalidadPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la modalidad', error });
    }
}

async function createModalidad(req: Request, res: Response) {
    try {
        const result = await ModalidadService.crearModalidad(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la modalidad', error });
    }
}

async function updateModalidad(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await ModalidadService.actualizarModalidad(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la modalidad', error });
    }
}

async function deleteModalidad(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await ModalidadService.eliminarModalidad(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la modalidad', error });
    }
}
