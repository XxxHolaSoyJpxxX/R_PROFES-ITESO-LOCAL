import Models from "../models/sql/models";
import { UsuarioService } from "./usuario.service";
import { CarrerasService } from "./carreras.service";

export const AlumnoService = {
    crearAlumno,
    obtenerAlumnos,
    obtenerAlumnoPorExpediente,
    obtenerAlumnoCursos,
    actualizarAlumno,
    eliminarAlumno

}

async function crearAlumno(datosAlumno: any) {
    const resultUsuario = await UsuarioService.crearUsuario(datosAlumno);
    const resultAlumno = await Models.AlumnoModel.createAlumno(datosAlumno);
    return { ...resultUsuario, ...resultAlumno };
}

async function obtenerAlumnos() {
    const usuarios = await UsuarioService.obtenerUsuariosPorRol('3'); // Rol 3 = Alumno
    if ('error' in usuarios) {
        return { error: usuarios.error, status: usuarios.status };
    }
    const alumnos = await Models.AlumnoModel.getAllAlumnos();

    // Combinar la información del usuario y los detalles del alumno
    for (const alumno of alumnos) {
        const usuario = usuarios.find(u => u.expediente === alumno.expediente);
        if (usuario) {
            Object.assign(alumno, usuario);
        }
        const carrera = await CarrerasService.obtenerCarreraPorId(alumno.carrera);
        if (carrera && !('error' in carrera)) {
            (alumno as any).carrera = carrera;
        }
        else {
            return { error: carrera.error, status: carrera.status };
        }
    }

    return alumnos;
}

async function obtenerAlumnoPorExpediente(expediente: string) {
    // Obtener información del usuario
    const usuario = await UsuarioService.obtenerUsuarioPorId(expediente);

    // Validar si el usuario existe
    if ('error' in usuario) {
        return { error: usuario.error, status: usuario.status };
    }

    // Obtener detalles específicos del alumno
    const alumnoDetails = await Models.AlumnoModel.getAlumnoByExpediente(expediente);
    if (!alumnoDetails) {
        return { error: 'Alumno no encontrado', status: 404 };
    }

    const carrera = await CarrerasService.obtenerCarreraPorId(alumnoDetails.carrera);
    if (carrera && !('error' in carrera)) {
        (alumnoDetails as any).carrera = carrera;
    }
    else {
        return { error: carrera.error, status: carrera.status };
    }

    // Combinar la información del usuario y los detalles del alumno
    return { ...usuario, ...alumnoDetails };
}

async function obtenerAlumnoCursos(expediente: string) {

    const cursos = await Models.CursoProfesorAlumnoModel.getCursosByAlumnoID(expediente);

    const alumno = await obtenerAlumnoPorExpediente(expediente);

    for (const curso of cursos) {

        const cursos_profesor = await Models.CursoProfesorModel.getCursoProfesorByID(curso.curso_profesor_id);

        if (cursos_profesor && !('error' in cursos_profesor)) {
            (curso as any).curso_profesor_id = cursos_profesor;
        }
        else {
            return { error: cursos_profesor?.error, status: 404 };
        }

        const cursoDetails = await Models.CursoModel.getCursoById((cursos_profesor as any).curso_id );

        if (cursoDetails && !('error' in cursoDetails)) {
            (curso as any).curso_profesor_id.curso_id = cursoDetails;
        }
        else {
            return { error: "No se encontraron los detalles del curso", status: 404 };
        }

        const profesor = await UsuarioService.obtenerUsuarioPorId((cursos_profesor as any).profesor_expediente);
        if (profesor && !('error' in profesor)) {
            (curso as any).curso_profesor_id.profesor_expediente = profesor;
        }
        else {
            return { error: profesor.error, status: profesor.status };
        }

    }

    if ('error' in alumno) {
        if (alumno.status === 404) {
            return { error: 'Alumno no encontrado', status: 404 };
        }
    }

    (alumno as any).cursos = cursos;

    return alumno;
}

async function actualizarAlumno(expediente: string, datosActualizados: any) {
    const resultUsuario = await UsuarioService.actualizarUsuario(expediente, datosActualizados);
    const resultAlumno = await Models.AlumnoModel.updateAlumno(expediente, datosActualizados);

    if ('error' in resultUsuario) {
        return { error: resultUsuario.error, status: resultUsuario.status };
    }

    if (!resultAlumno) {
        return { error: 'Alumno no encontrado', status: 404 };
    }

    return { ...resultUsuario, ...resultAlumno };
}

async function eliminarAlumno(expediente: string) {
    const resultUsuario = await UsuarioService.eliminarUsuario(expediente);
    return resultUsuario;
}

// async function testObtenerAlumnoCursos() {
//     const cursosData = await obtenerAlumnoCursos("200")
//     console.log(JSON.stringify(cursosData, null, 2));
// }

// testObtenerAlumnoCursos();

