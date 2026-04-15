import { Router } from 'express';
import { EvaluacionesController } from "../controllers/evaluaciones.controller";

const router = Router();

router.get("/:id/evaluaciones", EvaluacionesController.obtenerEvaluaciones);
router.post("/:id/evaluaciones", EvaluacionesController.crearEvaluaciones);

export default router;