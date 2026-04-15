import { Router } from "express";
import AlumnosController from "../controllers/alumnos.controller";
import { verificarRol } from "../middlewares/rol.middleware";

const router = Router();

router.get("/:expediente", AlumnosController.getAlumnoByExpediente);
router.get("/:expediente/cursos", AlumnosController.getAlumnoCursos);
router.get("/:expediente/evaluaciones", AlumnosController.getAlumnoEvaluaciones);

router.post("/", verificarRol(['admin']), AlumnosController.createAlumno);
router.put("/:expediente", verificarRol(['admin']), AlumnosController.updateAlumno);
router.delete("/:expediente", verificarRol(['admin']), AlumnosController.deleteAlumno);

export default router;