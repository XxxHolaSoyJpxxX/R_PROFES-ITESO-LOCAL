import { Schema, model, Document} from "mongoose";

export interface IEvaluacion extends Document {
    curso_profesor_alumno_id: string;
    curso_profesor_id: string;
    comentario: string;
    interaccion_evaluacion_p1: number;
    interaccion_evaluacion_p2: number;
    interaccion_evaluacion_p3: number;
    interaccion_evaluacion_p4: number;
    interaccion_evaluacion_p5: number;
    claridad_explicacion_p1: number;
    claridad_explicacion_p2: number;
    claridad_explicacion_p3: number;
    claridad_explicacion_p4: number;
    claridad_explicacion_p5: number;
    estilo_personalidad_p1: number;
    estilo_personalidad_p2: number;
    estilo_personalidad_p3: number;
    estilo_personalidad_p4: number;
    puntuacion_promedio: number;
    fecha_creacion: Date;
}

export interface IEvaluacionCreate {
    curso_profesor_alumno_id: string;
    curso_profesor_id: string;
    comentario: string;
    interaccion_evaluacion_p1: number;
    interaccion_evaluacion_p2: number;
    interaccion_evaluacion_p3: number;
    interaccion_evaluacion_p4: number;
    interaccion_evaluacion_p5: number;
    claridad_explicacion_p1: number;
    claridad_explicacion_p2: number;
    claridad_explicacion_p3: number;
    claridad_explicacion_p4: number;
    claridad_explicacion_p5: number;
    estilo_personalidad_p1: number;
    estilo_personalidad_p2: number;
    estilo_personalidad_p3: number;
    estilo_personalidad_p4: number;
    puntuacion_promedio: number;
}


const EvaluacionSchema = new Schema<IEvaluacion>({
    curso_profesor_alumno_id: { type: String, required: true, unique: true },
    curso_profesor_id: { type: String, required: true },
    comentario: { type: String, required: true },
    interaccion_evaluacion_p1: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    interaccion_evaluacion_p2: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    interaccion_evaluacion_p3: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    interaccion_evaluacion_p4: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    interaccion_evaluacion_p5: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    claridad_explicacion_p1: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    claridad_explicacion_p2: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    claridad_explicacion_p3: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    claridad_explicacion_p4: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    claridad_explicacion_p5: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    estilo_personalidad_p1: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    estilo_personalidad_p2: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    estilo_personalidad_p3: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        },
    },
    estilo_personalidad_p4: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        }
    },
    puntuacion_promedio: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer.'
        }
    },
    fecha_creacion: {
        type: Date,
        default: () => new Date()
    }
}, {
    collection: 'evaluaciones',
});

export const Evaluacion = model<IEvaluacion>('Evaluacion', EvaluacionSchema);