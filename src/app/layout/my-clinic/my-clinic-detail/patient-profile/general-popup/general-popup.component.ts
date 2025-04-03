import { Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { PatientGeneralDocument } from '@services/model/patient.model';
import { ResourceService } from '@services/resource.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { ClinicWebCamComponent } from '../../web-cam/web-cam.component';

@Component({
  selector: 'general-popup',
  templateUrl: './general-popup.component.html',
  styleUrls: ['./general-popup.component.scss']
})
export class GeneralPopupComponent implements OnInit {
  public dyForm: FormGroup;
  public modalRef: BsModalRef;
  public existingImageUrl: SafeResourceUrl | null = null;
  public uploadImageUrl: any;
  public appointmentId: number;

  @Input() currentActiveTab: string = "";
  @Output() onCloseevent: EventEmitter<any> = new EventEmitter<any>();
  @Input() Appointment: Appointment;
  @ViewChild('generalePopup', { static: true }) generalePopup: TemplateRef<any>;
  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  @ViewChild('webCam', { static: true }) webCam: ClinicWebCamComponent;
  constructor(public dataService: DataService, private sanitizer: DomSanitizer , private modalService: BsModalService, private resourceService: ResourceService, private clinicService: ClinicService) { }

  ngOnInit(): void {

  }

  showPopup(data) {
    this.appointmentId = data.appointmentId;
    this.dyForm = this.createForm(data);
    if (data.documentUrl) {
      const url = `${Modules.Images}${sessionStorage.TenantCode}/Images/${data.documentUrl}`;
      this.uploadImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    this.modalRef = this.modalService.show(this.generalePopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup general-note-Popup' });
  }

  submitForm(navigationTab?: any) {
    if (this.dyForm.valid) {
      let patientData = {
        ...this.dyForm.value,
        appointmentId: this.appointmentId,
        generalDocumentStatus: "Draft"
      };
      this.dataService?.postFile(Modules.GeneralDocument, patientData).then((response) => {
        this.clinicService.changeTab.next("Patient-Profile");
        if (response.status === StatusFlags.Success) {
          if (navigationTab?.type === "navigation") {
            this.currentActiveTab = navigationTab.data;
          } else if (navigationTab?.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = navigationTab.data;
          }
        }
        this.modalRef.hide();
        this.onCloseevent.emit();
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  getGeneralNoteDocumentRelease(navigationTab?: any) {
    if (this.dyForm.valid) {
      let patientData = {
        ...this.dyForm.value,
        appointmentId: this.appointmentId,
        generalDocumentStatus: "Released"
      };
      this.dataService?.postFile(Modules.GeneralDocument, patientData).then((response) => {
        this.clinicService.changeTab.next("Patient-Profile");
        this.modalRef.hide();
        this.onCloseevent.emit();
        if (response.status === StatusFlags.Success) {
          if (navigationTab?.type === "navigation") {
            this.currentActiveTab = navigationTab.data;
          } else if (navigationTab?.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = navigationTab.data;
          }
          Swal.fire({
            title: "Document Released Successfully",
            icon: 'success',
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: "Close",
            cancelButtonColor: '#3f7473',
            customClass: {
              container: 'notification-popup'
            }
          })
        }
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }


  onClose() {
    this.modalRef.hide();
  }

  createForm(data?, item?): FormGroup {
    const setData = JSON.parse(sessionStorage.getItem('User'))
    return new FormGroup({
      title: new FormControl(''),
      type: new FormControl("General Document"),
      dateTime: new FormControl(new Date()),
      physicianId: new FormControl(this.Appointment?.physicianId),
      patientId: new FormControl(this.Appointment?.patientId || this.resourceService?.currentPatient?.id),
      appointmentId: new FormControl(this.Appointment?.id),
      note: new FormControl(data?.note),
      files: new FormControl(),
      id: new FormControl(data.id),
      createdBy: new FormControl(setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(setData.id),
      updatedDate: new FormControl(new Date()),
      physician: new FormControl(),
      patient: new FormControl(),
      documentUrl: new FormControl(data.documentUrl),
      document_number: new FormControl(data?.document_number),
      doctor_Code: new FormControl(this.Appointment?.doctor_Code || data.patientDocuments.doctorDode || this.Appointment?.specialities?.doctors?.doctor_Code || this.Appointment?.doctor_code),
    });
  }

  takePicture() {
    this.webCam.showPopup();
    this.webCam.onclose.subscribe((resp) => {
      if (resp) {
        this.uploadImageUrl = this.sanitizer?.bypassSecurityTrustResourceUrl(window.URL
          ? window.URL.createObjectURL(resp.data)
          : (window as any).webkitURL?.createObjectURL(resp.data));
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
    this.uploadImageUrl = this.sanitizer?.bypassSecurityTrustResourceUrl(url);
    this.dyForm.get('files').setValue([file]);
  }

}
