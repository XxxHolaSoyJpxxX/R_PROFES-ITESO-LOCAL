import { isAnyArrayBuffer } from "node:util/types";
import { Evaluacion, IEvaluacionCreate } from "../models/mongo/evaluacion.model";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import Models from "../models/sql/models";

export const EvaluacionesService = {
    obtenerEvaluaciones,
    crearEvaluacion,
    obtenerEvaluacionesPorAlumno,
    obtenerEvaluacionesPorCursoProfesorId
};

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
        return { error: error, status: 500 };
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
        const sesClient = new SESClient({ region: "us-east-2" });
        const evaluacion = await Evaluacion.create(data)
        const evaluacionObject = evaluacion.toObject();
        const recipientEmail = process.env.EMAIL_RECIPIENT || "am720371@iteso.mx";
        const subject = `Nueva Evaluación Creada para el Profesor ${profesorNombre}`;
        const bodyHtml = `
            <h1>Evaluación Creada Exitosamente</h1>
            <p>Se ha creado una nueva evaluación con ID: <strong>${evaluacionObject._id}</strong>.</p>
            <p>Detalles:</p>
            <ul>
                <li>Profesor: ${profesorNombre}</li>
                <li>Puntuación: ${evaluacionObject.puntuacion_promedio} / 5</li>
                <li>Comentario: ${evaluacionObject.comentario}</li>
            </ul>
            <p>Gracias por su contribución.</p>
        `;
        const senderEmail = process.env.EMAIL_SENDER || "diego.gomezm@iteso.mx";
        const params = {
            Source: senderEmail,
            Destination: {
                ToAddresses: [recipientEmail],
            },
            Message: {
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject,
                },
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: bodyHtml,
                    },
                },
            },
        };

        const command = new SendEmailCommand(params);

        sesClient.send(command)
            .then(() => console.log(`Email de notificación enviado a ${recipientEmail}`))
            .catch(sesError => console.error("Error al enviar el correo con SES:", sesError));

        // 5. RETORNO DEL RESULTADO
        return evaluacionObject;
    } catch (error) {
        return { error: error, status: 500 };
    }
}

async function obtenerEvaluacionesPorCursoProfesorId(cursoProfesorId: string) {
    try{
        return await Evaluacion.find({curso_profesor_id: cursoProfesorId}).lean();
    } catch (error) {
        return {error: error, status: 500};
    }
}