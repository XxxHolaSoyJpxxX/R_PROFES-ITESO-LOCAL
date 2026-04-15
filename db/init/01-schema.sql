-- ===========================================================
-- SCHEMA MySQL — ITESO Local
-- ===========================================================
USE iteso_db;

CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) NOT NULL,
    rol VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS areas_academicas (
    id CHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS modalidad (
    id CHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS periodo (
    id CHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuario (
    expediente CHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido_paterno VARCHAR(255) NOT NULL,
    apellido_materno VARCHAR(255) NOT NULL,
    fecha_de_nacimiento DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    rol CHAR(36) NOT NULL,
    activo BOOLEAN NOT NULL,
    imagen TEXT NOT NULL,
    PRIMARY KEY (expediente),
    CONSTRAINT usuario_rol_foreign FOREIGN KEY (rol) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS departamentos_academicos (
    id CHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    coordinador CHAR(36) NOT NULL,
    area_academica_id CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT departamentos_coordinador_foreign FOREIGN KEY (coordinador) REFERENCES usuario (expediente),
    CONSTRAINT departamentos_area_foreign FOREIGN KEY (area_academica_id) REFERENCES areas_academicas (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carreras (
    id CHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    departamento CHAR(36) NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT carreras_departamento_foreign FOREIGN KEY (departamento) REFERENCES areas_academicas (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cursos (
    id CHAR(36) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    creditos INT NOT NULL,
    activo BOOLEAN NOT NULL,
    departamento_id CHAR(36) NOT NULL,
    modalidad CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT cursos_departamento_id_foreign FOREIGN KEY (departamento_id) REFERENCES departamentos_academicos (id),
    CONSTRAINT cursos_modalidad_foreign FOREIGN KEY (modalidad) REFERENCES modalidad (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alumnos (
    expediente CHAR(36) NOT NULL,
    carrera CHAR(36) NOT NULL,
    status VARCHAR(255) NOT NULL,
    PRIMARY KEY (expediente),
    CONSTRAINT alumnos_expediente_foreign FOREIGN KEY (expediente) REFERENCES usuario (expediente),
    CONSTRAINT alumnos_carrera_foreign FOREIGN KEY (carrera) REFERENCES carreras (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cursos_profesores (
    id CHAR(36) NOT NULL,
    profesor_expediente CHAR(36) NOT NULL,
    curso_id CHAR(36) NOT NULL,
    periodo CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT cursos_profesores_profesor_foreign FOREIGN KEY (profesor_expediente) REFERENCES usuario (expediente),
    CONSTRAINT cursos_profesores_curso_foreign FOREIGN KEY (curso_id) REFERENCES cursos (id),
    CONSTRAINT cursos_profesores_periodo_foreign FOREIGN KEY (periodo) REFERENCES periodo (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX IF NOT EXISTS cursos_profesores_profesor_index ON cursos_profesores (profesor_expediente);
CREATE INDEX IF NOT EXISTS cursos_profesores_curso_index ON cursos_profesores (curso_id);

CREATE TABLE IF NOT EXISTS cursos_carreras (
    id CHAR(36) NOT NULL,
    carrera_id CHAR(36) NOT NULL,
    curso_id CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT cursos_carreras_carrera_foreign FOREIGN KEY (carrera_id) REFERENCES carreras (id),
    CONSTRAINT cursos_carreras_curso_foreign FOREIGN KEY (curso_id) REFERENCES cursos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS curso_profesor_alumno (
    id CHAR(36) NOT NULL,
    curso_profesor_id CHAR(36) NOT NULL,
    alumno_id CHAR(36) NOT NULL,
    calificacion INT NOT NULL,
    activo BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT cpa_curso_profesor_foreign FOREIGN KEY (curso_profesor_id) REFERENCES cursos_profesores (id),
    CONSTRAINT cpa_alumno_foreign FOREIGN KEY (alumno_id) REFERENCES alumnos (expediente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX IF NOT EXISTS cpa_alumno_index ON curso_profesor_alumno (alumno_id);
