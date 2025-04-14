import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { SemanasparticipanteComponent } from './pages/semanasparticipante/semanasparticipante.component';
import { PrestamosparticipanteComponent } from './pages/prestamosparticipante/prestamosparticipante.component';
import pagesRoutes from './pages/pages.routes';
import ParticipantesComponent from './pages/participantes/participantes.component';
import HomeComponent from './pages/home/home.component';
import LoginComponent from './pages/login/login.component';
import LayoutComponent from './layout/layout.component';
import { SemanalComponent } from './pages/semanal/semanal.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { PrestamosrecordatorioComponent } from './pages/prestamosrecordatorio/prestamosrecordatorio.component';
import { PdfComponent } from './pages/pdf/pdf.component';


export const routes: Routes = [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'login'
    },
    {
      path: 'login',
      component: LoginComponent
    },
    {
      path: '',
      canActivate: [authGuard],
      component: LayoutComponent,
      children: [
        // Rutas de admin y otras secciones importantes
        {
          path: 'admin',
          loadChildren: () =>
            import('./pages/pages.routes').then((m) => m.AdminRoutes) // Lazy loading del módulo de admin
        },
        {
          path: 'participante',
          loadChildren: () =>
            import('./pages/pages.routes').then((m) => m.ParticipantRoutes) // Lazy loading del módulo de participante
        }
      ]
    },
    {
      path: '**',
      redirectTo: 'login'
    }
  ];

export default routes;