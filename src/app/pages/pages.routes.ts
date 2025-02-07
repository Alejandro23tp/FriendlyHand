import { Routes } from "@angular/router";
import { SemanasparticipanteComponent } from "./semanasparticipante/semanasparticipante.component";
import { PrestamosparticipanteComponent } from "./prestamosparticipante/prestamosparticipante.component";
import LayoutComponent from "../layout/layout.component";
import HomeComponent from "./home/home.component";
import ParticipantesComponent from "./participantes/participantes.component";

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
            children:[
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
                    path: 'semanas',
                    component: SemanasparticipanteComponent
                }
                
                
            ]
    }
];

export default routes;
