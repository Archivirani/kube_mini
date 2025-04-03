import {
  Component,
  HostListener,
  Input,
  OnDestroy,
    TemplateRef,
  ViewChild,
} from '@angular/core';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService, PatientDocument } from '@services/model/clinic.model';
import {
  AttachmentDocument,
  FaceNeckDocument,
  Patient,
  PatientConsultationDocument,
  PatientGeneralDocument,
  SoapNoteDocuments,
  SurgeryProcedureDocument,
} from '@services/model/patient.model';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HistoryPopupComponent } from './history-popup/history-popup.component';
import { Subscription } from 'rxjs';
import { NotificationService } from '@services/notification.service';
import { AttachmentPopupComponent } from './attachment-popup/attachment-popup.component';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { ResourceService } from '@services/resource.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ClinicService } from '@services/clinic.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { RequestFormComponent } from '../../request-form/request-form.component';
import { PrintService } from '@services/print.service';
import { VisitNotePopupComponent } from './visit-note-popup/visit-note-popup.component';
import { PrintVisitnoteComponent } from './print-visitnote/print-visitnote.component';
import Swal from 'sweetalert2';
import { GeneralDocumentComponent } from '../general-document/general-document.component';
import { GeneralPopupComponent } from './general-popup/general-popup.component';

@Component({
  selector: 'patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss'],
  providers: [BsModalService],
})
export class PatientProfileComponent implements OnDestroy {
  public confirmSubscription: Subscription; 
  public routerSubscription: Subscription;
  public patient: Patient;
  public userName : any;
  public orderServices: OrderService[] = [];
  public documents: any[] = [];
  public appointmentList: Appointment[] = [];
  public documentPreview: PatientDocument;
  private modalRef: BsModalRef;
  public generalDocumentData: PatientGeneralDocument;
  public printgeneralDocumentData: PatientGeneralDocument;
  public consultationDocumentData: PatientConsultationDocument;
  public faceNeckDocumentData: FaceNeckDocument;
  public surgeryProcedureData: SurgeryProcedureDocument;
  public attachmentDocumentData: AttachmentDocument;
  public soapNoteDocuments: SoapNoteDocuments;
  public isPdfDocument: boolean = false;
  public isPdfDocumentt:boolean = false;
  public createClinicForm: FormGroup;
  public medicationData: any[];
  public orderData:any;
  public Consultation: OrderService[] = [];
  public erPackages: OrderService[] = [];
  public loboratory: OrderService[] = [];

  @ViewChild('historyPopup') historyPopup: HistoryPopupComponent;
  @ViewChild('attachmentPopup') attachmentPopup: AttachmentPopupComponent;
  @ViewChild('soapDocument') soapDocument: TemplateRef<any>;
  @ViewChild('consultationDocument') consultationDocument: TemplateRef<any>;
  @ViewChild('generalDocument') generalDocument: TemplateRef<any>;
  @ViewChild('printpopup') printpopup: TemplateRef<any>;
  @ViewChild('patientProfilePopup') patientProfilePopup: TemplateRef<any>;
  @ViewChild('surgeryProcedureDocument')surgeryProcedureDocument: TemplateRef<any>;
  @ViewChild('attachmentDocument') attachmentDocument: TemplateRef<any>;
  @ViewChild('faceNeckDocument') faceNeckDocument: TemplateRef<any>;
  @ViewChild('visitNotePopup') visitNotePopup:VisitNotePopupComponent;
  // @ViewChild('generalNotePopup') generalNotePopup:GeneralDocumentComponent;
  @ViewChild('printVisitnote')printVisitnote:PrintVisitnoteComponent;
  @Input() Appointmentlist:any;
  @ViewChild('generalePopup')generalePopup:GeneralPopupComponent;
  public AppointmentId: number;
  private appointmentData: Appointment;
  public isIPadAir = false;
  public isCounter = true;
  private isDeleteConf = false;
  private confirmationProcessSubscription: Subscription;
  
  laboratory: any[] = [];
  radiology: any[] = [];
  Medication: any[] = [];
  erpackage: any[] = [];
  consultation: any[] = [];

  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
 
  onResizeEvent() {
    window.innerWidth < 1260
      ? (this.isIPadAir = true)
      : (this.isIPadAir = false);
  }
  @ViewChild('requestForm') requestForm: RequestFormComponent;
  @ViewChild('medicationpopup', { static: true }) medicationpopup: TemplateRef<any>;
  @Input() clinicservice: any;

