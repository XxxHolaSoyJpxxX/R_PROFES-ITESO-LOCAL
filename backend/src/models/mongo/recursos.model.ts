import { Schema, model, Document, Types } from "mongoose";

// Omitimos _id de Document para redefinirlo como string
export interface IRecurso extends Omit<Document, '_id'> {
    _id: string;
    profesor_expediente: string;
    url: string;
    nombre: string;
    tipo: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IRecursoCreate {
    profesor_expediente: string;
    url: string;
    nombre: string;
    tipo: string;
}

const RecursoSchema = new Schema<IRecurso>(
    {
        _id: { type: String, required: true },
        profesor_expediente: { type: String, required: true },
        url: { type: String, required: true },
        nombre: { type: String, required: true },
        tipo: { type: String, required: false },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true, collection: 'test.recursos' }
);

const RecursoMongoModel = model<IRecurso>('Recurso', RecursoSchema);

const getRecursosByProfesor = async (profesorExpediente: string): Promise<IRecurso[]> => {
    return await RecursoMongoModel.find({ profesor_expediente: profesorExpediente }).exec();
};

const getRecursoById = async (id: string): Promise<IRecurso | null> => {
    return await RecursoMongoModel.findById(id).exec();
};

const createRecurso = async (recurso: IRecursoCreate & { _id: string }): Promise<IRecurso> => {
    const nuevoRecurso = new RecursoMongoModel(recurso);
    return await nuevoRecurso.save();
};

const updateRecurso = async (id: string, recurso: Partial<IRecursoCreate>): Promise<IRecurso | null> => {
    return await RecursoMongoModel.findByIdAndUpdate(id, recurso, { new: true }).exec();
};

const deleteRecurso = async (id: string): Promise<IRecurso | null> => {
    return await RecursoMongoModel.findByIdAndDelete(id).exec();
};

export const RecursoMongoModelExport = {
    getRecursosByProfesor,
    getRecursoById,
    createRecurso,
    updateRecurso,
    deleteRecurso
};