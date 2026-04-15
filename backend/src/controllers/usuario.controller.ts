import { Request, Response } from "express";
import { UsuarioService } from "../services/usuario.service";

export const UsuarioController = {
    getUsuarios,
    getUsuariosByRol,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};

async function getUsuarios(req: Request, res: Response) {
    try {
        const result = await UsuarioService.obtenerUsuarios();
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
}

async function getUsuariosByRol(req: Request, res: Response) {
    try {
        const { rolId } = req.params;
        const result = await UsuarioService.obtenerUsuariosPorRol(rolId);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios por rol', error });
    }
}

async function getUsuarioById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await UsuarioService.obtenerUsuarioPorId(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
}

async function createUsuario(req: Request, res: Response) {
    try {
        const result = await UsuarioService.crearUsuario(req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', error });
    }
}

async function updateUsuario(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await UsuarioService.actualizarUsuario(id, req.body);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
}

async function deleteUsuario(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await UsuarioService.eliminarUsuario(id);
        if (result && (result as any).error) {
            return res.status((result as any).status).json({ message: (result as any).error });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
}
