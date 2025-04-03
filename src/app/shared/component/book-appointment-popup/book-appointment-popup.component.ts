import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '@services/appointment.service';
import { DataService } from '@services/data.service';
import { Appointment, AppointmentStatus } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { FieldNames, Options, OptionsTransfer, TableNames } from '@services/model/option.model';
import { Patient } from '@services/model/patient.model';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'book-appointment-popup',
  templateUrl: './book-appointment-popup.component.html',
  styleUrls: ['./book-appointment-popup.component.scss'],
  providers: [BsModalService]
})
export class BookAppointmentPopupComponent implements OnInit {

  public modalRef: BsModalRef;
  public BsModalRef: BsModalRef;
  public popupName: any;
  public specialitiesData: any;
  public dyForm: FormGroup;
  public Mrn: string;
  public patientName: string;
  public isIdAvailable: boolean = false;
  public isExistingPatient: boolean = false;
  public isEdit: boolean = false;
  public retriveSpeciality: any;
  public retriveDoctor: any;
  public appointmentDetails: any;
  public appointmentsSlot: any[] = [];
  public getDoctor: any;
  public searchedPatient: any[] = [];
  public searchTypeOnKeyEnter: any;
  public typingTimer: any;
  public noDoctorsAvailableForSpeciality: boolean = false;
  public urlData: any;
  public isProvisional: boolean;
  public isLabOrRad: boolean = false;
  public PatientIdType: Options[] = [];
  public AppointmentType: Options[] = [];
  public optionsToGet: OptionsTransfer[] = [{ tableName: TableNames.PatientIdType, keyField: FieldNames.Id, valueField: FieldNames.Name }, { tableName: TableNames.AppointmentType, keyField: FieldNames.Id, valueField: FieldNames.Name }];

  @ViewChild('bookAppointment', { static: true }) bookAppointment: TemplateRef<any>;
  @Output() onclose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('PatientList', { static: true }) PatientList: TemplateRef<any>;

  constructor(private modalService: BsModalService, public dataService: DataService, public appointmentService: AppointmentService, public router: Router) {
    this.getOption();
    this.urlData = this.router.url;
  }
  ngOnInit() {
    this.GetSpecialities();
  }