  @Input() set Appointment(data: Appointment) {
    if (data && data.patient) {
      this.orderServices = [];
      this.documents = [];
      this.appointmentList = [];
      this.appointmentData = data;
      this.AppointmentId = data.id;
      this.getAppointmentlist();
      
    }
  }

  constructor(
    private dataService: DataService,
    private modalService: BsModalService,
    public notificationService: NotificationService,
    private resourceService :ResourceService,
    private printService: PrintService,
    private clinicService:ClinicService
    
  ) {
    window.innerWidth < 1260
      ? (this.isIPadAir = true)
      : (this.isIPadAir = false);
    if (this.confirmationProcessSubscription) {
      this.confirmationProcessSubscription.unsubscribe();
    }
    this.confirmationProcessSubscription =
      this.notificationService.confirmationProcess.subscribe((resp) => {
        if (resp) {
          if (this.AppointmentId) {
            this.getHistory(this.AppointmentId);
          }
        } else {
          this.isDeleteConf = false;
        }
      });
  }
  createForm(data: any) {
    return new FormGroup({
      dateTime: new FormControl(new Date()),
      DesiredDate: new FormControl(new Date().toLocaleDateString()),
      DesiredTime: new FormControl(new Date().toLocaleTimeString()),
      price: new FormControl(data.defaultPrice),
      id: new FormControl(0),
      name: new FormControl(data.name),
      comment: new FormControl(),
      createdBy: new FormControl(),
      quantity: new FormControl(1),
      discount: new FormControl(0),
      serviceId: new FormControl(data.id),
      consultationId: new FormControl(''),
      localization: new FormControl(''),
      orderId: new FormControl(0),
      order: new FormControl(''),
      unit: new FormControl(data.unit),
      categorization: new FormControl(data.categorization),
    });
  }
  setOrderDetails(data){
    this.orderServices = data;
    this.createClinicForm = new FormGroup({ orderServices: new FormArray([]), radiology: new FormArray([]), medication: new FormArray([]), Erpackage: new FormArray([]), consultation: new FormArray([]) });
    if (data && data.length) {
      this.loboratory = data.filter(d => d.categorization === 'Loboratory');
      this.radiology = data.filter(d => d.categorization === 'Radiology');
      this.Medication = data.filter(d => d.categorization === 'Medication');
      this.erPackages = data.filter(d => d.categorization === 'ERPackages');
      this.Consultation = data.filter(d => d.categorization === 'Consultation');
      this.loboratory?.forEach((item) => {
        (this.createClinicForm.get('orderServices') as FormArray).push(this.createForm(item));
      });
      this.radiology?.forEach((item) => {
        (this.createClinicForm.get('radiology') as FormArray).push(this.createForm(item));
      });
      this.Medication?.forEach((item) => {
        (this.createClinicForm.get('medication') as FormArray).push(this.createForm(item));
      });
      this.erPackages?.forEach((item) => {
        (this.createClinicForm.get('Erpackage') as FormArray).push(this.createForm(item));
      });
      this.Consultation?.forEach((item) => {
        (this.createClinicForm.get('consultation') as FormArray).push(this.createForm(item));
      });
    }
  }


