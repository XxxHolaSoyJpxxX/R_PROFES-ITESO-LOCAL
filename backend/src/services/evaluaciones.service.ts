import { Evaluacion, IEvaluacionCreate } from "../models/mongo/evaluacion.model";
import nodemailer from "nodemailer";
import Models from "../models/sql/models";

export const EvaluacionesService = {
    obtenerEvaluaciones,
    crearEvaluacion,
    obtenerEvaluacionesPorAlumno,
    obtenerEvaluacionesPorCursoProfesorId
};

// Transporter local — apunta a Mailpit (SMTP en puerto 1025)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mailpit",
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: false,
    ignoreTLS: true,
});

async function obtenerEvaluaciones(evaluacionID: string, orderby: string = "newest") {
    try {
        let evaluaciones;
        switch (orderby) {
            case "newest":
                evaluaciones = await Evaluacion.find({ curso_profesor_alumno_id: evaluacionID }).sort({ fecha_creacion: -1 }).lean();
                return evaluaciones;
            case "oldest":
                evaluaciones = await Evaluacion.find({ curso_profesor_alumno_id: evaluacionID }).sort({ fecha_creacion: 1 }).lean();
                return evaluaciones;
            case "scoredesc":
                evaluaciones = await Evaluacion.find({ curso_profesor_alumno_id: evaluacionID }).sort({ puntuacion_promedio: -1 }).lean();
                return evaluaciones;
            case "scoreasc":
                evaluaciones = await Evaluacion.find({ curso_profesor_alumno_id: evaluacionID }).sort({ puntuacion_promedio: 1 }).lean();
                return evaluaciones;
            default:
                return { error: "Filtro no válido", status: 400 };
        }
    } catch (error) {
        return { error, status: 500 };
    }
}

async function obtenerEvaluacionesPorAlumno(expediente: string) {
    try {
        const cursosProfesorAlumno = await Models.CursoProfesorAlumnoModel.getCursosByAlumnoID(expediente);
        if (!cursosProfesorAlumno) {
            return { error: 'Cursos-Alumno no encontrado', status: 404 };
        }

        const evaluaciones = [];
        for (const cursoProfAlumno of cursosProfesorAlumno) {
            const evals = await Evaluacion.find({ curso_profesor_alumno_id: cursoProfAlumno.id }).lean();
            evaluaciones.push(...evals);
        }

        return evaluaciones;
    } catch (error) {
        return { error, status: 500 };
    }
}

async function crearEvaluacion(data: IEvaluacionCreate, profesorNombre: string) {
    try {
        const evaluacion = await Evaluacion.create(data);
        const evaluacionObject = evaluacion.toObject();

        const recipientEmail = process.env.EMAIL_RECIPIENT || "notificaciones@iteso.mx";
        const senderEmail    = process.env.EMAIL_SENDER    || "sistema@iteso.mx";

        // Enviar email via Mailpit (no bloquea el response)
        transporter.sendMail({
            from:    senderEmail,
            to:      recipientEmail,
            subject: `Nueva Evaluación — Profesor ${profesorNombre}`,
            html: `
                <h1>Evaluación Creada Exitosamente</h1>
                <p>ID: <strong>${evaluacionObject._id}</strong></p>
                <ul>
                    <li>Profesor: ${profesorNombre}</li>
                    <li>Puntuación: ${evaluacionObject.puntuacion_promedio} / 5</li>
                    <li>Comentario: ${evaluacionObject.comentario}</li>
                </ul>
            `,
        }).then(() => console.log(`Email enviado a ${recipientEmail}`))
          .catch(err => console.error("Error al enviar email:", err));

        return evaluacionObject;
    } catch (error) {
        return { error, status: 500 };
    }
}

async function obtenerEvaluacionesPorCursoProfesorId(cursoProfesorId: string) {
    try {
        return await Evaluacion.find({ curso_profesor_id: cursoProfesorId }).lean();
    } catch (error) {
        return { error, status: 500 };
    }
}