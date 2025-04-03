import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PrintService } from '@services/print.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-print-visitnote',
  templateUrl: './print-visitnote.component.html',
  styleUrls: ['./print-visitnote.component.scss']
})
export class PrintVisitnoteComponent implements OnInit {
  public modalRef: BsModalRef;
  public documentData: any;
  public User: any
  public AppointmentData:any;
  public isPdfDocumentt: boolean = false;
  public generalDocumentData: any;

  @ViewChild('Printvisitnote', { static: true }) Printvisitnote: TemplateRef<any>;
  @ViewChild('Printgeneralnote', { static: true }) Printgeneralnote:TemplateRef<any>;
  @ViewChild('printimagepopup', { static: true }) printimagepopup:TemplateRef<any>;

  constructor(private modalService:BsModalService,private printService: PrintService) { }
 
  
  ngOnInit(): void {
    this.User = JSON.parse(sessionStorage.getItem('User'))
  }
showVisitnotePopup(data,appointmentData?:any){
  if(data?.type==='General Document'|| data?.patientDocuments?.documentName==='General Document' || data?.type === 'Attachment Document' || data?.patientDocuments?.documentName==='Attachment Document'){
    const isPdfDocument = data?.documentUrl?.split(".")[1] == "pdf" ? true : false;
      this.generalDocumentData = {
      ...data,
       documentUrl: `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}`,
      isPdfDocument: isPdfDocument
    };
    this.isPdfDocumentt=isPdfDocument;
  this.isPdfDocumentt = this.isPdf(data.documentUrl);

  } else {
    data = {
      ...data,
      documentUrl: data.documentUrl,
    };


  }
  this.AppointmentData = appointmentData;
  this.documentData=data;
  let htmlString =data.assessment;
  const plainText = htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
  this.documentData.assessment=plainText;
  // const modalClass = data.type === 'General Document' ? 'first-popup' : 'print-popup';
  this.modalRef = this.modalService.show(this.Printvisitnote, { backdrop: true, ignoreBackdropClick: false , class: 'print-popup'});
//   if(data?.type==='General Document'|| data?.patientDocuments?.documentName==='General Document'){
//   setTimeout(() => {
//     this.modalService.show(this.printimagepopup, {
//       backdrop: true,
//       ignoreBackdropClick: false,
//       class: 'second-popup'
//     });
//   }, 0);
// }

}
isPdf(fileName: string): boolean {
  const extension = fileName?.substring(fileName.lastIndexOf('.') + 1);
  return /(pdf)$/gi.test(extension);
}

showGeneralNotePopup(data){
  this.documentData=data;
  let htmlString =data.assessment;
  const plainText = htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
  this.documentData.assessment=plainText;
  this.modalRef = this.modalService.show(this.Printgeneralnote, { backdrop: true, ignoreBackdropClick: false , class: 'print-popup'});

}
  printDocument() {

    // this.printService.print(document.getElementById("Visit-note").innerHTML)
    this.printService.printPatientDetailsAndDocuments(document.getElementById("Visit-noteList").innerHTML , document.getElementById("Visit-PdfDocument").innerHTML);
  }

  closePopup() {
    this.modalRef.hide();
  }

}