  onPrintPopUp(data: any) {
    this.requestForm.showrequestFormPopup(data, this.appointmentData);
  }
  getAppointmentlist() {
    this.orderServices =[]
    this.laboratory =[]
    this.radiology =[]
    this.Medication =[]
    this.erpackage =[]
    this.consultation =[]
    this.dataService
        .getData<Patient[]>(Modules.getServiceHistory,`${this.appointmentData.patient.id}`)
        .then((response) => {
          if (response && response.length) {
            this.patient = response[0];
            this.userName = response[0]?.orders[0]?.user?.username || response[0]?.orders[1]?.user?.username || sessionStorage.UserName;
            this.patient?.orders?.forEach((d) => {
              if (d.orderServices && d.orderServices.length) {
                this.orderServices = this.orderServices.concat(d.orderServices);
                this.laboratory = this.orderServices.filter(d => d.categorization === 'Loboratory');
                this.radiology = this.orderServices.filter(d => d.categorization === 'Radiology');
                this.Medication = this.orderServices.filter(d => d.categorization === 'Medication');
                this.erpackage = this.orderServices.filter(d => d.categorization === 'ERPackages');
                this.consultation = this.orderServices.filter(d => d.categorization === 'Consultation');
              }
            });
            this.laboratory.sort((a, b) => new Date(a?.desiredDate).getTime() - new Date(b?.desiredDate).getTime());
            this.radiology.sort((a, b) => new Date(a?.desiredDate).getTime() - new Date(b?.desiredDate).getTime());
            this.Medication.sort((a, b) => new Date(a?.desiredDate).getTime() - new Date(b?.desiredDate).getTime());
            this.erpackage.sort((a, b) => new Date(a?.desiredDate).getTime() - new Date(b?.desiredDate).getTime());
            this.consultation.sort((a, b) => new Date(a?.desiredDate).getTime() - new Date(b?.desiredDate).getTime());
            this.orderServices.sort((a, b) => {
              return new Date(a?.dateTime) < new Date(b?.dateTime) ? 1 : -1;
            });
            if (
              this.patient &&
              ((this.patient.consultationDocument &&
                this.patient.consultationDocument.length) ||
                (this.patient.generalDocument &&
                  this.patient.generalDocument.length) ||
                (this.patient.faceNeckDocument &&
                  this.patient.faceNeckDocument.length) ||
                (this.patient.surgeryProcedureDocument &&
                  this.patient.surgeryProcedureDocument.length) ||
                (this.patient.attachmentDocument &&
                  this.patient.attachmentDocument.length) ||
                  (this.patient.soapNoteDocuments &&
                    this.patient.soapNoteDocuments.length) ||
                    (this.patient.visitNoteDetailsDocuments &&
                      this.patient.visitNoteDetailsDocuments.length)
                    
                  )
            ) {

              this.documents = []
                .concat(
                  this.patient.consultationDocument,
                  this.patient.generalDocument,
                  this.patient.faceNeckDocument,
                  this.patient.surgeryProcedureDocument,
                  this.patient.attachmentDocument,
                  this.patient.soapNoteDocuments,
                  this.patient.visitNoteDetailsDocuments,
                )
                .sort((a, b) => {
                  const dateA = new Date(a.createdDate).getTime();
                  const dateB = new Date(b.createdDate).getTime();
                  return dateB - dateA; 
                  // return new Date(a?.dateTime) > new Date(b?.dateTime) ? 1 : -1;
                });
            }

            if (this.patient.appointments && this.patient.appointments.length) {
              this.appointmentList = this.patient.appointments;
            }
          }
        });
  }

