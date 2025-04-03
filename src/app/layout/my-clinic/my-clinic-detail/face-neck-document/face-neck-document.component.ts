import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { EnumTypes, Options, OptionsTransfer } from '@services/model/option.model';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'face-neck-document',
  templateUrl: './face-neck-document.component.html',
  styleUrls: ['./face-neck-document.component.scss']
})
export class FaceNeckDocumentComponent implements OnInit {
  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  private currentNavigatedTabSubscription: Subscription;
  public psychIssuesList: { isSelected: boolean; value: string }[] = [
    { isSelected: false, value: "None" },
    { isSelected: false, value: "Anxiety" },
    { isSelected: false, value: "Bipolar" },
    { isSelected: false, value: "Depression" },
    { isSelected: false, value: "Panic Attacks" }
  ];
  public OtherDetails: string = ""
  public Gender: Options[];
  public ThreadLocation: Options[];
  public FilterLocation: Options[];
  public PriorTreatment: Options[];
  @Input() Appointment: Appointment;
  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  public isIPadAir = false;
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }

  @Input() currentActiveTab: string = "";


  public optionsToGet: OptionsTransfer[] = [{ enumType: EnumTypes.Gender }, { enumType: EnumTypes.ThreadLocation }, { enumType: EnumTypes.FilterLocation }, { enumType: EnumTypes.PriorTreatment }];

  constructor(public dataService: DataService, private documentationService: DocumentationService, private router: Router, private clinicService: ClinicService) {
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
        this.submitForm({ type: 'navigation', data: "Patient-Profile" });
      } else {
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })
  }

  ngOnDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() };
    if (this.currentNavigatedTabSubscription) { this.currentNavigatedTabSubscription.unsubscribe() };
  }

  submitForm(data: any) {
    if (this.dyForm.valid) {
      const isPhychIssue = this.psychIssuesList.filter(d => d.isSelected);
      if (isPhychIssue && isPhychIssue.length) {
        if (this.OtherDetails) {
          isPhychIssue.push({ isSelected: true, value: this.OtherDetails });
        }
        this.dyForm.get("PsychIssues").setValue(isPhychIssue.map(d => d.value).join(", "))
      }
      const FaceNeckDocumentData = {
        ...this.dyForm.value,
        PhysicianId: (this.Appointment.physician && this.Appointment.physician.id) ? this.Appointment.physician.id : 1,
        PatientId: this.Appointment.patient.id,
        AppointmentId: this.Appointment.id,
        PriorAnesthesiaSummery: this.dyForm.value.PriorAnesthesia === "Yes" ? this.dyForm.value.PriorAnesthesiaSummery : "",
        PermanentFillers: this.dyForm.value.PermanentFillers === "Yes" ? true : false,
        PriorNeckLiposuction: this.dyForm.value.PriorNeckLiposuction === "Yes" ? true : false,
        EnergyDevice: this.dyForm.value.EnergyDevice === "Yes" ? true : false,
        BloodThinners: this.dyForm.value.BloodThinners === "Yes" ? true : false,
        PriorAnesthesia: this.dyForm.value.PriorAnesthesia === "Yes" ? true : false,
        Hypertension: this.dyForm.value.Hypertension === "Yes" ? true : false,
        DocumentDm: this.dyForm.value.DocumentDM === "Yes" ? true : false,
      };
      this.dataService.post(Modules.FaceNeckDocument, FaceNeckDocumentData).then((response) => {
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
      Type: new FormControl("Face & Neck"),
      DateTime: new FormControl(new Date()),
      PhysicianId: new FormControl(),
      Physician: new FormControl(),
      PatientId: new FormControl(),
      Patient: new FormControl(),
      AppointmentId: new FormControl(),
      Summary: new FormControl('', [Validators.required]),
      Age: new FormControl('', [Validators.required]),
      Gender: new FormControl('', [Validators.required]),
      MainComplaint: new FormControl(),
      PriorSurgeries: new FormControl(),
      PriorComplications: new FormControl(),
      PriorTreatments: new FormControl(),
      FilterLocation: new FormControl(),
      ThreadLocation: new FormControl(),
      PermanentFillers: new FormControl("No"),
      PermanentFillersLocation: new FormControl(),
      PriorNeckLiposuction: new FormControl("No"),
      EnergyDevice: new FormControl("No"),
      BloodThinners: new FormControl("No"),
      BloodThinnerType: new FormControl(),
      Allergies: new FormControl(),
      PriorAnesthesia: new FormControl("No"),
      PriorAnesthesiaSummary: new FormControl(),
      Hypertension: new FormControl("No"),
      HypertensionMeds: new FormControl(),
      HypertensionManagingDoctor: new FormControl(),
      DocumentDm: new FormControl("No"),
      DocumentDmMeds: new FormControl(),
      DocumentDmLastHeg: new FormControl(),
      DocumentDmMangingDoctor: new FormControl(),
      DocumentCad: new FormControl("Previous Stents"),
      DocumentCadLastEcho: new FormControl(),
      PsychIssues: new FormControl(),
      PsychIssuesMeds: new FormControl(),
      HistoryOf: new FormControl("Anxiety"),
      Examination: new FormControl(),
      PhotoEvaluationWithPatient: new FormControl(),
      PatientSpecificConcernAndRequest: new FormControl(),
      SurgicalPlan: new FormControl()
    });
  }

  getOptions() {
    this.dataService.postData<OptionsTransfer[]>(Modules.OptionsUrl, this.optionsToGet).then((response) => {
      if (response && response.length) {
        this.Gender = response.find((d) => d.enumType === EnumTypes.Gender).options;
        this.ThreadLocation = response.find((d) => d.enumType === EnumTypes.ThreadLocation).options;
        this.PriorTreatment = response.find((d) => d.enumType === EnumTypes.PriorTreatment).options;
        this.FilterLocation = response.find((d) => d.enumType === EnumTypes.FilterLocation).options;
      }
    });
  }
}