  showPopup(data?: Appointment, item?: string) {
    const urlData = this.router.url;
    if (urlData === '/laboratory' || urlData === '/radiology' || urlData === '/pharmacy' || urlData === '/order') {
      data.MedicalRecord = data.MedicalRecord || item;
      this.getPatientByMrn(data.MedicalRecord);
    }
    this.getDoctorBySpeciality(data?.specialityDetails?.speciality_Code ? data?.specialityDetails?.speciality_Code : data?.speciality_Code);
    this.dyForm = this.createForm(data);
    let labSpe_code = this.specialitiesData?.find((d) => d.speciality_desc.trim() === "Laboratory")?.speciality_Code;

    if (this.router.url == '/laboratory') {
      this.dyForm.controls['appointmentTypeId'].setValue(4);
      this.dyForm.controls['speciality_Code'].setValue(labSpe_code);
      this.getDoctorBySpeciality(labSpe_code);
      // this.dyForm.controls['doctor_Code'].setValue("Doc_205");
    }
    if (this.router.url == '/radiology') {
      let radSpe_code = this.specialitiesData?.find((d) => d.speciality_desc.trim() === "Radiology")?.speciality_Code;
      this.dyForm.controls['appointmentTypeId'].setValue(4);
      this.dyForm.controls['speciality_Code'].setValue(radSpe_code);
      this.getDoctorBySpeciality(radSpe_code);
      // this.dyForm.controls['doctor_Code'].setValue("Doc_220");
    }

    this.appointmentDetails = data;
    this.isExistingPatient = false;
    this.isEdit = !!data?.isExisting;
    this.modalRef = this.modalService.show(this.bookAppointment, { backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup' });
    this.isIdAvailable = false;
    const setData = JSON.parse(sessionStorage.getItem('User'));

    if (data?.startTime && data?.endTime) {
      if (this.getTimeDifference(data.startTime, data.endTime) > 30) { data.endTime = this.addMinutesInTime(data.startTime, 30) }
      this.dyForm.patchValue({ ...data, hosp_Code: setData.hosp_Code, id: 0, createdBy: setData.id });
    }
    if (data && data.id) {
      if (data.patient === undefined) {
        this.isProvisional = data.isProvisional;
        this.Mrn = data?.isProvisional ? data?.provisionalMRM : data?.medicalRecordNumber;
        this.isIdAvailable = false;
        data.patientId = data.id;
        data.id = 0;
      } else {
        this.isProvisional = data.patient.isProvisional;
        this.Mrn = data?.patient.isProvisional ? data?.provisionalMRM : data?.patient.medicalRecordNumber;
        this.isIdAvailable = true;
        data.patientId = data?.patient.id;
        data.id = data.id;
      }
      this.dyForm.patchValue({ ...data, appointmentDateTime: new Date(data.appointmentDateTime), hosp_Code: setData.hosp_Code, createdBy: setData.id });
    }
  }

  createForm(data?: any): FormGroup {
    this.Mrn = data?.MedicalRecord,
      this.patientName = data?.patientName;
    const setData = JSON.parse(sessionStorage.getItem('User'));
    return new FormGroup({
      id: new FormControl(0),
      appointmentDateTime: new FormControl(null, [Validators.required, this.dateValidator()]),
      appointmentMinutes: new FormControl(null),
      patientDisease: new FormControl(''),
      appointmentTypeId: new FormControl(null, [Validators.required]),
      appointmentStatus: new FormControl(AppointmentStatus.Planned),
      patientId: new FormControl(null),
      startTime: new FormControl([Validators.required]),
      endTime: new FormControl('', [Validators.required]),
      hosp_Code: new FormControl(setData.hosp_Code),
      patient: new FormGroup({
        firstName: new FormControl(!data?.patient ? data?.firstName : '', [Validators.required]),
        familyName: new FormControl(!data?.patient ? data?.familyName : '', [Validators.required]),
        email: new FormControl(!data?.patient ? data?.email : ''),
        contactNo1: new FormControl(!data?.patient ? data?.contactNo1 : '', [Validators.required]),
        idType: new FormControl(!data?.patient ? data?.idType : ''),
        identificationNo: new FormControl(!data?.patient ? data?.identificationNo : ''),
        medicalRecordNumber: new FormControl(!data?.patient ? data?.medicalRecordNumber ? data?.medicalRecordNumber === '' : 0 : '-'),
        createdBy: new FormControl(setData.id),
        createdDate: new FormControl(new Date()),
      }),
      doctor_Code: new FormControl(data?.doctorDetails?.doctor_Code, [Validators.required]),
      DoctorName: new FormControl('', [Validators.required]),
      speciality_Code: new FormControl(data?.specialityDetails?.speciality_Code, [Validators.required]),
      comment: new FormControl(setData.comment),
      createdBy: new FormControl(setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(setData.id),
      updatedDate: new FormControl(setData.updatedDate),
      dept_Code: new FormControl(data?.doctorDetails?.dept_Code),
      IsProvisional: new FormControl(false),
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

  addConditionalValidators() {
    const data = this.router.url;
    const specialityCode = this.dyForm?.get('speciality_Code')?.value;
    const speciality = this.specialitiesData?.find(s => s.speciality_Code === specialityCode);
    const doctorCodeControl = this.dyForm?.get('doctor_Code');
    const doctorCodeName = this.dyForm?.get('DoctorName');

    if (speciality) {
      if (speciality.speciality_desc !== 'Laboratory' && speciality.speciality_desc !== 'Radiology') {
        this.dyForm.get('DoctorName')?.clearValidators();
        doctorCodeControl?.setValidators([Validators.required]);
      } else if ((speciality.speciality_desc === 'Laboratory' || speciality.speciality_desc === 'Radiology') && (data === '/laboratory' || data === '/radiology')) {

        this.dyForm.get('doctor_Code')?.clearValidators();
        this.dyForm.get('doctor_Code')?.setValue('');
        doctorCodeName?.setValidators([Validators.required]);
      } else {
        doctorCodeControl?.setValidators([Validators.required]);
        doctorCodeName.clearValidators();
      }
      this.dyForm.get('doctor_Code')?.updateValueAndValidity();
      this.dyForm.get('DoctorName')?.updateValueAndValidity();
    }
  }


  shouldAddTag(): boolean {
    let data = this.router.url;
    const specialityCode = this.dyForm.get('speciality_Code')?.value;
    const speciality = this.specialitiesData?.find((s) => s.speciality_Code === specialityCode);
    this.addConditionalValidators()
    return ((speciality?.speciality_desc === 'Laboratory' || speciality?.speciality_desc === 'Radiology') && (data === '/laboratory' || data === '/radiology'))
  }

  isSpecialityCodeForOtherDoctors(): boolean {
    this.addConditionalValidators();
    const specialityCode = this.dyForm.get('speciality_Code').value;
    const speciality = this.specialitiesData?.find((s) => s.speciality_Code === specialityCode);
    let data = this.router.url;
    if (data === '/laboratory' || data == '/radiology') {
      if (speciality?.speciality_desc !== 'Laboratory' && speciality?.speciality_desc !== 'Radiology') {
        return true;
      }
    } else {
      return true
    }
    // return ((data === '/laboratory' ||  data == '/radiology')&&(speciality?.speciality_desc !== 'Laboratory' && speciality?.speciality_desc !== 'Radiology'))
  }

  getPatientByMrn(data: any) {
    if (data && data.length >= 6) {
      this.dataService.getData<Patient[]>(Modules.PatientSearch, data).then((resp) => {
        if (resp && resp.length) {
          let searchedPatient = resp.find((d) => (d.medicalRecordNumber || d.firstName + d.secondName + d.thirdName + d.familyName) === data);
          this.dyForm.patchValue({ ...this.searchedPatient, patient: { ...searchedPatient, idType: searchedPatient.idType }, patientId: searchedPatient.id });
          this.isExistingPatient = true;
        } else {
          this.dyForm.get('patient').patchValue({
            medicalRecordNumber: 0,
            identificationNo: '',
            email: '',
            familyName: '',
            firstName: '',
            contactNo1: ''
          });
          Swal.fire({
            title: "Patient does not exist",
            icon: 'warning',
            confirmButtonText: "Cancel",
            confirmButtonColor: '#3f7473',
            customClass: {
              container: 'notification-popup'
            }
          }).then(() => {
            if (this.modalRef) {
              this.modalRef.hide();
            }
          })
        }
      });
    }
    else {
      this.dyForm.get('patient').patchValue({
        medicalRecordNumber: 0,
        identificationNo: '',
        email: '',
        familyName: '',
        firstName: '',
        contactNo1: ''
      });
    }
  }

  getPatient(event) {
    const doneTypingInterval = 1500;
    clearTimeout(this.typingTimer);
    if (event) {
      const data = event?.target?.value;
      if (data && data.length) {
        this.typingTimer = setTimeout(() => {
          this.dataService.getData<Patient[]>(Modules.PatientSearch, data).then((resp) => {
            if (resp && resp.length) {
              let searchedPatient = resp[0];
              if (resp && resp.length > 1) {
                this.searchedPatient = resp;
                this.BsModalRef = this.modalService.show(this.PatientList, { backdrop: true, ignoreBackdropClick: false, class: 'book-appointment-modal' });
              } else {
                const data = this.dyForm.get('patient').value;
                if (data.firstName?.toLowerCase() === searchedPatient.firstName?.toLowerCase() ||
                  data.contactNo1 === searchedPatient.contactNo1 ||
                  data.familyName?.toLowerCase() === searchedPatient.familyName?.toLowerCase() ||
                  data.identificationNo?.toLowerCase() === searchedPatient.identificationNo?.toLowerCase()
                ) {
                  this.Mrn = searchedPatient.medicalRecordNumber;
                  this.dyForm.patchValue({ ...this.dyForm.value, patient: { ...searchedPatient, idType: searchedPatient.idType }, patientId: searchedPatient.id });
                }
              }
              this.isExistingPatient = true;
            }
          });
        }, doneTypingInterval);
      }
    }
    else {
      this.dyForm.get('patient').patchValue({
        medicalRecordNumber: 0
      });
    }
  }

  onChange(event) {
    this.dyForm.patchValue({ ...this.dyForm.value, patient: { ...event, idType: event.idType }, patientId: event.id });
    this.Mrn = event.medicalRecordNumber;
    this.BsModalRef.hide();
  }

  openBookAppoimentEdit() {
    this.modalRef.hide();
    this.router.navigate([`${FixedRoutes.Patient}/${FixedRoutes.PatientRegister}`], { state: this.appointmentDetails.patient });

  }

  submitForm(): void {
    let data = this.router.url;
    if (this.dyForm.valid) {
      let { appointmentDateTime, DoctorName, ...appointmentData } = this.dyForm.value;
      const appDate: Date = appointmentDateTime;
      let appSTime: string = this.dyForm.value.startTime;
      let appETime: string = this.dyForm.value.endTime;
      if (appSTime.split(':').length == 2) { appSTime = `${appSTime}:00`; }
      if (appETime.split(':').length == 2) { appETime = `${appETime}:00`; }
      const newAppMinutes: number = this.getTimeDifference(appSTime, appETime);
      const newDateTime: string = `${formatDate(appDate, "YYYY-MM-dd", "en-US")}T${appSTime}.000Z`;
      const specialityCode = this.dyForm?.get('speciality_Code')?.value;
      const speciality = this.specialitiesData?.find((s) => s.speciality_Code === specialityCode);

      if ((speciality?.speciality_desc === 'Laboratory' || speciality?.speciality_desc === 'Radiology') && (data === '/laboratory' || data === '/radiology')) {
        let payload = {
          ...appointmentData,
          appointmentDateTime: newDateTime,
          appointmentMinutes: newAppMinutes
        };
        const isdocrordata = this.getDoctor?.find((d => d.doctor_Code === this.dyForm.get('DoctorName').value));
        if (isdocrordata) {
          payload.doctor_Code = isdocrordata.doctor_Code;
        } else {
          const doctor_Name = this.dyForm.get('DoctorName').value.label
          payload.doctorName = doctor_Name;
        }

        this.dataService.post(Modules.Appointment, { ...payload }).then((response) => {
          if (response.status === StatusFlags.Success) { this.onclose.emit(true); this.modalRef.hide(); this.dataService.dataService.next(this.dyForm.value); this.Mrn = ''; }
          if (data === '/laboratory' || data === '/radiology' || data === '/pharmacy') {
            Swal.fire({
              text: "Appointment booked successfully",
              icon: "success",
              showCancelButton: true,
              showConfirmButton: true,
              confirmButtonColor: "#3f7473",
              cancelButtonColor: "#e71d36",
              confirmButtonText: "Add service",
              customClass: {
                container: 'notification-popup'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                if (data == '/laboratory') {
                  this.router.navigate([`${FixedRoutes.laboratory}/${FixedRoutes.laboratoryDetails}`], { state: response.data });
                } else if (data == '/radiology') {
                  this.router.navigate([`${FixedRoutes.Radiology}/${FixedRoutes.RadiologyDetails}`], { state: response.data });
                } else if (data == '/pharmacy') {
                  this.router.navigate([`${FixedRoutes.Pharmacy}/${FixedRoutes.PharmacyDetails}`], { state: response.data });
                }
              }
            });
          }
        });
      } else {
        this.dataService.post(Modules.Appointment, { ...appointmentData, appointmentDateTime: newDateTime, appointmentMinutes: newAppMinutes }).then((response: any) => {
          if (response.status === StatusFlags.Success) { this.onclose.emit(true); this.modalRef.hide(); this.dataService.dataService.next(this.dyForm.value); this.Mrn = ''; }
          if (data === '/laboratory' || data === '/radiology' || data === '/pharmacy') {
            Swal.fire({
              text: "Appointment booked successfully",
              icon: "success",
              showCancelButton: true,
              showConfirmButton: true,
              confirmButtonColor: "#3f7473",
              cancelButtonColor: "#e71d36",
              confirmButtonText: "Add service",
              customClass: {
                container: 'notification-popup'
              }
            }).then((result) => {
              if (result.isConfirmed) {
                if (data == '/laboratory') {
                  this.router.navigate([`${FixedRoutes.laboratory}/${FixedRoutes.laboratoryDetails}`], { state: response.data });
                } else if (data == '/radiology') {
                  this.router.navigate([`${FixedRoutes.Radiology}/${FixedRoutes.RadiologyDetails}`], { state: response.data });
                } else if (data == '/pharmacy') {
                  this.router.navigate([`${FixedRoutes.Pharmacy}/${FixedRoutes.PharmacyDetails}`], { state: response.data });
                }
              }
            });
          }
        });
      }
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  GetSpecialities(): void {
    const getUserData = JSON.parse(sessionStorage.User);
    this.dataService.getData<[]>(`${Modules.GetSpecialities}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=dept_1`).then((res) => {
      if (res) {
        this.specialitiesData = res;
      }
    });
  }

  // getDoctorBySpeciality(event: any) {
  //   if (event == 'spe_179' || event == 'spe_180' || event == 'spe_181' || event == 'spe_182') {
  //     let startTime = new Date();
  //     startTime.setHours(9, 0, 0, 0);
  //     let sTime = formatDate(startTime, "HH:mm", "en-US")
  //     let endTime = new Date();
  //     endTime.setHours(21, 0, 0, 0);
  //     let eTime = formatDate(endTime, "HH:mm", "en-US")
  //     this.dyForm.patchValue({
  //       startTime: sTime,
  //       endTime: eTime
  //     })
  //   } else {
  //     const startTime = new Date();
  //     const endTime = new Date(startTime.getTime() + 30 * 60000);
  //     this.dyForm?.patchValue({
  //       startTime: formatDate(startTime, "HH:mm", "en-US"), endTime: formatDate(endTime, "HH:mm", "en-US")
  //     })
  //   }
  //   if (event) {
  //     const getUserData = JSON.parse(sessionStorage.User);
  //     const selectedSpeciality = this.specialitiesData.find(d => d.speciality_Code === event);
  //     console
  //     if (selectedSpeciality) {
  //       this.dataService.getData(`${Modules.GetGetDoctor}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=${selectedSpeciality.dept_Code}&Speciality_Code=${selectedSpeciality.speciality_Code}`).then((res: any) => {
  //         if (res) {
  //           this.getDoctor = res;
  //         }
  //       });
  //     }
  //   }
  // }

  onSpecialtyChange(event: any) {
    this.getDoctorBySpeciality(event);
  }

  getDoctorBySpeciality(event: any) {
    if (event == 'spe_179' || event == 'spe_180' || event == 'spe_181' || event == 'spe_182') {
      let startTime = new Date();
      startTime.setHours(9, 0, 0, 0);
      let sTime = formatDate(startTime, "HH:mm", "en-US");
      let endTime = new Date();
      endTime.setHours(21, 0, 0, 0);
      let eTime = formatDate(endTime, "HH:mm", "en-US");
      this.dyForm.patchValue({
        startTime: sTime,
        endTime: eTime
      })
    } else {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60000);
      // this.dyForm?.patchValue({
      //   startTime: formatDate(startTime, "HH:mm", "en-US"), endTime: formatDate(endTime, "HH:mm", "en-US")
      // })
    }
    if (event) {
      const getUserData = JSON.parse(sessionStorage.User);
      const selectedSpeciality = this.specialitiesData?.find(d => d.speciality_Code === event);
      if (selectedSpeciality) {
        let data = this.router.url;
        const specialityCode = this.dyForm?.get('speciality_Code')?.value;
        const speciality = this.specialitiesData?.find((s) => s.speciality_Code === specialityCode);
        if ((data === '/laboratory' || data === '/radiology') && (speciality?.speciality_desc === 'Laboratory' || speciality?.speciality_desc === 'Radiology')) {
          this.dataService.getData(`${Modules.getDoctorForAppoinment}?Hosp_Code=${getUserData.hosp_Code}&Speciality_Code=${specialityCode}`).then((res: any) => {
            if (res) {
              this.getDoctor = res;
              this.isLabOrRad = true;
              this.dyForm.get('doctor_Code').patchValue('');
            }
          })
        } else {
          this.dataService.getData(`${Modules.GetGetDoctor}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=${selectedSpeciality.dept_Code}&Speciality_Code=${selectedSpeciality.speciality_Code}`).then((res: any) => {
            if (res) {
              this.getDoctor = res;
              this.dyForm.get('DoctorName').patchValue('');
            }
          });
        }
      }
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

  onClose(): void {
    this.onclose.emit(false); this.modalRef.hide();
    this.dyForm.reset();
    this.Mrn = '';
  }

  onHidePopup() {
    this.BsModalRef.hide();
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      const currentDate = new Date();
      const selectedDateWithoutTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      if (selectedDateWithoutTime < currentDateWithoutTime) {
        return { 'pastDate': true };
      }
      return null;
    };
  }
}
function conditionalRequiredValidator(arg0: () => boolean): ValidatorFn | ValidatorFn[] {
  throw new Error('Function not implemented.');
}