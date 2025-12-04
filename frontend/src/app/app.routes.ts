import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';

<<<<<<< HEAD
export const routes: Routes = [];
=======
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', loadComponent: () => import('./signup/signup').then((m) => m.SignupComponent) },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'courses',
    loadComponent: () => import('./courses/courses').then((m) => m.CoursesComponent),
  },
  { path: 'tasks', loadComponent: () => import('./tasks/tasks').then((m) => m.TasksComponent) },
  {path: 'studyai', loadComponent: () => import('./studyai/studyai').then((m) => m.StudyAiComponent) },


];
>>>>>>> 00464d4ead25df3f8333cbe7d82ccf2e3ede44cc
