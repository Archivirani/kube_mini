import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({ providedIn: 'root' })
export class PrintService {

  private modalRef: BsModalRef;
  public printType:string;
  public PrintPatient: boolean= false;
  
  constructor(private spinner: NgxSpinnerService) { }

  public print(printContents: string, printWidth: any = 'auto'): void {
    const popupWin = window.open('', '_blank');
    popupWin.document.open();
    popupWin.document.write(
      `<html>
        <head>
        <link rel="stylesheet" media="print" href="../assets/css/vendor/bootstrap.min.css">
          <style>
            html,body {
                height: 842px;
                width: ${printWidth}in;
                margin-left: auto;
                margin-right: auto;
                margin: 0px;
            }
            @page {
              size: ${printWidth}in auto;
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

  public printa(printContents: string, appointmentData: any, documentData: any, formattedDob: string, printWidth: any = 'auto'): void {
    const popupWin = window.open('', '_blank');
    popupWin.document.open();
    popupWin.document.write(
      `<html>
        <head>
          <link rel="stylesheet" media="print" href="../assets/css/vendor/bootstrap.min.css">
          <style>
            html, body {
                height: 842px;
                width: ${printWidth}in;
                margin: 0;
            }
            @page {
              size: ${printWidth}in auto;
              margin: 20px;
            }
            .page {
              page-break-after: always;
            }
            .invoice-content {
              padding: 15px;
              border: 1px solid #ccc;
              border-radius: 15px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="invoice-content">
              <h4>Document Note:</h4>
              <textarea rows="5" class="form-control">${documentData.note}</textarea>
              <div>
                <h4>Patient Name: ${appointmentData?.patient?.firstName} ${appointmentData?.patient?.secondName} ${appointmentData?.patient?.thirdName} ${appointmentData?.patient?.familyName}</h4>
                <h4>MRN: ${appointmentData?.patient?.medicalRecordNumber}</h4>
                <h4>D.O.B: ${formattedDob}</h4>
                <h4>Telephone: ${appointmentData?.patient?.contactNo1}</h4>
                <h4>Attending Physician: ${(appointmentData?.attendDoctor?.doctor_Name || appointmentData?.doctor_Name || appointmentData?.doctors?.doctor_Name)}</h4>
                <h4>Gender: ${appointmentData?.patient?.gender}</h4>
                <h4>Appointment Id: ${appointmentData?.id}</h4>
              </div>
            </div>
          </div>
          <div class="page">
            <div class="invoice-content">
              <h4>Document Image:</h4>
              <ng-container *ngIf="generalDocumentData.isPdfDocument">
                <iframe [src]="generalDocumentData.documentUrl | safeUrl" width="100%" height="100%"></iframe>
              </ng-container>
              <img *ngIf="!generalDocumentData.isPdfDocument" [src]="generalDocumentData.documentUrl" height="150">
            </div>
          </div>
          <script defer>
            function triggerPrint(event) {
              window.removeEventListener('load', triggerPrint, false);
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 0);
              }, 0);
            }
            window.addEventListener('load', triggerPrint, false);
          </script>
        </body>
      </html>`
    );
    popupWin.document.close();
}

  // public printPatientDetailsAndDocuments(printContents: string, printWidth: any = 'auto'): void {
  //   const patientDetailsHtml = document.getElementById("patient-details")?.innerHTML;
  //   const generalDocumentHtml = document.getElementById("general-document")?.innerHTML;
  //   const attachedImageHtml = document.getElementById("attached-image")?.innerHTML;
  
  //   const printContents1 = `
  //     <html>
  //       <head>
  //         <title>Patient Details and General Document</title>
  //         <style>
  //           /* Add styles here */
  //         </style>
  //       </head>
  //       <body>
  //         <div style="page-break-after: always;">
  //           ${printContents}
  //         </div>
  //         <div>
  //           ${generalDocumentHtml}
  //         </div>
  //       </body>
  //     </html>
  //   `;
  
  //   const popupWin1 = window.open('', '_blank');
  //   popupWin1.document.open();
  //   popupWin1.document.write(printContents1);
  //   popupWin1.document.close();
  
  //   setTimeout(function() {
  //     popupWin1.print();
  //     popupWin1.close();
  //   }, 0);
  // }

  public printPatientDetailsAndDocuments(printContents: string,data:string, printWidth: any = 'auto'): void {
    // Combine all the content into one printable HTML string
    const combinedPrintContents = `
      <html>
        <head>
          <link rel="stylesheet" media="print" href="../assets/css/vendor/bootstrap.min.css">
          <style>
            html, body {
                height: 842px;
                width: ${printWidth}in;
                margin: 0;
            }
            @page {
              size: ${printWidth}in auto;
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
            .invoice-content .invoice-detail-content.bg-sky-blue {
              background: #edf6fd;
            }
            .w-15 {
              width: 15%;
            }
          </style>
        </head>
        <body>
          <div style="page-break-after: always;">
            <h4>Patient Details:</h4>
            ${data}
          </div>
          <div>
            <h4>Document Note:</h4>
            ${printContents}
          </div>
          <script defer>
            function triggerPrint(event) {
              window.removeEventListener('load', triggerPrint, false);
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 0);
              }, 0);
            }
            window.addEventListener('load', triggerPrint, false);
          </script>
        </body>
      </html>
    `;

    // Open a new window for printing
    const popupWin = window.open('', '_blank');
    popupWin.document.open();
    popupWin.document.write(combinedPrintContents);
    popupWin.document.close();
}


  public pdfPatientData(elementId: string) {
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        this.spinner.show();
        html2canvas(element).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          setTimeout(() => {
            const pdf = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4'
            });
            const imgWidth = 210;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('document.pdf');
            this.spinner.hide();
            }, 1000);  
          }).catch(error => {
            console.error('Error generating PDF:', error);
            this.spinner.hide();
          });
      }
    } else {
      this.spinner.hide();
    }
    this.modalRef?.hide();
    this.PrintPatient = false;
    this.printType = '';
  }
}
