import { formatDate } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Appointment, AppointmentStatus } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { FieldNames, Options, OptionsTransfer, TableNames } from '@services/model/option.model';
import { Patient } from '@services/model/patient.model';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-patient-list-popup',
  templateUrl: './patient-list-popup.component.html',
  styleUrls: ['./patient-list-popup.component.scss']
})
export class PatientListPopupComponent{

  private modalRef: BsModalRef;
  @ViewChild('patientList', { static: true }) patientList: TemplateRef<any>;
  @Output() onclose: EventEmitter<boolean> = new EventEmitter<boolean>();
  public specialitiesData: any;
  public dyForm: FormGroup;
  public PatientIdType: Options[] = [];
  public AppointmentType: Options[] = [];
  public optionsToGet: OptionsTransfer[] = [{ tableName: TableNames.PatientIdType, keyField: FieldNames.Id, valueField: FieldNames.Name }, { tableName: TableNames.AppointmentType, keyField: FieldNames.Id, valueField: FieldNames.Name }];
  public Mrn: string;
  public isIdAvailable: boolean = false;
  public isExistingPatient: boolean = false;
  public isEdit: boolean = false;
  constructor(private modalService: BsModalService, public dataService: DataService) { this.getOption(); }

  showPopup(data: Appointment) {
    this.dyForm = this.createForm();
    this.isExistingPatient = false;
    this.isEdit = !!data.isExisting;
    this.modalRef = this.modalService.show(this.patientList, { backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup' });
    this.isIdAvailable = false;
    if (data.startTime && data.endTime) {
      if (this.getTimeDifference(data.startTime, data.endTime) > 30) { data.endTime = this.addMinutesInTime(data.startTime, 30) }
      this.dyForm.patchValue(data);
    }
    if (data && data.id) {
      this.Mrn = data.patient?.medicalRecordNumber;
      this.isIdAvailable = true;
      this.dyForm.patchValue(data);
    }
  }

  createForm(): FormGroup {
    const setData=JSON.parse(sessionStorage.getItem('User'))
    return new FormGroup({
      id: new FormControl(0),
      appointmentDateTime: new FormControl(null, [Validators.required]),
      appointmentMinutes: new FormControl(null),
      patientDisease: new FormControl(''),
      appointmentTypeId: new FormControl(null, [Validators.required]),
      appointmentStatus: new FormControl(AppointmentStatus.Planned),

      patientId: new FormControl(null),
      startTime: new FormControl([Validators.required]),
      endTime: new FormControl('', [Validators.required]),
      createdBy:new FormControl(setData.id),
      patient: new FormGroup({
        firstName: new FormControl('', [Validators.required]),
        familyName: new FormControl('', [Validators.required]),
        email: new FormControl(''),
        contactNo1: new FormControl('', [Validators.required]),
        idType: new FormControl(),
        identificationNo: new FormControl(''),
        medicalRecordNumber: new FormControl('-'),
        speciality: new FormControl(''),
        doctor: new FormControl(''),
      })
    });
  }

  getOption() {
    this.dataService.postData<OptionsTransfer[]>(Modules.OptionsUrl, this.optionsToGet).then((response) => {
      if (response && response.length) {
        this.PatientIdType = response.find((d) => d.tableName === TableNames.PatientIdType).options.map((d: any) => ({ ...d, key: parseInt(d.key) }));
        this.AppointmentType = response.find((d) => d.tableName === TableNames.AppointmentType).options.map((d: any) => ({ ...d, key: parseInt(d.key) }));
      }
    });
  }

  getPatient(data: string) {
    if (data.length >= 6) {
      this.dataService.getData<Patient[]>(Modules.PatientSearch, data).then((resp) => {
        if (resp && resp.length) {
          let searchedPatient = resp[0];
          this.dyForm.patchValue({ ...this.dyForm.value, patient: { ...searchedPatient, idType: searchedPatient.idType }, patientId: searchedPatient.id });
          this.isExistingPatient = true;
        }
      });
    }
  }

  submitForm(): void {

    if (this.dyForm.valid) {
      let { appointmentDateTime, ...appointmentData } = this.dyForm.value;
      const appDate: Date = appointmentDateTime;
      let appSTime: string = this.dyForm.value.startTime;
      let appETime: string = this.dyForm.value.endTime;
      if (appSTime.split(':').length == 2) { appSTime = `${appSTime}:00`; }
      if (appETime.split(':').length == 2) { appETime = `${appETime}:00`; }
      const newAppMinutes: number = this.getTimeDifference(appSTime, appETime);

      const newDateTime: string = `${formatDate(appDate, "YYYY-MM-dd", "en-US")}T${appSTime}.000Z`;
      this.dataService.post(Modules.Appointment, { ...appointmentData, appointmentDateTime: newDateTime, appointmentMinutes: newAppMinutes }).then((response) => {
        if (response.status === StatusFlags.Success) { this.onclose.emit(true); this.modalRef.hide(); }
      });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  getTimeDifference(startTime: string, endTime: string): number {
    const startTimeDate: Date = new Date(0, 0, 0, +startTime.split(':')[0], +startTime.split(':')[1]);
    const endTimeDate: Date = new Date(0, 0, 0, +endTime.split(':')[0], +endTime.split(':')[1]);
    return Math.round((((endTimeDate.getTime() - startTimeDate.getTime()) / 1000) / 60));
  }

  addMinutesInTime(time: string, minutes: number): string {
    let timeToUpdate: Date = new Date(0, 0, 0, +time.split(':')[0], +time.split(':')[1]);
    timeToUpdate.setMinutes(timeToUpdate.getMinutes() + minutes);
    return `${timeToUpdate.getHours() < 10 ? '0' + timeToUpdate.getHours() : timeToUpdate.getHours()}:${timeToUpdate.getMinutes()}:00`;
  }

  onClose(): void { this.onclose.emit(false); this.modalRef.hide(); }

}
