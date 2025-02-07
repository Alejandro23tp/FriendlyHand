import { Component } from '@angular/core';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import { SemanasService } from '../../services/semanas.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pdf',
  imports: [CommonModule],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.scss'
})
export class PdfComponent {
  participantes: any[] = [];
  private logoUrl: string | null = null;

  constructor(
    private participantesService: ParticipantesService,
    private semanasService: SemanasService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarParticipantes();
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

  cargarParticipantes() {
    this.participantesService.listarParticipantes().subscribe(
      (response: any) => {
        if (response && response.data) {
          this.participantes = response.data;
        }
      },
      (error) => {
        console.error('Error al cargar participantes:', error);
      }
    );
  }

  generarPdf(participante: any) {
    this.semanasService.getSemanas_Participante(participante.id).subscribe(
      (response: any) => {
        if (response && response.data) {
          const semanasData = this.procesarSemanas(response.data);
          this.crearPdf(participante, semanasData);
        } else {
          console.warn('No se encontraron semanas para el participante');
        }
      },
      (error : any) => {
        console.error('Error al obtener semanas del participante:', error);
      }
    );
  }

  async generarTodosPdf() {
    for (const participante of this.participantes) {
      await new Promise<void>((resolve) => {
        this.semanasService.getSemanas_Participante(participante.id).subscribe({
          next: (response: any) => {
            if (response && response.data) {
              const semanasData = this.procesarSemanas(response.data);
              this.crearPdf(participante, semanasData);
            }
            setTimeout(resolve, 1000); // Esperar 1 segundo entre cada PDF
          },
          error: (error) => {
            console.error('Error:', error);
            resolve();
          }
        });
      });
    }
  }

  procesarSemanas(semanas: any[]): any[] {
    let saldo = 0;
    return semanas.map((semana) => {
      const valor = parseFloat(semana.valor) || 0;
      saldo += valor;
      return {
        fecha: semana.fecha_pago || 'Desconocida',
        semana: semana.nombre_semana || 'Desconocida',
        valor: valor.toFixed(2),
        saldo: saldo.toFixed(2),
      };
    });
  }

  crearPdf(participante: any, semanasData: any[]) {
    const doc = new jsPDF();

    // Modificar la parte del logo para usar el nuevo método
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
            doc.addImage(pngData, 'PNG', 15, 15, 20, 20);
            this.continuarGeneracionPDF(doc, participante, semanasData);
          } catch (error) {
            console.error('Error al añadir imagen al PDF:', error);
            this.continuarGeneracionPDF(doc, participante, semanasData);
          }
        };

        img.src = this.logoUrl;

      } catch (logoError) {
        console.error('Error al procesar el logo:', logoError);
        this.continuarGeneracionPDF(doc, participante, semanasData);
      }
    } else {
      this.continuarGeneracionPDF(doc, participante, semanasData);
    }
  }

  private continuarGeneracionPDF(doc: jsPDF, participante: any, semanasData: any[]) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Calcular el ancho total de la tabla y márgenes para centrarla
    const tableWidth = 30 * 4; // 4 columnas de 30 cada una
    const leftMargin = (pageWidth - tableWidth) / 2;

    // Título mejorado
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('Banco Mano Amiga', pageWidth / 2, margin + 15, { align: 'center' });
    
    // Subtítulo con la fecha
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Reporte de Pagos Semanales', pageWidth / 2, margin + 25, { align: 'center' });
    doc.text('Generado el: ' + new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), pageWidth / 2, margin + 32, { align: 'center' });

    // Línea divisoria decorativa
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

    // Información del participante con mejor formato
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, margin + 40, pageWidth - (2 * margin), 40, 'F');
    
    // Título de la sección
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Participante', margin + 5, margin + 52);
    
    // Datos del participante en formato de tabla
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const col1X = margin + 10;
    const col2X = pageWidth / 2;
    
    // Primera columna
    doc.setTextColor(100, 100, 100);
    doc.text('Nombre:', col1X, margin + 62);
    doc.text('ID:', col1X, margin + 72);
    
    // Segunda columna
    doc.text('Teléfono:', col2X, margin + 62);
    doc.text('Cupos:', col2X, margin + 72);
    
    // Valores en negrita
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 73, 94);
    doc.text(participante.part_nombre, col1X + 25, margin + 62);
    doc.text(participante.id.toString(), col1X + 25, margin + 72);
    doc.text(participante.part_telefono, col2X + 25, margin + 62);
    doc.text(participante.part_cupos.toString(), col2X + 25, margin + 72);

    // Ajustar la posición inicial de la tabla
    (doc as any).autoTable({
        startY: margin + 85,  // Aumentado para dar espacio al nuevo formato
        head: [['Fecha', 'Semana', 'Valor', 'Saldo']],
        body: semanasData.map(semana => [
          semana.fecha,
          semana.semana,
          `$${semana.valor}`,
          `$${semana.saldo}`
        ]),
        theme: 'grid',
        styles: { 
            fontSize: 10,
            cellPadding: 5,
            overflow: 'linebreak',
            font: 'helvetica',
            halign: 'center',
            valign: 'middle'
        },
        headStyles: { 
            fillColor: [52, 73, 94],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 6
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30, fontStyle: 'bold', textColor: [52, 73, 94] }
        },
        margin: { 
            left: leftMargin,
            right: leftMargin
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        // ...rest of existing table config...
    });

    // Footer mejorado
    const footerText = `Reporte generado por Banco Mano Amiga - Página ${doc.internal.pages.length - 1}`;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`reporte_${participante.part_nombre}.pdf`);
  }
}
