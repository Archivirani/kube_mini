import { Component, ElementRef, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { CommentPopupComponent } from '@shared/component/comment-popup/comment-popup.component';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import { ClinicWebCamComponent } from '../web-cam/web-cam.component';
import Swal from 'sweetalert2';
import { ResourceService } from '@services/resource.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'general-document',
  templateUrl: './general-document.component.html',
  styleUrls: ['./general-document.component.scss']
})
export class GeneralDocumentComponent implements OnDestroy {
  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  private currentNavigatedTabSubscription: Subscription;
  public uploadImageUrl: any;
  public existingImageUrl: string;

  @Input() Appointment: Appointment;
  private modalRef: BsModalRef;
  @Input() currentActiveTab: string = "";
  @ViewChild('webCam', { static: true }) webCam: ClinicWebCamComponent;
  @ViewChild('comment', { static: true }) comment: CommentPopupComponent;
  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  constructor(public dataService: DataService,private modalService: BsModalService, private documentationService: DocumentationService, private clinicService: ClinicService, private sanitizer: DomSanitizer , private resourceService:ResourceService) {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    if (this.currentNavigatedTabSubscription) { this.currentNavigatedTabSubscription.unsubscribe() };
    this.currentNavigatedTabSubscription = this.clinicService.currentNavigatedTab.subscribe((resp: any) => {
      if (resp && resp !== 'Documentation') {
        if (this.dyForm.touched) {
          Swal.fire({
            title: "Do You really want to save this document?",
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Discard",
            confirmButtonColor: '#3f7473',
            cancelButtonColor: '#e71d36',
            customClass: {
              container: 'notification-popup'
            }
          }).then((result) => {
            if (result.value) {
              this.submitForm(resp);
            } else {
              if (resp.type === "navigation") {
                this.currentActiveTab = resp.data;
                this.clinicService.changeTab.next(resp.data);
              } else if (resp.type === "sub-navigation") {
                this.clinicService.currentSubActiveTab = resp.data;
              }
            }
          });
        } else {
          if (resp.type === "navigation") {
            this.currentActiveTab = resp.data;
            this.clinicService.changeTab.next(resp.data);
          } else if (resp.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = resp.data;
          }
        }
      }
    })
    this.submitSubscription = this.documentationService.submitEvent.subscribe((resp) => {
      if (resp) {
        this.submitForm({ type: 'navigation', data: "Patient-Profile" });
      } else {
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })
  }
ngOnInit(){
  this.dyForm = this.createForm();
}



  submitForm(navigationTab?: any) {
    if (this.dyForm.valid) {
      let patientData = {
        ...this.dyForm.value,
        generalDocumentStatus:"Draft"
      };
      this.dataService.postFile(Modules.GeneralDocument, patientData).then((response) => {
        this.clinicService.changeTab.next("Patient-Profile");
        if (response.status === StatusFlags.Success) {
          if (navigationTab?.type === "navigation") {
            this.currentActiveTab = navigationTab.data;
          } else if (navigationTab?.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = navigationTab.data;
          }
        }
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  getGeneralNoteDocumentRelease(navigationTab?: any){
    if (this.dyForm.valid) {
      let patientData = {
        ...this.dyForm.value,
        generalDocumentStatus:"Released"
      };
      this.dataService.postFile(Modules.GeneralDocument, patientData).then((response) => {
        this.clinicService.changeTab.next("Patient-Profile");
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
          this.clinicService.changeTab.next("Patient-Profile")
        }
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
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
    this.dyForm.get('files').setValue([file]);
  }


  createForm(): FormGroup {
    const setData=JSON.parse(sessionStorage.getItem('User'))
    return new FormGroup({
      title: new FormControl(''),
      type: new FormControl("General Document"),
      dateTime: new FormControl(new Date()),
      physicianId: new FormControl(this.Appointment?.physicianId),
      patientId: new FormControl(this.Appointment?.patientId || this.resourceService?.currentPatient?.id),
      appointmentId: new FormControl(this.Appointment?.id),
      note: new FormControl(),
      files: new FormControl(),
      id:new FormControl(0) ,
      createdBy:new FormControl(setData.id),
      createdDate:new FormControl(new Date()),
      updatedBy:new FormControl(setData.id),
      updatedDate:new FormControl(new Date()),
      physician:new FormControl(),
      patient:new FormControl(),
      documentUrl:new FormControl(),
      document_number:new FormControl(''),
      doctor_Code:new FormControl(this.Appointment?.doctor_Code || this.Appointment?.specialities?.doctors?.doctor_Code || this.Appointment?.doctor_code),
    });
  }
 
  ngOnDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    if (this.currentNavigatedTabSubscription) { this.currentNavigatedTabSubscription.unsubscribe() };
  }
}
