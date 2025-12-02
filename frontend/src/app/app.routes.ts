import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';

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
