# Endpoints

## Alumnos

/alumnos

- GET /alumnos/{expediente}
- GET /alumnos/{expediente}/cursos
- GET alumnos/{expediente}/evaluaciones

## Profesores

/profesores

- GET /profesores
- GET /profesores/{expediente}
- GET /profesores/{expediente}/cursos
- GET /profesores/{expediente}/cursos/{id}

### Profesores Recursos
- POST /profesores/{expediente}/recursos
    
    Crea un recurso nuevo (paper, red social, certificado, etc.).
    
- GET /profesores/{expediente}/recursos
    
    Lista todos los recursos del profesor.
    
- GET /profesores/{expediente}/recursos/{id}
    
    Obtiene un recurso específico.
    
- PUT /profesores/{expediente}/recursos/{id}
    
    Actualiza un recurso.
    
- DELETE /profesores/{expediente}/recursos/{id}
    
    Elimina un recurso.

### Profesores evaluaciones
- POST inscripciones/{id}/evaluaciones
- GET inscripciones/{id}/evaluaciones
- GET inscripciones/{id}/evaluaciones?orderby=scoredesc/scoreasc/newest/oldest

## Cursos
- GET /cursos
- GET /cursos?carrera={id}
- GET /cursos?profesor=id
- GET /cursos/{id}
- GET /cursos/{id}/profesores

## Carreras
- GET /carreras
- GET /carreras?area=id
- GET /carreras/{id}

## Admin
- POST /alumnos
- PUT /alumnos/{expediente}
- DELETE /alumnos/{expediente}
<br></br>
- POST /profesores
- PUT /profesores/{expediente}
- DELETE /profesores/{expediente}
<br></br>
- POST /cursos
- PUT /cursos/{id}
- DELETE /cursos/{id}
<br></br>
- POST /carreras
- PUT /carreras/{id}
- DELETE /carreras/{id}