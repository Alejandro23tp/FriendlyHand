import { Component } from '@angular/core';
import { SemanasService } from '../../services/semanas.service';
import { PrestamosService } from '../../services/prestamos.service';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-semanal',
  imports: [CommonModule],
  templateUrl: './semanal.component.html',
  styleUrl: './semanal.component.scss'
})
export class SemanalComponent {
  filas: any[] = [];
  participantesModal: any[] = [];
  showParticipantesModal: boolean = false;
  loading: boolean = false;
  error: string = '';
  private logoUrl: string | null = null;

  constructor(
    private semanasService: SemanasService,
    private prestamoService: PrestamosService,
    private participantesService: ParticipantesService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.cargarLogo();
  }

  private encodeSvg(svgContent: string): string {
    // Remover declaraciones XML y comentarios
    svgContent = svgContent.replace(/<\?xml.*?\?>/, '');
    
    // Limpiar el SVG
    const cleaned = svgContent
      .replace(/>\s+</g, '><')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .trim();

    // Codificar caracteres especiales
    const encoded = cleaned
      .replace(/"/g, '\'')
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/{/g, '%7B')
      .replace(/}/g, '%7D')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/\s+/g, ' ');

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(cleaned)))}`;
  }

  private cargarLogo() {
    this.http.get('images/logomp.svg', { responseType: 'text' })
      .subscribe({
        next: (svgContent) => {
          try {
            this.logoUrl = this.encodeSvg(svgContent);
            console.log('Logo codificado correctamente');
          } catch (error) {
            console.error('Error al codificar el SVG:', error);
          }
        },
        error: (error) => {
          console.error('Error al cargar el logo:', error);
        }
      });
  }

  cargarDatos() {
    this.loading = true;
    this.semanasService.conseguirDatosSemanas().subscribe(
      (response: any) => {
        if (response.data) {
          const datosOrdenados = response.data.sort((a: any, b: any) => {
            const numeroSemanaA = parseInt(a.semana.split(' ')[1]);
            const numeroSemanaB = parseInt(b.semana.split(' ')[1]);
            return numeroSemanaA - numeroSemanaB;
          });

          let saldoAnterior = 0;
          this.filas = datosOrdenados.map((dato: any) => {
            const {
              totalsemana = 0,
              totalprestamos = 0,
              prestamospagado = 0,
              totalinteres = 0,
              semana,
            } = dato;

            const totalSemana = Number(totalsemana);
            const totalPrestamos = Number(totalprestamos);
            const prestamosPagado = Number(prestamospagado);
            const totalInteres = Number(totalinteres);

            const saldoActual =
              semana === 'Semana 1'
                ? totalSemana + totalInteres + prestamosPagado - totalPrestamos
                : saldoAnterior + totalSemana + totalInteres + prestamosPagado - totalPrestamos;

            saldoAnterior = saldoActual;

            return {
              Semana: semana,
              TotalSemana: totalSemana,
              TotalPrestamos: totalPrestamos,
              TotalInteres: totalInteres,
              PrestamosCancelado: prestamosPagado,
              SaldoAnterior: saldoActual,
              Participantes: [],
              expand: false,
            };
          });
          this.listarPrestamistas();
        }
        this.loading = false;
      },
      (error) => {
        this.error = 'Error al cargar los datos';
        this.loading = false;
      }
    );
  }

  listarPrestamistas() {
    this.prestamoService.listarPrestamismas().subscribe(
      (response: any) => {
        if (response.data) {
          this.filas.forEach(fila => {
            fila.Participantes = response.data
              .filter((dato: any) => dato.pp_semana === fila.Semana)
              .map((dato: any) => ({
                participante: dato.pp_partId,
                prestamo: dato.pp_prestamo,
                interes: dato.interes,
                fecha_pago: dato.fecha_pago,
                estado: dato.estado
              }));
          });
          this.filas.forEach(fila => this.buscarNombreParticipante(fila.Participantes));
        }
      },
      (error) => {
        this.error = 'Error al listar los prestamistas';
      }
    );
  }

  buscarNombreParticipante(participantes: any[]) {
    participantes.forEach(participante => {
      this.participantesService.obtenerCuposParticipante(participante.participante).subscribe(
        (response: any) => {
          if (response.data) {
            participante.participante = response.data.part_nombre;
          }
        },
        (error) => {
          this.error = 'Error al cargar los nombres de los participantes';
        }
      );
    });
  }

  openParticipantesModal(row: any) {
    this.participantesModal = row.Participantes;
    this.showParticipantesModal = true;
  }

  cerrarModalParticipantes() {
    this.showParticipantesModal = false;
  }

  downloadNewPdf() {
    try {
      const doc = new jsPDF();

      if (this.logoUrl) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            try {
              const pngData = canvas.toDataURL('image/png');
              // Logo más pequeño y mejor posicionado
              doc.addImage(pngData, 'PNG', 15, 15, 20, 20);
              this.continuarGeneracionPDF(doc);
            } catch (error) {
              console.error('Error al añadir imagen al PDF:', error);
              this.continuarGeneracionPDF(doc);
            }
          };

          img.src = this.logoUrl;

        } catch (logoError) {
          console.error('Error al procesar el logo:', logoError);
          this.continuarGeneracionPDF(doc);
        }
      } else {
        this.continuarGeneracionPDF(doc);
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      this.error = 'Error al generar el PDF';
    }
  }

  private continuarGeneracionPDF(doc: jsPDF) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20; // Aumentamos el margen para centrar mejor la tabla
    
    // Calcular el ancho total de la tabla y márgenes para centrarla
    const tableWidth = 25 * 6; // 6 columnas de 25 cada una
    const leftMargin = (pageWidth - tableWidth) / 2;

    // Configurar el título con mejor espaciado
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Azul oscuro
    doc.text('Reporte Semanal', pageWidth / 2, margin + 15, { align: 'center' });
    
    // Subtítulo con la fecha
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Generado el: ' + new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), pageWidth / 2, margin + 25, { align: 'center' });

    // Línea divisoria
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

    // Configurar las columnas y datos para la tabla con mejor formato
    const headers = [['Semana', 'Total', 'Préstamos', 'Intereses', 'Pagados', 'Saldo']];
    const data = this.filas.map(fila => [
      fila.Semana,
      `$${fila.TotalSemana.toFixed(2)}`,
      `$${fila.TotalPrestamos.toFixed(2)}`,
      `$${fila.TotalInteres.toFixed(2)}`,
      `$${fila.PrestamosCancelado.toFixed(2)}`,
      `$${fila.SaldoAnterior.toFixed(2)}`
    ]);

    // Configuración actualizada de la tabla centrada
    (doc as any).autoTable({
      startY: margin + 35,
      head: headers,
      body: data,
      theme: 'plain',
      styles: { 
        fontSize: 8,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        overflow: 'linebreak',
        font: 'helvetica',
        lineColor: [80, 80, 80],
        lineWidth: 0.05,
        halign: 'center', // Centrar todo el contenido por defecto
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        minCellHeight: 14,
        cellPadding: { top: 6, bottom: 6 }
      },
      columnStyles: {
        0: { 
          cellWidth: 25,
          halign: 'center'
        },
        1: { 
          cellWidth: 25,
          halign: 'center'
        },
        2: { 
          cellWidth: 25,
          halign: 'center'
        },
        3: { 
          cellWidth: 25,
          halign: 'center'
        },
        4: { 
          cellWidth: 25,
          halign: 'center'
        },
        5: { 
          cellWidth: 25,
          halign: 'center',
          fontStyle: 'bold',
          textColor: [52, 73, 94]
        }
      },
      margin: { 
        top: margin, 
        right: leftMargin, 
        left: leftMargin, 
        bottom: margin 
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      bodyStyles: {
        lineColor: [220, 220, 220]
      },
      didParseCell: function(data: any) {
        const isLastRow = data.row.index === data.table.body.length - 1;
        if (isLastRow) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [52, 73, 94];
          data.cell.styles.fillColor = [240, 242, 245];
        }
      },
      didDrawPage: (data: any) => {
        // Footer con número de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });

    doc.save(`reporte_semanal_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
