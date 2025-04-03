import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root'
})
export class PrintWristbandService {
  private modalRef: BsModalRef;
  public printType:string;
  public PrintPatient: boolean= false;
  constructor() { }
  public print(printContents: string, printWidth: string = 'auto'): void {
    const popupWin = window.open('', '_blank');
    popupWin.document.open();
    popupWin.document.write(
      `<html>
        <head>
        <link rel="stylesheet" media="print" href="../assets/css/vendor/bootstrap.min.css">
          <style>
            html,body {
                height: 842px;
                width: ${printWidth}px;
                margin-left: auto;
                margin-right: auto;
                margin: 0px;
            }
            @page {
              left: 0;
              position: fixed;
              top: 45%;
              transform: rotate(90deg) !important;
              height: 120px;
            }
            .invoice-content .invoice-main-title::before {
              content: "";
              position: absolute;
              width: calc(100% - 180px);
              height: 2px;
              top: 50%;
              right: 0;
              background: #c6c8ca;
              transform: translateY(-50%);
            }
            .invoice-body::before {
              content: "";
              position: absolute;
              width: 30px;
              height: calc(100% + 30px);
              bottom: 0;
              left: 0;
              background: #426b9a;
            }
            body {
              left: 0;
              position: fixed;
              top: 45%;
              transform: rotate(90deg);
              height: 50px;
            }
            body, embed{
              width: 50px;
              height: 50px;
            }
            .invoice-content .invoice-main-title h3 {
              font: 600 20px/1.25 "Inter", sans-serif;
            }
            .invoice-content .invoice-area h3 {
              font: 600 20px/1.25 "Inter", sans-serif;
            }
            .invoice-content .invoice-info h4 {
              font: 600 18px/1.25 "Inter", sans-serif;
              color: #000000;
            }
            .invoice-content .invoice-info p {
              font: 600 14px/1.25 "Inter", sans-serif;
              color: #000000;
            }

            .invoice-content .invoice-detail {
              border-top: 1px solid #c6c8ca;
              border-bottom: 1px solid #c6c8ca;
            }
            .invoice-content .invoice-detail-content.bg-sky-blue{
              background: #edf6fd;
            }
            .w-15{
              width: 15%;
            }
          </style>
        </head>
        <body style="">
          ${printContents}
          <script defer>
            function triggerPrint(event) {
              window.removeEventListener('load', triggerPrint, false);
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 0);
              },0);
            }
            window.addEventListener('load', triggerPrint, false);
          </script>
        </body>
      </html>`
    );
    popupWin.document.close();
  }

  public pdfWristbandService(elementId: string): void {
  
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Create a new jsPDF instance with vertical orientation and wristband dimensions
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [25, 190],
        });
        
        // Calculate the image dimensions to fit the PDF format
        const imgWidth = 25;  // Width of the PDF in mm
        const imgHeight = 190; // Height of the PDF in mm
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const pdfRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let pdfX = 0;
        let pdfY = 0;
        let pdfImgWidth = imgWidth;
        let pdfImgHeight = imgHeight;
        
        if (canvasRatio > pdfRatio) {
          // Image is wider relative to its height than the PDF format
          pdfImgHeight = imgWidth / canvasRatio;
          pdfY = (imgHeight - pdfImgHeight) / 2;
        } else {
          // Image is taller relative to its width than the PDF format
          pdfImgWidth = imgHeight * canvasRatio;
          pdfX = (imgWidth - pdfImgWidth) / 2;
        }

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', pdfX, pdfY, pdfImgWidth, pdfImgHeight);
        
        // Save the PDF
        pdf.save('document.pdf');
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }
  }
  
  this.modalRef?.hide();
  this.PrintPatient = false;
  this.printType = '';
}

public pdfPateintStickerService(elementId: string): void {
 setTimeout(() => {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Create a new jsPDF instance with vertical orientation and wristband dimensions
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [50, 110],
        });
        
        // Calculate the image dimensions to fit the PDF format
        const imgWidth = 50;  // Width of the PDF in mm
        const imgHeight = 224; // Height of the PDF in mm
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const pdfRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let pdfX = 0;
        let pdfY = 0;
        let pdfImgWidth = imgWidth;
        let pdfImgHeight = imgHeight;
        
        if (canvasRatio > pdfRatio) {
          // Image is wider relative to its height than the PDF format
          pdfImgHeight = imgWidth / canvasRatio;
          // pdfY = (imgHeight - pdfImgHeight) / 2;
        } else {
          // Image is taller relative to its width than the PDF format
          pdfImgWidth = imgHeight * canvasRatio;
          // pdfX = (imgWidth - pdfImgWidth) / 2;
        }

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', pdfX, pdfY, pdfImgWidth, pdfImgHeight);
        
        // Save the PDF
        pdf.save('document.pdf');
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }
  }
});
  
  this.modalRef?.hide();
  this.PrintPatient = false;
  this.printType = '';
}

public pdfPateintLabelService(elementId: string): void {
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        // Create a new jsPDF instance with vertical orientation and wristband dimensions
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: [50, 100],
        });
        
        // Calculate the image dimensions to fit the PDF format
        const imgWidth = 50;  // Width of the PDF in mm
        const imgHeight = 224; // Height of the PDF in mm
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const pdfRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let pdfX = 0;
        let pdfY = 0;
        let pdfImgWidth = imgWidth;
        let pdfImgHeight = imgHeight;
        
        if (canvasRatio > pdfRatio) {
          // Image is wider relative to its height than the PDF format
          pdfImgHeight = imgWidth / canvasRatio;
          // pdfY = (imgHeight - pdfImgHeight) / 2;
        } else {
          // Image is taller relative to its width than the PDF format
          pdfImgWidth = imgHeight * canvasRatio;
          // pdfX = (imgWidth - pdfImgWidth) / 2;
        }

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', pdfX, pdfY, pdfImgWidth, pdfImgHeight);
        
        // Save the PDF
        pdf.save('document.pdf');
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }
  }

}

}
