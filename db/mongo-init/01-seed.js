// ===========================================================
// MongoDB seed — ITESO Local
// Colecciones: evaluaciones, recursos
// Corre automáticamente al iniciar el contenedor
// ===========================================================

db = db.getSiblingDB('iteso_nube');

// ── evaluaciones ─────────────────────────────────────────────
// Estructura: alumno evalúa a un profesor en un curso específico
// curso_profesor_alumno_id  →  FK a MySQL.curso_profesor_alumno.id
// curso_profesor_id         →  FK a MySQL.cursos_profesores.id

db.evaluaciones.drop();
db.evaluaciones.insertMany([
  {
    // Miguel (200) evalúa a Carlos en BD I (cpa_id=1, cp_id=1)
    curso_profesor_alumno_id: "1",
    curso_profesor_id: "1",
    comentario: "Muy buen profesor, explica con claridad y siempre dispuesto a resolver dudas.",
    interaccion_evaluacion_p1: 5,
    interaccion_evaluacion_p2: 4,
    interaccion_evaluacion_p3: 5,
    interaccion_evaluacion_p4: 4,
    interaccion_evaluacion_p5: 5,
    claridad_explicacion_p1: 5,
    claridad_explicacion_p2: 4,
    claridad_explicacion_p3: 5,
    claridad_explicacion_p4: 4,
    claridad_explicacion_p5: 5,
    estilo_personalidad_p1: 5,
    estilo_personalidad_p2: 4,
    estilo_personalidad_p3: 5,
    estilo_personalidad_p4: 4,
    puntuacion_promedio: 5,
    fecha_creacion: new Date("2025-05-20")
  },
  {
    // Paola (201) evalúa a Carlos en BD I (cpa_id=2, cp_id=1)
    curso_profesor_alumno_id: "2",
    curso_profesor_id: "1",
    comentario: "Buen profesor, aunque a veces va muy rápido en los temas.",
    interaccion_evaluacion_p1: 4,
    interaccion_evaluacion_p2: 3,
    interaccion_evaluacion_p3: 4,
    interaccion_evaluacion_p4: 4,
    interaccion_evaluacion_p5: 3,
    claridad_explicacion_p1: 3,
    claridad_explicacion_p2: 4,
    claridad_explicacion_p3: 3,
    claridad_explicacion_p4: 4,
    claridad_explicacion_p5: 3,
    estilo_personalidad_p1: 4,
    estilo_personalidad_p2: 4,
    estilo_personalidad_p3: 3,
    estilo_personalidad_p4: 4,
    puntuacion_promedio: 4,
    fecha_creacion: new Date("2025-05-21")
  },
  {
    // Miguel (200) evalúa a Carlos en Algoritmos (cpa_id=4, cp_id=2)
    curso_profesor_alumno_id: "4",
    curso_profesor_id: "2",
    comentario: "Excelente curso. Los ejemplos prácticos ayudan mucho a entender.",
    interaccion_evaluacion_p1: 5,
    interaccion_evaluacion_p2: 5,
    interaccion_evaluacion_p3: 4,
    interaccion_evaluacion_p4: 5,
    interaccion_evaluacion_p5: 4,
    claridad_explicacion_p1: 5,
    claridad_explicacion_p2: 5,
    claridad_explicacion_p3: 4,
    claridad_explicacion_p4: 5,
    claridad_explicacion_p5: 5,
    estilo_personalidad_p1: 5,
    estilo_personalidad_p2: 5,
    estilo_personalidad_p3: 4,
    estilo_personalidad_p4: 5,
    puntuacion_promedio: 5,
    fecha_creacion: new Date("2025-05-22")
  },
  {
    // Javier (202) evalúa a Ana en Cálculo (cpa_id=5, cp_id=3)
    curso_profesor_alumno_id: "5",
    curso_profesor_id: "3",
    comentario: "La profesora es muy paciente y da buenos ejemplos.",
    interaccion_evaluacion_p1: 4,
    interaccion_evaluacion_p2: 4,
    interaccion_evaluacion_p3: 5,
    interaccion_evaluacion_p4: 4,
    interaccion_evaluacion_p5: 4,
    claridad_explicacion_p1: 4,
    claridad_explicacion_p2: 5,
    claridad_explicacion_p3: 4,
    claridad_explicacion_p4: 4,
    claridad_explicacion_p5: 5,
    estilo_personalidad_p1: 5,
    estilo_personalidad_p2: 4,
    estilo_personalidad_p3: 4,
    estilo_personalidad_p4: 5,
    puntuacion_promedio: 4,
    fecha_creacion: new Date("2025-12-05")
  },
  {
    // Paola (201) evalúa a Ana en BD I Ago-Dic (cpa_id=6, cp_id=4)
    curso_profesor_alumno_id: "6",
    curso_profesor_id: "4",
    comentario: "Muy buena profesora, explica diferente a Carlos y se complementan bien.",
    interaccion_evaluacion_p1: 5,
    interaccion_evaluacion_p2: 4,
    interaccion_evaluacion_p3: 4,
    interaccion_evaluacion_p4: 5,
    interaccion_evaluacion_p5: 5,
    claridad_explicacion_p1: 5,
    claridad_explicacion_p2: 4,
    claridad_explicacion_p3: 5,
    claridad_explicacion_p4: 4,
    claridad_explicacion_p5: 4,
    estilo_personalidad_p1: 4,
    estilo_personalidad_p2: 5,
    estilo_personalidad_p3: 5,
    estilo_personalidad_p4: 4,
    puntuacion_promedio: 5,
    fecha_creacion: new Date("2025-12-06")
  }
]);

// ── recursos ──────────────────────────────────────────────────
// Archivos/links que los profesores suben a S3/MinIO
// url apunta a MinIO local en vez de S3

db.getCollection('test.recursos').drop();
db.getCollection('test.recursos').insertMany([
  {
    _id: "recurso-001",
    profesor_expediente: "101",   // Carlos
    url: "http://localhost:9000/iteso-archivos/recursos/slides-bd1-unidad1.pdf",
    nombre: "Slides BD I — Unidad 1: Modelo Relacional",
    tipo: "pdf",
    createdAt: new Date("2025-01-15")
  },
  {
    _id: "recurso-002",
    profesor_expediente: "101",   // Carlos
    url: "http://localhost:9000/iteso-archivos/recursos/ejercicios-algoritmos.pdf",
    nombre: "Ejercicios Algoritmos — Semana 3",
    tipo: "pdf",
    createdAt: new Date("2025-02-10")
  },
  {
    _id: "recurso-003",
    profesor_expediente: "102",   // Ana
    url: "http://localhost:9000/iteso-archivos/recursos/formulario-calculo.pdf",
    nombre: "Formulario Cálculo Diferencial",
    tipo: "pdf",
    createdAt: new Date("2025-08-20")
  },
  {
    _id: "recurso-004",
    profesor_expediente: "102",   // Ana
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    nombre: "Video: Introducción a Integrales",
    tipo: "video",
    createdAt: new Date("2025-09-01")
  }
]);

print("✅ MongoDB seed completado — evaluaciones: " + db.evaluaciones.countDocuments() + ", recursos: " + db.getCollection('test.recursos').countDocuments());
