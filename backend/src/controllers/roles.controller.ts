import { Request, Response } from "express";
import { RolesService } from "../services/roles.service";

export const RolesController = {
    getRoles,
    getRolById,
    createRol,
    updateRol
};

async function getRoles(req: Request, res: Response) {
    try {
        const result = await RolesService.obtenerRoles();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los roles', error });
    }
}

async function getRolById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await RolesService.obtenerRolPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el rol', error });
    }
}

async function createRol(req: Request, res: Response) {
    try {
        const result = await RolesService.crearRol(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el rol', error });
    }
}

async function updateRol(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await RolesService.actualizarRol(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el rol', error });
    }
}
