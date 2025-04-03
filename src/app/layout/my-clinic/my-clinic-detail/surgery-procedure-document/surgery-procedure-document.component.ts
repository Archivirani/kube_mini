import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { ResourceService } from '@services/resource.service';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'surgery-procedure-document',
  templateUrl: './surgery-procedure-document.component.html',
  styleUrls: ['./surgery-procedure-document.component.scss']
})
export class SurgeryProcedureDocumentComponent implements OnInit, OnDestroy {
  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  private currentNavigatedTabSubscription: Subscription;
  public isIPadAir = false;

  @Input() Appointment: Appointment;
  @Input() currentActiveTab: string = "";
  constructor(
    public dataService: DataService,
    private clinicService: ClinicService,
    private documentationService: DocumentationService,
    private resourceService:ResourceService
  ) {
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
            this.clinicService.changeTab.next(resp.data);
          } else if (resp.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = resp.data;
          }
        }
      }
    })
  }

  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }

  ngOnInit(): void {
    this.submitSubscription = this.documentationService.submitEvent.subscribe((resp) => {
      if (resp) {
        this.submitForm({ type: 'navigation', data: "Patient-Profile" });
      } else {
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })
  }

  submitForm(navigationTab?: any) {
    if (this.dyForm.valid) {
      const data = this.dyForm.value;
      let date = new Date(data.Date);
      const time = data.Time.split(':');
      date.setHours(time[0]);
      date.setMinutes(time[1]);
      date.setSeconds(0);
      const setData=JSON.parse(sessionStorage.getItem('User'))
      const patientData = {
        id: 0,
        type: data.Type,
        dateTime: date,
        documentUrl: data.DocumentUrl,
        preOperativeDiagnosis: data.PreOperativeDiagnosis,
        postOperativeDiagnosis: data.PostOperativeDiagnosis,
        operation: data.Operation,
        operationIndications: data.OperationIndications,
        operationNote: data.OperationNote,
        physicianId: (this.Appointment.physician && this.Appointment.physician.id) ? this.Appointment.physician.id   : 1,
        patientId: this.Appointment.patientId || this.resourceService.currentPatient.id,
        appointmentId: this.Appointment.id,
        createdBy: setData.id,
        createdDate:new Date(),
        updatedBy:setData.updatedBy,
        updatedDate:new Date(),
        document_number:'',
        doctor_Code:this.Appointment.doctor_Code || this.Appointment?.specialities?.doctors?.doctor_Code || this.Appointment.doctor_code,
      }

      this.dataService.post(Modules.SurgeryProcedureDocument, patientData).then((response) => {
        this.clinicService.changeTab.next("Patient-Profile");
        if (response.status === StatusFlags.Success) {
          if (navigationTab.type === "navigation") {
            this.currentActiveTab = navigationTab.data;
          } else if (navigationTab.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = navigationTab.data;
          }
        }
      });

    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  createForm(): FormGroup {
    const currentDate = new Date();
    const time = `${currentDate.getHours()}:${currentDate.getMinutes()}`
    return new FormGroup({
      Type: new FormControl("Surgery Procedure"),
      Date: new FormControl(currentDate),
      Time: new FormControl(time),
      PhysicianId: new FormControl(),
      Physician: new FormControl(),
      PatientId: new FormControl(),
      Patient: new FormControl(),
      AppointmentId: new FormControl(),
      DocumentUrl: new FormControl(),
      PreOperativeDiagnosis: new FormControl(),
      PostOperativeDiagnosis: new FormControl(),
      Operation: new FormControl(),
      OperationIndications: new FormControl(),
      OperationNote: new FormControl(),
    });
  }

  ngOnDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() };
    if (this.currentNavigatedTabSubscription) { this.currentNavigatedTabSubscription.unsubscribe() };
  }
}
