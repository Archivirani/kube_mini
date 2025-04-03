import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags, eMessageType } from '@services/model/data.service.model';
import { EnumTypes, Options, OptionsTransfer } from '@services/model/option.model';
import { Modules } from '@urls';
import { Subject, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { debounceTime } from 'rxjs/operators';
import { ResourceService } from '@services/resource.service';

@Component({
  selector: 'visit-note-documentation',
  templateUrl: './visit-note-documentation.component.html',
  styleUrls: ['./visit-note-documentation.component.scss']
})
export class VisitNoteDocumentationComponent implements OnInit {
  [x: string]: any;
  name: string = ''
  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  searchTerm = new Subject<string>();
  private currentNavigatedTabSubscription: Subscription;
  public psychIssuesList: { isSelected: boolean; value: string }[] = [
    { isSelected: false, value: "Meds." },
    { isSelected: false, value: "History Of Anxiety." },
    { isSelected: false, value: "Panic Attacks." },
    { isSelected: false, value: "Claustrophobia." }
  ];
  public OtherDetails: string = ""
  public Gender: Options[];
  @Input() Appointment: Appointment;
  @Input() currentActiveTab: string = "";
  // @Input() : Appointment;
  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  public isIPadAir = false;
  getDoctor: any[];
  doctor_Code: any;
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }

  public optionsToGet: OptionsTransfer[] = [{ enumType: EnumTypes.Gender }];

  constructor(public dataService: DataService, private documentationService: DocumentationService, private router: Router, private clinicService: ClinicService, private resourceService: ResourceService) {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.dyForm = this.createForm();
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
              this.getVisitNoteDocumentSave();
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
  }

  ngOnInit(): void {
    this.getOptions();
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    this.submitSubscription = this.documentationService.submitEvent.subscribe((resp) => {
      if (resp) {
        this.getVisitNoteDocumentSave({ type: 'navigation', data: "Patient-Profile" });
      } else {
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })
  }

  ngOnDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); };
    if (this.currentNavigatedTabSubscription) { this.currentNavigatedTabSubscription.unsubscribe() };
  }

  submitForm(data?: any) {
    if (this.dyForm.valid) {
      const isPhychIssue = this.psychIssuesList.filter(d => d.isSelected);
      if (isPhychIssue && isPhychIssue.length) {
        if (this.OtherDetails) {
          isPhychIssue.push({ isSelected: true, value: this.OtherDetails });
        }
        this.dyForm.get("PsychIssues").setValue(isPhychIssue.map(d => d.value).join(", "))
      }
      let patientData = {
        ...this.dyForm.value,
        PhysicianId: (this.Appointment.physician && this.Appointment.physician.id) ? this.Appointment.physician.id : 1,
        PatientId: this.Appointment.patient.id,
        AppointmentId: this.Appointment.id,
        PriorAnesthesia: this.dyForm.value.PriorAnesthesia === "Yes" ? true : false,
        PriorAnesthesiaSummery: this.dyForm.value.PriorAnesthesia === "Yes" ? this.dyForm.value.PriorAnesthesiaSummery : "",
      };
      this.dataService.post(Modules.RhinoDocument, patientData).then((response) => {
        if (response.status === StatusFlags.Success) {
          if (data) {
            if (data.type === "navigation") {
              this.currentActiveTab = data.data;
            } else if (data.type === "sub-navigation") {
              this.clinicService.currentSubActiveTab = data.data;
            }
          }
        }
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  createForm(): FormGroup {
    return new FormGroup({
      // // reasonforvisit: new FormControl(),
      // Type: new FormControl("Consultation"),
      // DateTime: new FormControl(new Date()),
      // PhysicianId: new FormControl(),
      // Physician: new FormControl(),
      // PatientId: new FormControl(),
      // Patient: new FormControl(),
      // AppointmentId: new FormControl(),
      // Summary: new FormControl('', [Validators.required]),
      // Age: new FormControl(null, [Validators.required]),
      // Gender: new FormControl('', [Validators.required]),
      // MainComplaint: new FormControl(),
      // BreathingDifficulty: new FormControl(),
      // PriorSurgeries: new FormControl(),
      // PriorComplications: new FormControl(),
      // BloodDisorders: new FormControl(),
      // Allergies: new FormControl(),
      // Examination: new FormControl(),
      // EndonasalExamination: new FormControl(),
      // PsychIssues: new FormControl(),
      // Smoking: new FormControl(),
      // PriorAnesthesia: new FormControl("No"),
      // PriorAnesthesiaSummery: new FormControl()
      createdDate: new FormControl(new Date()),
      reasonForVisit: new FormControl(),
      diagnosis: new FormControl(),
      assessment: new FormControl(),
    });
  }

  getOptions() {
    this.dataService.postData<OptionsTransfer[]>(Modules.OptionsUrl, this.optionsToGet).then((response) => {
      if (response && response.length) { this.Gender = response.find((d) => d.enumType === EnumTypes.Gender).options; }
    });
  }

  getVisitNoteDocumentSave(navigationTab?: any) {
    let htmlString =this.dyForm.value.assessment;
    const plainText = htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
    let getDoctorId = JSON.parse(sessionStorage.getItem('User'));
    const payload = {
      ...this.dyForm.value,
      id: 0,
      createdBy: getDoctorId?.id,
      updatedBy: getDoctorId?.updatedBy,
      updatedDate: getDoctorId?.updatedDate,
      visitNoteGeneralId: 0,
      visitNoteGeneralDocuments: null,
      visitNoteStatus: "Draft",
      diagnosisCode: "",
      doctor_Code: this.Appointment?.doctor_Code || this.Appointment?.specialities?.doctors?.doctor_Code || this.Appointment.doctor_code,
      patientId: this.resourceService?.currentPatient?.id,
      appointmentId: this.Appointment?.id,
      document_number: null,
      documentType: "Visit Note"
    }
    this.dataService.post<[]>(Modules.visitNoteDocument, payload).then((res) => {
      if(res.message ==='Document saved successfully'){
        this.clinicService.changeTab.next("Patient-Profile");
      }
    });
  }
  getVisitNoteDocumentRelease(navigationTab?: any) {
    let htmlString =this.dyForm.value.assessment;
    const plainText = htmlString?.replace(/<\/?[^>]+(>|$)/g, "");
    let getDoctorId = JSON.parse(sessionStorage.getItem('User'));
    const payload = {
      ...this.dyForm.value,
      id: 0,
      createdBy: getDoctorId.id,
      updatedBy: getDoctorId.id,
      updatedDate: getDoctorId.updatedDate,
      visitNoteGeneralId: 0,
      visitNoteGeneralDocuments: null,
      visitNoteStatus: "Released",
      diagnosisCode: "",
      doctor_Code: this.Appointment.doctor_Code || this.Appointment?.specialities?.doctors?.doctor_Code || this.Appointment.doctor_code,
      patientId: this.resourceService.currentPatient.id,
      appointmentId: this.Appointment.id,
      document_number: null,
      documentType: "Visit Note"
    }
    this.dataService.post<[]>(Modules.visitNoteDocument, payload,true).then((res) => {
      if(res){
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
        this.clinicService.changeTab.next("Patient-Profile");
      }
    });
  }

}
