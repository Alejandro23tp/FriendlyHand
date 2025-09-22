import { Routes } from "@angular/router";
import { SemanasparticipanteComponent } from "./semanasparticipante/semanasparticipante.component";
import { PrestamosparticipanteComponent } from "./prestamosparticipante/prestamosparticipante.component";
import LayoutComponent from "../layout/layout.component";
import HomeComponent from "./home/home.component";
import ParticipantesComponent from "./participantes/participantes.component";
import { PagosComponent } from "./pagos/pagos.component";
import { PrestamosrecordatorioComponent } from "./prestamosrecordatorio/prestamosrecordatorio.component";
import { PdfComponent } from "./pdf/pdf.component";
import { SemanalComponent } from "./semanal/semanal.component";
import { ParticipantHomeComponent } from "./cliente/participant-home/participant-home.component";
import { ParticipantSemanasComponent } from "./cliente/participant-semanas/participant-semanas.component";
import { ParticipantPrestamosComponent } from "./cliente/participant-prestamos/participant-prestamos.component";
import { ParticipantEstadoCuentaComponent } from "./cliente/participant-estado-cuenta/participant-estado-cuenta.component";

// Rutas para administrador
export const AdminRoutes: Routes = [
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: 'participantes',
      component: ParticipantesComponent
    },
    {
      path: 'semana',
      component: SemanasparticipanteComponent
    },
    {
      path: 'prestamo',
      component: PrestamosparticipanteComponent
    },
    {
        path: 'semanal',
        component: SemanalComponent
    },
    {
      path: 'recordatorios/pagos',
      component: PagosComponent
    },
    {
      path: 'recordatorios/prestamos',
      component: PrestamosrecordatorioComponent
    },
    {
      path: 'recordatorios/pdf',
      component: PdfComponent
    }
  ];
  
  // Rutas para participante
  export const ParticipantRoutes: Routes = [
    {
      path: 'home',
      component: ParticipantHomeComponent
    },
    {
      path: 'semana',
      component: ParticipantSemanasComponent
    },
    {
      path: 'prestamo',
      component: ParticipantPrestamosComponent
    },
    {
      path: 'estadoCuenta',
      component: ParticipantEstadoCuentaComponent
    }
  ];
  
  export default { AdminRoutes, ParticipantRoutes };
