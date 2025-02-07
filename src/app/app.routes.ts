import { Component } from '@angular/core';
import { Routes } from '@angular/router';
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
        component: LayoutComponent,
        children: [
            {
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'participantes',
                component: ParticipantesComponent
            },
            {
               path: 'participante/semana',
               component: SemanasparticipanteComponent
                
            },
            {
                path: 'participante/prestamo',
                component: PrestamosparticipanteComponent
            },
            {
                path: 'semanal',
                component: SemanalComponent
            },
            {
                path : 'recordatorios/pagos',
                component: PagosComponent
            },
            {
                path : 'recordatorios/prestamos',
                component: PrestamosrecordatorioComponent
            },
            {
                path : 'recordatorios/pdf',
                component: PdfComponent
            }

            // Aquí puedes agregar más rutas hijas que compartirán el layout
        ]
    },
    
];

export default routes;