  onDelete(data) {
    // if (orders == 'laboratory') {
    //   this.laboratory.splice(index, 1);
    // } else if (orders == 'radiology') {
    //   this.radiology.splice(index, 1);
    // } else if (orders == 'medication') {
    //   this.Medication.splice(index, 1);
    // } else if (orders == 'proc') {
    //   this.proc.splice(index, 1);
    // } else if (orders == 'consultation') {
    //   this.consultation.splice(index, 1);
    // }
this.isCounter=true;
this.isDeleteConf=true
const getData=JSON.parse(sessionStorage.getItem('User'))
    Swal.fire({
      text: "Do You really want to delete this Service?",
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: '#3f7473',
      cancelButtonColor: '#e71d36',
      customClass: {
        container: 'notification-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.postData<any>( `${Modules.DeleteOrderService}?Id=${data.id}&DeleteBy=${getData.id}`).then((response) => {
          this.isDeleteConf = false;
          this.getAppointmentlist()
           });
      }
    });
  }


  onPrint(printpopup,data){
    if (data.documentUrl) {
      const isPdfDocument = data.documentUrl.split(".")[1] == "pdf" ? true : false;
      this.printgeneralDocumentData = {
        ...data,
        documentUrl: `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}`,
        isPdfDocument: isPdfDocument
      };
      this.isPdfDocumentt=isPdfDocument;
    this.modalRef = this.modalService.show(printpopup, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup',});
  }
}

printDocument() {
  this.printService.print(document.getElementById("print-document").innerHTML)
}

  openPreviewDocument(data: any): void {
    if (!this.isCounter) {
      this.documentPreview = data;
      this.generalDocumentData = null;
      this.surgeryProcedureData = null;
      this.attachmentDocumentData = null;
      this.consultationDocumentData = null;
      this.soapNoteDocuments = null;
      if (data) {
        if (data.type === 'Visit Note') {
          this.consultationDocumentData = data;
          this.modalRef = this.modalService.show(this.consultationDocument, {
            backdrop: true,
            ignoreBackdropClick: false,
            class: 'preview-popup',
          });
        } else if (data.type === 'General Document') {
          this.isPdfDocumentt = false;
          if (data.documentUrl) {
            const isPdfDocument = data.documentUrl.split(".")[1] == "pdf" ? true : false;
            this.generalDocumentData = {
              ...data,
              documentUrl: `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}`,
              isPdfDocument: isPdfDocument
            };
            this.isPdfDocumentt=isPdfDocument;
          } else {
            this.generalDocumentData = {
              ...data,
              documentUrl: data.documentUrl,
            };
          }
          this.modalRef = this.modalService.show(this.generalDocument, {
            backdrop: true,
            ignoreBackdropClick: false,
            class: 'preview-popup',
          });
        } else if (data.type === 'Soap Document') {
          this.faceNeckDocumentData = data;
          this.modalRef = this.modalService.show(this.faceNeckDocument, {
            backdrop: true,
            ignoreBackdropClick: false,
            class: 'preview-popup',
          });
        } else if (data.type === 'Surgery Procedure') {
          this.surgeryProcedureData = data;
          this.modalRef = this.modalService.show(
            this.surgeryProcedureDocument,
            {
              backdrop: true,
              ignoreBackdropClick: false,
              class: 'preview-popup',
            }
          );
        } else if (data.type === 'Attachment Document') {
          this.isPdfDocument = false;
          if (data.documentUrl) {
            const isPdfDocument = data.documentUrl.split(".")[1] == "pdf" ? true : false;
            this.attachmentDocumentData = {
              ...data,
              documentUrl: `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}`,
              isPdfDocument: isPdfDocument,
            };
            this.isPdfDocumentt=isPdfDocument;
          } else {
            this.attachmentDocumentData = {
              ...data,
              documentUrl: data.documentUrl,
            };
          }
          this.isPdfDocument = this.isPdf(data.documentUrl);
          this.modalRef = this.modalService.show(this.attachmentDocument, {
            backdrop: true,
            ignoreBackdropClick: false,
            class: 'preview-popup',
          });
        }
      }
    } else {
      this.isCounter = false;
    }
  }

  isPdf(fileName: string): boolean {
    const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
    return /(pdf)$/gi.test(extension);
  }

  closePreviewDocument(): void {
    this.modalRef.hide();
  }

  visitNoteList(data , item?){
    if(data?.type === 'General Document'){
      this.generalePopup?.showPopup(data)
    }else{
      this.visitNotePopup?.showPopup(data,item)

    }
  }

  onDeleteVisitnote(id){
    this.isCounter=true;
    this.isDeleteConf=true;
    const getData=JSON.parse(sessionStorage.getItem('User'))
    Swal.fire({
      text: "Do You really want to delete this Document?",
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: '#3f7473',
      cancelButtonColor: '#e71d36',
      customClass: {
        container: 'notification-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.postData<any>( `${Modules.DeleteVisitNoteDetailsDocuments}?Id=${id}&CancelledBy=${getData.id}`).then(() => {
          this.isDeleteConf = false;
          this.getAppointmentlist()
           });
      }
    });
  }
  

  openHistoryPopup(isDocument: boolean): void {
    if (isDocument) {
      this.documents.sort((a, b) => {
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();
        return dateB - dateA; 
      });
      this.historyPopup.showDocumentPopup(this.documents);
    } else {
      this.historyPopup.showServicePopup(this.orderServices);
    }
  }

  openAttachmentPopup(): void {
    this.attachmentPopup.showAttachmentPopup(this.appointmentData);
    this.attachmentPopup.onClose.subscribe((resp) => {
      if (resp) {
        this.getAppointmentlist();
      }
    })
  }

  onRemoveGeneralDocument(document: PatientGeneralDocument): void {
    this.isCounter = true;
    this.isDeleteConf = true;
    this.dataService.notify.next({
      key: eMessageType.Warning,
      value: 'Do You really want to delete this document?',
      icon: eMessageIcon.Warning,
    });
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
    this.confirmSubscription =
      this.notificationService.confirmationProcess.subscribe((resp) => {
        if (resp) {
          this.isDeleteConf = false;
          // this.dataService.postData<PatientGeneralDocument>( Modules.DeleteGeneralDocument, document) .then((response) => { });
          this.dataService.postData<PatientGeneralDocument>(`${Modules.DeleteGeneralDocument}?Document_number=${document?.document_number}`).then((response) => {  this.isDeleteConf = false;
            this.getAppointmentlist()});
        }
      });
  }

  onPrintVisitnote(data){
    this.printVisitnote.showVisitnotePopup(data,this.Appointmentlist);
  }

  onRemoveConsultationDocument(document: PatientConsultationDocument): void {
    this.isCounter = true;
    this.isDeleteConf = true;
    this.dataService.notify.next({
      key: eMessageType.Warning,
      value: 'Do You really want to delete this document?',
      icon: eMessageIcon.Warning,
    });
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
    this.confirmSubscription =
      this.notificationService.confirmationProcess.subscribe((resp) => {
        if (resp) {
          this.isDeleteConf = false;
          this.dataService
            .postData<PatientConsultationDocument>(
              Modules.DeleteConsultationDocument,
              document
            )
            .then(() => {
              this.getAppointmentlist();
             });
        }
      });
  }

  onRemoveSurgeryProcedureDocument(document: SurgeryProcedureDocument): void {
    this.isCounter = true;
    this.isDeleteConf = true;
    this.dataService.notify.next({
      key: eMessageType.Warning,
      value: 'Do You really want to delete this document?',
      icon: eMessageIcon.Warning,
    });
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
    this.confirmSubscription =
      this.notificationService.confirmationProcess.subscribe((resp) => {
        if (resp) {
          this.isDeleteConf = false;
          this.dataService
            .postData<SurgeryProcedureDocument>(
              `${Modules.DeleteSurgeryProcedureDocument}?document_Number=${document.document_number}`,
              document
            )
            .then(() => { 
              this.getAppointmentlist();
            });
        }
      });
  }

  onRemoveAttachmentDocument(document: AttachmentDocument): void {
    this.isCounter = true;
    this.isDeleteConf = true;
    this.dataService.notify.next({
      key: eMessageType.Warning,
      value: 'Do You really want to delete this document?',
      icon: eMessageIcon.Warning,
    });
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
    this.confirmSubscription =
      this.notificationService.confirmationProcess.subscribe((resp) => {
        this.isDeleteConf = false;
        if (resp) {
          this.isDeleteConf = false;
          this.dataService.postData<AttachmentDocument>(`${Modules.DeleteAttachmentDocument}?document_Number=${document.document_number}`,document).then((response) => {
            this.getAppointmentlist();
           });
        }
      });
  }
 

  getHistory(data?: number) {
    this.appointmentList = [];
    this.dataService
      .getData<Patient[]>(Modules.getServiceHistory, `${this.resourceService.currentPatient.id}`)
      .then((response) => {
        if (response && response.length) {
          this.patient = response[0];
          this.patient?.orders?.forEach((d) => {
            if (d.orderServices && d.orderServices.length) {
              this.orderServices = this.orderServices.concat(d.orderServices);
              this.laboratory = this.orderServices.filter(d => d.categorization === 'Loboratory');
              this.radiology = this.orderServices.filter(d => d.categorization === 'Radiology');
              this.Medication = this.orderServices.filter(d => d.categorization === 'Medication');
              this.erpackage = this.orderServices.filter(d => d.categorization === 'ERPackages');
              this.consultation = this.orderServices.filter(d => d.categorization === 'Consultation');
            }
          });
          this.orderServices.sort((a, b) => {
            return new Date(a?.dateTime) < new Date(b?.dateTime) ? 1 : -1;
          });
          if (
            this.patient &&
            ((this.patient.consultationDocument &&
              this.patient.consultationDocument.length) ||
              (this.patient.generalDocument &&
                this.patient.generalDocument.length) ||
              (this.patient.faceNeckDocument &&
                this.patient.faceNeckDocument.length) ||
              (this.patient.surgeryProcedureDocument &&
                this.patient.surgeryProcedureDocument.length) ||
              (this.patient.attachmentDocument &&
                this.patient.attachmentDocument.length) ||
                (this.patient.soapNoteDocuments &&
                  this.patient.soapNoteDocuments.length) ||
                  (this.patient.visitNoteDetailsDocuments &&
                    this.patient.visitNoteDetailsDocuments.length)
                )
          ) {
            this.documents = []
              .concat(
                this.patient.consultationDocument,
                this.patient.generalDocument,
                this.patient.faceNeckDocument,
                this.patient.surgeryProcedureDocument,
                this.patient.attachmentDocument,
                this.patient.soapNoteDocuments,
                this.patient.visitNoteDetailsDocuments
              )
              .sort((a, b) => {
                return new Date(a?.dateTime) < new Date(b?.dateTime) ? 1 : -1;
              });
          }

          if (this.patient.appointments && this.patient.appointments.length) {
            this.appointmentList = this.patient?.appointments;
          }
        }
      });
  }
 
  

  ngOnDestroy(): void {
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
    if (this.confirmationProcessSubscription) {
      this.confirmationProcessSubscription.unsubscribe();
    }
  }
} 