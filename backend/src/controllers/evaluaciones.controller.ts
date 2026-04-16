import { Request, Response, NextFunction } from "express";
import { EvaluacionesService } from "../services/evaluaciones.service";
import { CursoService } from "../services/cursos.service";
import { UsuarioService } from "../services/usuario.service";
import {CursosProfesoresService} from "../services/cursos-profesores.service";
import { Usuario } from "../models/sql/usuarios.model";
import Models from "../models/sql/models";
import { CursoProfesor } from "../models/sql/cursos-profesores.model";

export const EvaluacionesController = {
    obtenerEvaluaciones,
    crearEvaluaciones,
    obtenerEvaluacionesPorIdProfesorYCurso
}

async function obtenerEvaluaciones(req: Request, res: Response) {
    try {
        let orderBy = req.query["orderby"];
        let evaluacionId = req.params["id"];
        let evaluaciones;
        if (orderBy) {
            orderBy = orderBy as string;
            evaluaciones = await EvaluacionesService.obtenerEvaluaciones(evaluacionId, orderBy.toLowerCase());
        } else evaluaciones = await EvaluacionesService.obtenerEvaluaciones(evaluacionId);
        if(evaluaciones === null || evaluaciones === undefined) {
            return res.status(404).json({message: "Evaluacion no encontrada"});
        }
        if("error" in evaluaciones) {
            return res.status(evaluaciones.status).json({message: evaluaciones.error});
        }
        return res.json(evaluaciones);
    } catch (error) {
        return res.status(500).json({message: "Error al obtener las evaluaciones. ", error});
    }
}

async function crearEvaluaciones(req: Request, res: Response) {
    try{
        const requiredFields = [
            "comentario",
            "interaccion_evaluacion_p1",
            "interaccion_evaluacion_p2",
            "interaccion_evaluacion_p3",
            "interaccion_evaluacion_p4",
            "interaccion_evaluacion_p5",
            "claridad_explicacion_p1",
            "claridad_explicacion_p2",
            "claridad_explicacion_p3",
            "claridad_explicacion_p4",
            "claridad_explicacion_p5",
            "estilo_personalidad_p1",
            "estilo_personalidad_p2",
            "estilo_personalidad_p3",
            "estilo_personalidad_p4",
        ]
        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === null) {
                return res.status(400).json({message: `Falta el campo: ${field}`});
            }
        }
        
        // Usar modelo directo en lugar de servicio intermedio
        const cursoProfesorAlumno = await Models.CursoProfesorAlumnoModel.getCursoById(req.params.id);
        
        if (!cursoProfesorAlumno) {
            return res.status(404).json({ message: "Inscripción no encontrada" });
        }
        
        const curso_profesor_id = cursoProfesorAlumno.curso_profesor_id;
        const promedio =
            (req.body.interaccion_evaluacion_p1 +
            req.body.interaccion_evaluacion_p2 +
            req.body.interaccion_evaluacion_p3 +
            req.body.interaccion_evaluacion_p4 +
            req.body.interaccion_evaluacion_p5 +
            req.body.claridad_explicacion_p1 +
            req.body.claridad_explicacion_p2 +
            req.body.claridad_explicacion_p3 +
            req.body.claridad_explicacion_p4 +
            req.body.claridad_explicacion_p5 +
            req.body.estilo_personalidad_p1 +
            req.body.estilo_personalidad_p2 +
            req.body.estilo_personalidad_p3 +
            req.body.claridad_explicacion_p4)/14

        const data = {
            curso_profesor_alumno_id: req.params.id,
            curso_profesor_id: curso_profesor_id,
            comentario: req.body.comentario,

            interaccion_evaluacion_p1: req.body.interaccion_evaluacion_p1,
            interaccion_evaluacion_p2: req.body.interaccion_evaluacion_p2,
            interaccion_evaluacion_p3: req.body.interaccion_evaluacion_p3,
            interaccion_evaluacion_p4: req.body.interaccion_evaluacion_p4,
            interaccion_evaluacion_p5: req.body.interaccion_evaluacion_p5,

            claridad_explicacion_p1: req.body.claridad_explicacion_p1,
            claridad_explicacion_p2: req.body.claridad_explicacion_p2,
            claridad_explicacion_p3: req.body.claridad_explicacion_p3,
            claridad_explicacion_p4: req.body.claridad_explicacion_p4,
            claridad_explicacion_p5: req.body.claridad_explicacion_p5,

            estilo_personalidad_p1: req.body.estilo_personalidad_p1,
            estilo_personalidad_p2: req.body.estilo_personalidad_p2,
            estilo_personalidad_p3: req.body.estilo_personalidad_p3,
            estilo_personalidad_p4: req.body.estilo_personalidad_p4,
            puntuacion_promedio: Math.trunc(promedio),
        };
        const cursoProfesor = await Models.CursoProfesorModel.getCursoProfesorByID(curso_profesor_id);
        if (!cursoProfesor) {
             return res.status(404).json({ message: "Curso Profesor no encontrado" });
        }
        const profesor = await UsuarioService.obtenerUsuarioPorId((cursoProfesor as CursoProfesor).profesor_expediente);
        const nombreProfesor = (profesor as Usuario).nombre + (profesor as Usuario).apellido_paterno
        const evaluacion = await EvaluacionesService.crearEvaluacion(data, nombreProfesor);
        if("error" in evaluacion) {
            return res.status(Number(evaluacion.status)).json({message: evaluacion.error});
        }
        return res.status(201).json(evaluacion);
    } catch (error) {
        console.error("ERROR EVALUACION:", error);
        console.log("Error details:",error);
        return res.status(500).json({message: "Error al crear la evaluacion. ", error});
    }
}

async function obtenerEvaluacionesPorIdProfesorYCurso(req: Request, res: Response) {
    try {
        const expediente = req.params.expediente;
        const cursoId = req.params.cursoId;
        const profesor = await UsuarioService.obtenerUsuarioPorId(expediente);
        if ("error" in profesor) {
            return res.status(Number(profesor.status)).json({message: profesor.error});
        }
        if ((profesor.rol as any).id !== '2'){
            return res.status(400).json({message: "El usuario no tiene evaluaciones por que no es PROFESOR"});
        }

        const curso = await CursoService.obtenerCursoPorId(cursoId);
        if ("error" in curso) {
            return res.status(Number(curso.status)).json({message: curso.error});
        }

        const cursoProfesor =
            await CursosProfesoresService.obtenerCursosProfesorPorProfesorYCurso(expediente, cursoId);
        if ("error" in cursoProfesor) {
            return res.status(Number(cursoProfesor.status)).json({message: cursoProfesor.error});
        }
        const cursoProfesorId = cursoProfesor[0].id;
        const evaluacion = await EvaluacionesService.obtenerEvaluacionesPorCursoProfesorId(cursoProfesorId);
        if("error" in evaluacion) {
            return res.status(Number(evaluacion.status)).json({message: evaluacion.error});
        }
        return res.status(200).json(evaluacion);
    } catch (error) {
        return res.status(500).json({message: "Error al obtener evaluaciones.", error});
    }
}