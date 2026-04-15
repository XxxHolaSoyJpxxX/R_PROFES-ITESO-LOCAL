-- ===========================================================
-- MOCK DATA — ITESO Local
-- Usuarios con emails para probar login via Keycloak
-- ===========================================================
USE iteso_db;

-- ROLES
INSERT INTO roles (id, rol) VALUES
('1', 'ADMIN'),
('2', 'PROFESOR'),
('3', 'ALUMNO'),
('4', 'COORDINADOR');

-- AREAS ACADEMICAS
INSERT INTO areas_academicas (id, nombre) VALUES
('1', 'Ingeniería'),
('2', 'Ciencias Sociales');

-- MODALIDADES
INSERT INTO modalidad (id, nombre, descripcion) VALUES
('1', 'Presencial', 'Clases presenciales en campus'),
('2', 'En línea', 'Clases completamente en línea');

-- PERIODOS
INSERT INTO periodo (id, start_date, end_date, name) VALUES
('1', '2025-01-06', '2025-05-30', 'Enero - Mayo 2025'),
('2', '2025-08-04', '2025-12-12', 'Agosto - Diciembre 2025');

-- ----------------------------------------------------------------
-- USUARIOS
-- Email = mismo que en Keycloak para que el SSO funcione
-- ----------------------------------------------------------------
INSERT INTO usuario (
    expediente, nombre, apellido_paterno, apellido_materno,
    fecha_de_nacimiento, email, rol, activo, imagen
) VALUES
-- Coordinador / Admin  →  admin@iteso.mx  / Admin123!
('100', 'Laura', 'Gómez', 'Ramírez',
 '1980-03-15', 'admin@iteso.mx', '1', 1, ''),

-- Profesor 1  →  profesor@iteso.mx  / Profesor123!
('101', 'Carlos', 'Pérez', 'López',
 '1975-09-21', 'profesor@iteso.mx', '2', 1, ''),

-- Profesor 2  →  profesor2@iteso.mx  / Profesor2123!
('102', 'Ana', 'Martínez', 'Hernández',
 '1982-11-02', 'profesor2@iteso.mx', '2', 1, ''),

-- Alumno 1  →  alumno@iteso.mx  / Alumno123!
('200', 'Miguel', 'Santos', 'Vega',
 '2004-05-10', 'alumno@iteso.mx', '3', 1, ''),

-- Alumno 2  →  alumno2@iteso.mx  / Alumno2123!
('201', 'Paola', 'Ruiz', 'Castillo',
 '2003-08-25', 'alumno2@iteso.mx', '3', 1, ''),

-- Alumno 3  →  alumno3@iteso.mx  / Alumno3123!
('202', 'Javier', 'Luna', 'Flores',
 '2004-01-30', 'alumno3@iteso.mx', '3', 1, '');

-- DEPARTAMENTOS (necesitan que usuario 100 ya exista)
INSERT INTO departamentos_academicos (
    id, nombre, descripcion, coordinador, area_academica_id
) VALUES
('1', 'Departamento de Sistemas',
 'Asignaturas de desarrollo de software y sistemas.',
 '100', '1'),
('2', 'Departamento de Matemáticas',
 'Matemáticas básicas y avanzadas.',
 '100', '1');

-- CARRERAS
INSERT INTO carreras (id, nombre, departamento, activo) VALUES
('1', 'Ingeniería en Desarrollo de Software', '1', 1),
('2', 'Ingeniería Civil', '1', 1);

-- CURSOS
INSERT INTO cursos (id, nombre, creditos, activo, departamento_id, modalidad) VALUES
('1', 'Bases de Datos I', 8, 1, '1', '1'),
('2', 'Algoritmos y Estructuras de Datos', 10, 1, '1', '1'),
('3', 'Cálculo Diferencial e Integral', 8, 1, '2', '2');

-- ALUMNOS
INSERT INTO alumnos (expediente, carrera, status) VALUES
('200', '1', 'ALUMNO'),
('201', '1', 'ALUMNO'),
('202', '2', 'ALUMNO');

-- CURSOS_PROFESORES
INSERT INTO cursos_profesores (id, profesor_expediente, curso_id, periodo) VALUES
('1', '101', '1', '1'),   -- Carlos: BD I  Ene-May 2025
('2', '101', '2', '1'),   -- Carlos: Algoritmos  Ene-May 2025
('3', '102', '3', '2'),   -- Ana: Cálculo  Ago-Dic 2025
('4', '102', '1', '2');   -- Ana: BD I  Ago-Dic 2025 (más datos para el front)

-- CURSOS_CARRERAS
INSERT INTO cursos_carreras (id, carrera_id, curso_id) VALUES
('1', '1', '1'),
('2', '1', '2'),
('3', '1', '3'),
('4', '2', '3');

-- INSCRIPCIONES (curso_profesor_alumno)
INSERT INTO curso_profesor_alumno (
    id, curso_profesor_id, alumno_id, calificacion, activo
) VALUES
('1', '1', '200', 95, 1),   -- Miguel: BD I con Carlos
('2', '1', '201', 88, 1),   -- Paola: BD I con Carlos
('3', '1', '202', 76, 0),   -- Javier: BD I con Carlos (baja)
('4', '2', '200', 90, 1),   -- Miguel: Algoritmos con Carlos
('5', '3', '202', 82, 1),   -- Javier: Cálculo con Ana
('6', '4', '201', 91, 1),   -- Paola: BD I con Ana (Ago-Dic)
('7', '4', '200', 85, 1);   -- Miguel: BD I con Ana (Ago-Dic)
