import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService, PatientDocument } from '@services/model/clinic.model';
import { AttachmentDocument, FaceNeckDocument, Patient, PatientConsultationDocument, PatientGeneralDocument, SurgeryProcedureDocument } from '@services/model/patient.model';
import { NotificationService } from '@services/notification.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { HistoryPopupComponent } from '../../my-clinic/my-clinic-detail/patient-profile/history-popup/history-popup.component';
import { ResourceService } from '@services/resource.service';

@Component({
  selector: 'patient-profile-popup',
  templateUrl: './patient-profile-popup.component.html',
  styleUrls: ['./patient-profile-popup.component.scss']
})
export class PatientProfilePopupComponent {
  public patient: Patient;
  public orderServices: OrderService[] = [];
  public documents: any[] = [];
  public appointmentList: Appointment[] = [];
  public documentPreview: PatientDocument;
  private modalRef: BsModalRef;
  private modalPatientProfileRef: BsModalRef;
  public generalDocumentData: PatientGeneralDocument;
  public consultationDocumentData: PatientConsultationDocument;
  public faceNeckDocumentData: FaceNeckDocument;
  public surgeryProcedureData: SurgeryProcedureDocument;
  public attachmentDocumentData: AttachmentDocument;
  public isPdfDocument: boolean = false;

  @ViewChild('historyPopup') historyPopup: HistoryPopupComponent;
  @ViewChild('soapDocument') soapDocument: TemplateRef<any>;
  @ViewChild('consultationDocument') consultationDocument: TemplateRef<any>;
  @ViewChild('generalDocument') generalDocument: TemplateRef<any>;
  @ViewChild('patientProfilePopup') patientProfilePopup: TemplateRef<any>;
  @ViewChild('surgeryProcedureDocument') surgeryProcedureDocument: TemplateRef<any>;
  @ViewChild('attachmentDocument') attachmentDocument: TemplateRef<any>;
  @ViewChild('faceNeckDocument') faceNeckDocument: TemplateRef<any>;

  public AppointmentId: number;

  public isIPadAir = false;
  public isCounter = true;
  private confirmationProcessSubscription: Subscription;
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }

  constructor(private dataService: DataService, private modalService: BsModalService, public notificationService: NotificationService, public resourceService: ResourceService) {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    if (this.confirmationProcessSubscription) { this.confirmationProcessSubscription.unsubscribe() }
    this.confirmationProcessSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (this.AppointmentId) { this.getHistory(this.AppointmentId); }
    })
  }
  showPatientProfile(data?: Patient) {
    this.appointmentList = [];
    this.documents = [];
    this.orderServices = [];
    this.modalPatientProfileRef = this.modalService.show(this.patientProfilePopup, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup patient-profile' });
    if (data) {
      this.orderServices = [];
      this.documents = [];
      this.AppointmentId = data.id;
      this.resourceService.currentPatient = data;
      this.dataService.getData<Patient[]>(Modules.getServiceHistory, `${data.id}`).then((response) => {
        if (response && response.length) {
          this.patient = response[0];
          this.patient.orders.forEach(d => {
            if (d.orderServices && d.orderServices.length) {
              this.orderServices = this.orderServices.concat(d.orderServices);
            }
          });
          this.orderServices.sort((a, b) => {
            return new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1;
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
                return new Date(a?.dateTime) < new Date(b?.dateTime) ? 1 : -1;
              });
              
          }
          if (this.patient.appointments && this.patient.appointments.length) {
            this.appointmentList = this.patient.appointments;
          }
        }
      });
    }
  }

  closePatientProfile() {
    this.modalPatientProfileRef.hide();
  }


  openPreviewDocument(data: any): void {
    if (!this.isCounter) {
      this.documentPreview = data;
      this.generalDocumentData = null;
      this.consultationDocumentData = null;
      if (data) {
        if (data.type === "Consultation") {
          this.consultationDocumentData = data;
          this.modalRef = this.modalService.show(this.consultationDocument, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup' });
        } else if (data.type === "General Document") {
          if (data.documentUrl) {
            this.generalDocumentData = { ...data, documentUrl: `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}` };
          } else {
            this.generalDocumentData = { ...data, documentUrl: data.documentUrl }
          }
          this.modalRef = this.modalService.show(this.generalDocument, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup' });
        } else if (data.type === "Face & Neck") {
          this.faceNeckDocumentData = data;
          this.modalRef = this.modalService.show(this.faceNeckDocument, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup' });
        } else if (data.type === "Surgery Procedure") {
          this.surgeryProcedureData = data;
          this.modalRef = this.modalService.show(this.surgeryProcedureDocument, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup' });
        } else if (data.type === "Attachment Document") {
          this.isPdfDocument = false;
          if (data.documentUrl) {
            this.attachmentDocumentData = { ...data, documentUrl: `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}` };
          } else {
            this.attachmentDocumentData = { ...data, documentUrl: data.documentUrl }
          }
          this.isPdfDocument = this.isPdf(data.documentUrl);
          this.modalRef = this.modalService.show(this.attachmentDocument, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup' });
        }
      }
    } else {
      this.isCounter = false
    }

  }

  isPdf(fileName: string): boolean {
    const extension = fileName.substring((fileName.lastIndexOf('.') +1));
    return /(pdf)$/ig.test(extension)
  }

  closePreviewDocument(): void {
    this.modalRef.hide();
  }

  openHistoryPopup(isDocument: boolean): void {
    if (isDocument) {
      this.historyPopup.showDocumentPopup(this.documents);
    } else {
      this.historyPopup.showServicePopup(this.orderServices);
    }


  }

  onRemoveGeneralDocument(document: PatientGeneralDocument): void {
    this.isCounter = true;
    this.dataService.postData<PatientGeneralDocument>(Modules.DeleteGeneralDocument, document).then((response) => {
    });
  }

  onRemoveConsultationDocument(document: PatientConsultationDocument): void {
    this.isCounter = true;
    this.dataService.postData<PatientConsultationDocument>(Modules.DeleteConsultationDocument, document).then((response) => {
    });
  }

  getHistory(data: number) {
    this.dataService.getData<Patient[]>(Modules.PatientByAppointment, `${this.resourceService.currentPatient?.id}`).then((response) => {
      if (response && response.length) {
        this.patient = response[0];
        this.patient.orders.forEach(d => {
          if (d.orderServices && d.orderServices.length) {
            this.orderServices = this.orderServices.concat(d.orderServices);
          }
        });
        this.orderServices.sort((a, b) => {
          return new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1;
        });

        if (this.patient && (
          (this.patient.consultationDocument && this.patient.consultationDocument.length) ||
          (this.patient.generalDocument && this.patient.generalDocument.length) ||
          (this.patient.faceNeckDocument && this.patient.faceNeckDocument.length) ||
          (this.patient.surgeryProcedureDocument && this.patient.surgeryProcedureDocument.length) ||
          (this.patient.attachmentDocument && this.patient.attachmentDocument.length))) {
            this.documents = [].concat(this.patient.consultationDocument, this.patient.generalDocument, this.patient.faceNeckDocument, this.patient.surgeryProcedureDocument, this.patient.attachmentDocument).sort((a, b) => {
              return new Date(a.dateTime) < new Date(b.dateTime) ? 1 : -1;
            });
          }

        if (this.patient.appointments && this.patient.appointments.length) {
          this.appointmentList = this.patient.appointments;
        }
      }
    });
  }

  onAgeTransformation(date: Date): number {
    return new Date().getFullYear() - new Date(date).getFullYear();
  }
}
