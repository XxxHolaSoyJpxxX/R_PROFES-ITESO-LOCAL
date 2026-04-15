import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { User } from './pages/user/user';
import { authGuard } from '../app/shared/guards/auth-guard';
import { AreasAcademicas } from './pages/areas-academicas/areas-academicas';
import { Departamentos } from './pages/areas-academicas/departamentos/departamentos';
import { Cursos } from './pages/areas-academicas/departamentos/cursos/cursos';
import { Clases } from './pages/areas-academicas/departamentos/cursos/clases/clases';
import { Profesores } from './pages/profesores/profesores';
import { ProfesoresList } from './pages/profesores/profesores-list/profesores-list';
import { ProfesorPerfil } from './pages/profesores/profesor-perfil/profesor-perfil';
import { ProfesorCursoEvaluacion } from './pages/profesores/profesor-curso-evaluacion/profesor-curso-evaluacion';
import { Evaluaciones } from './pages/evaluaciones/evaluaciones';


export const profesoresRoutes: Routes = [
 
];


export const routes: Routes = [
	{path:'', redirectTo: 'home', pathMatch : 'full'},
	{path: 'home', component: AreasAcademicas, canActivate:[authGuard]},
	{path: 'profile' , component: User,canActivate:[authGuard]},
	{path: 'login', component: Login},
	{path: 'cursos/:departamentoId', component: Cursos, canActivate:[authGuard]},
	{path: 'clases/:cursoId', component: Clases, canActivate:[authGuard]},
	 {
    path: 'profesores',children: [
		{path: '',component: ProfesoresList,title: 'Profesores'},
     	{path: ':id',component: ProfesorPerfil,title: 'Perfil del Profesor'},
     	{path: ':id/curso/:cursoId',component: ProfesorCursoEvaluacion,title: 'Evaluación del Curso'}
    	],canActivate:[authGuard]
  	},
    {path: 'evaluacion/:id',component: Evaluaciones,title: 'Evaluación de Profesor',canActivate:[authGuard]}
];
