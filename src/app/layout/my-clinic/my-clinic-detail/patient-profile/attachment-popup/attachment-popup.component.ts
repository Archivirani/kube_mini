import { Component, ElementRef, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { CommentPopupComponent } from '@shared/component/comment-popup/comment-popup.component';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClinicWebCamComponent } from '../../web-cam/web-cam.component';

@Component({
  selector: 'attachment-popup',
  templateUrl: './attachment-popup.component.html',
  styleUrls: ['./attachment-popup.component.scss'],
  providers: [BsModalService]
})
export class AttachmentPopupComponent {
  private modalRef: BsModalRef;
  private appointment: Appointment;
  public docurl:any;
  public dyForm: FormGroup;
  public uploadImageUrl: any;
  public existingImageUrl: string;

  constructor(
    private modalService: BsModalService,
    public dataService: DataService,
    private clinicService: ClinicService,
    private sanitizer: DomSanitizer
  ) { }

  @ViewChild('attachmentPopup', { static: true }) attachmentPopup: TemplateRef<any>;
  @ViewChild('webCam', { static: true }) webCam: ClinicWebCamComponent;
  @ViewChild('comment', { static: true }) comment: CommentPopupComponent;
  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  showAttachmentPopup(data: Appointment) {
    this.appointment = data;
    this.uploadImageUrl = null;
    this.dyForm = this.createForm(data);
    this.modalRef = this.modalService.show(this.attachmentPopup, { backdrop: true, ignoreBackdropClick: false, class: 'attachment-popup' });
  }

  closePopup() {
    this.modalRef.hide();
  }

  takePicture() {
    this.webCam.showPopup();
    this.webCam.onclose.subscribe((resp) => {
      if (resp) {
        this.uploadImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL
          ? window.URL.createObjectURL(resp.data)
          : (window as any).webkitURL.createObjectURL(resp.data));
        this.dyForm.get('files').setValue([resp.data]);
      }
    })
  }

  removeFile() {
    if (this.uploadImageUrl) {
      this.uploadFile.nativeElement.value = "";
      this.dyForm.get('files').setValue([]);
      this.uploadImageUrl = "";
    } else {
      this.existingImageUrl = "";
      this.dyForm.get('profileUrl').setValue('');
    }
  }

  setFile(event: any) {
    const file = event.target.files[0];
    const url = window.URL.createObjectURL(file);
    this.uploadImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.docurl = file;
    this.dyForm.get('files').setValue([file]);
  }



  submitForm(): void {
    if (this.dyForm.valid) {
      const data= this.dyForm.value;
      // data.PhysicianId = (this.appointment.physician  && this.appointment.physician.id) ? this.appointment.physician.id : 1;
      // data.PatientId = this.appointment.patient.id;
      // data.AppointmentId = this.appointment.id;

      this.dataService.postFile(Modules.AttachmentDocument, data).then((response) => {
        if (response.status === StatusFlags.Success) {
          this.clinicService.changeTab.next("Patient-Profile");
          this.closePopup();
          this.onClose.emit(true);
        }
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  createForm(data): FormGroup {
    const getData=JSON.parse(sessionStorage.getItem('User'))
    return new FormGroup({
      id: new FormControl(0),
      type: new FormControl("Attachment Document"),
      dateTime: new FormControl(new Date()),
      physicianId: new FormControl(data.physicianId),
      patientId: new FormControl(data.patientId),
      appointmentId: new FormControl(data.id),
      files: new FormControl(),
      documentUrl: new FormControl(this.docurl?.name),
      createdBy:new FormControl(getData.id),
      createdDate:new FormControl(new Date()),
      document_number:new FormControl(''),
      doctor_Code:new FormControl(data.doctor_code || data.doctors.doctor_Code),
      patient:new FormControl(),
      physician:new FormControl(),
      updatedBy:new FormControl(0),
      updatedDate:new FormControl(new Date())
    });
  }
}
