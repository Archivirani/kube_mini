import { formatDate } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { StatusFlags, eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { EnumTypes, FieldNames, Options, OptionsTransfer, TableNames } from '@services/model/option.model';
import { Patient } from '@services/model/patient.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { WebCamComponent } from './web-cam/web-cam.component';

@Component({
  selector: 'app-register-patient',
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register-patient.component.scss'],
})
export class RegisterPatientComponent implements OnInit, OnDestroy {
  public BloodGroup: Options[] = [];
  public Gender: Options[] = [];
  public PatientIdType: Options[] = [];
  public PatientRelationship: Options[] = [];
  public Physician: Options[] = [];
  public SmokingStatus: Options[] = [];
  public getNationalityData: any[] = [];
  public getHearAboutUsDataList:any[]=[];
  private submitSubscription: Subscription;
  private closeSubscription: Subscription;
  private routeSubscription: Subscription;
  private confirmationProcessSubscription: Subscription;
  public uploadImageUrl: any;
  public existingImageUrl: string;

  public dyForm: FormGroup;
  public optionsToGet: OptionsTransfer[] = [
    {
      tableName: TableNames.Physician,
      keyField: FieldNames.Id,
      valueField: FieldNames.Name,
    },
    { enumType: EnumTypes.BloodGroup },
    { enumType: EnumTypes.SmokingStatus },
    { enumType: EnumTypes.Gender },
    {
      tableName: TableNames.PatientIdType,
      keyField: FieldNames.Id,
      valueField: FieldNames.Name,
    },
    {
      tableName: TableNames.PatientRelationship,
      keyField: FieldNames.Id,
      valueField: FieldNames.Name,
    },
  ];

  @ViewChild('uploadFile', { static: true }) uploadFile: ElementRef;
  @ViewChild('webCam', { static: true }) webCam: WebCamComponent;

  constructor(public dataService: DataService, private resourceService: ResourceService, private router: Router, private notificationService: NotificationService, private sanitizer: DomSanitizer) {
    this.getNationality();
    this.dyForm = this.createForm();
    this.getOption();
    this.onRouting();
  }

  ngOnInit(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    this.submitSubscription = this.resourceService.submitEvent.subscribe(event => { if (event) { this.submitForm(); } });
  
    this.getHearAboutUsData();
    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    this.closeSubscription = this.resourceService.cancelEvent.subscribe(() => {
      this.dataService.notify.next({ key: eMessageType.Warning, value: "Are you sure you want to cancel?", icon: eMessageIcon.Warning });
      if (this.confirmationProcessSubscription) { this.confirmationProcessSubscription.unsubscribe() }
      this.confirmationProcessSubscription = this.notificationService.confirmationProcess.subscribe((data) => {
        if (data) { this.router.navigateByUrl(`${FixedRoutes.Patient}`); }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }

  onRouting(): void {
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let patient = <Patient>this.router.getCurrentNavigation().extras.state;
        if(patient){
          this.dyForm.patchValue({
            id:patient.id,
            firstName:patient.firstName,
            familyName:patient.familyName,
            contactNo1:patient.contactNo1,
            email:patient.email,
            identificationNo:patient.identificationNo
           });
        }       
        if (this.router.url === `/${FixedRoutes.Patient}/${FixedRoutes.PatientEdit}`) {
          let setData=JSON.parse(sessionStorage.getItem('User'))
          let updatedBy = setData.updatedBy
          let patient = <Patient>this.router.getCurrentNavigation().extras.state;
          if (patient && patient.id) {
            let { ...datas}=patient;
            patient = {...datas,updatedBy: updatedBy, idType: !!patient.idType ? `${patient.idType}` : null, relation: !!patient.relation ? `${patient.relation}` : null, dateOfBirth: new Date(patient.dateOfBirth) };
            this.dyForm.patchValue(patient);
            this.existingImageUrl = patient.profileUrl ? `${Modules.Images}${sessionStorage.TenantCode}/Images/${patient.profileUrl}` : "";
          }
          else { this.router.navigate([FixedRoutes.Patient]); }
        }
        this.routeSubscription.unsubscribe();
      });
  }

  setFile(event: any) {
    this.uploadImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL
      ? window.URL.createObjectURL(event.target.files[0])
      : (window as any).webkitURL.createObjectURL(event.target.files[0]));
    this.dyForm.get('files').setValue([...event.target.files]);
  }

  imageBrowserUrl(file: File): string {
    return window.URL
      ? window.URL.createObjectURL(file)
      : (window as any).webkitURL.createObjectURL(file);
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

  submitForm() {
    if (this.dyForm.valid) {
      if (this.router.url === `/${FixedRoutes.Patient}/${FixedRoutes.PatientEdit}`) {
        let setData=JSON.parse(sessionStorage.getItem('User'))
          let updatedBy = setData.updatedBy
        let { dateOfBirth, ...patientData} = this.dyForm.value;
        const newDateTime: string = `${formatDate(dateOfBirth, "YYYY-MM-dd", "en-US")}T00:00:00.000Z`;
        this.dataService.postFile(Modules.Patient, { ...patientData, dateOfBirth: newDateTime, updatedBy:updatedBy}).then((response) => {
          if (response.status === StatusFlags.Success) {
            this.router.navigateByUrl(`/${FixedRoutes.Patient}`)
          }
        });
      }else{
        let { dateOfBirth, ...patientData } = this.dyForm.value;
        const newDateTime: string = `${formatDate(dateOfBirth, "YYYY-MM-dd", "en-US")}T00:00:00.000Z`;
        this.dataService.postFile(Modules.Patient, { ...patientData, dateOfBirth: newDateTime}).then((response) => {
          if (response.status === StatusFlags.Success) {
            this.router.navigateByUrl(`/${FixedRoutes.Patient}`)
          }
        });
      }
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  createForm(): FormGroup {
    let setData=JSON.parse(sessionStorage.getItem('User'))
    return new FormGroup({
      id: new FormControl(0),
      createdBy:new FormControl(setData.createdBy),
      // updatedBy: new FormControl(setData.updatedBy),
      medicalRecordNumber: new FormControl('-',[Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      secondName: new FormControl('', [Validators.required]),
      thirdName: new FormControl('', [Validators.required]),
      familyName: new FormControl('', [Validators.required]),
      mothersName: new FormControl(),
      job: new FormControl(),
      email: new FormControl(),
      contactNo1: new FormControl('', [Validators.required]),
      contactNo2: new FormControl(),
      bloodGroup: new FormControl(),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl(null,Validators.required) ,
      identificationNo: new FormControl('', [Validators.required]),
      relativeFirstName: new FormControl(),
      relativeLastName: new FormControl(),
      relativeGender: new FormControl(),
      emergencyContactNo: new FormControl(),
      comment: new FormControl(),
      address1: new FormControl('', [Validators.required]),
      address2: new FormControl(),
      city: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      idType: new FormControl(null,Validators.required),
      relation: new FormControl(),
      files: new FormControl(),
      profileUrl: new FormControl(),
      smokingStatus: new FormControl(),
      nationality: new FormControl(null,Validators.required),
      aboutus: new FormControl(),
      Hosp_Code:new FormControl(setData.hosp_Code)
    });
  }

  getOption() {
    this.dataService.postData<OptionsTransfer[]>(Modules.OptionsUrl, this.optionsToGet).then((response) => {
      if (response && response.length) {
        this.Physician = response.find((d) => d.tableName === TableNames.Physician).options;
        this.BloodGroup = response.find((d) => d.enumType === EnumTypes.BloodGroup).options;
        this.SmokingStatus = response.find((d) => d.enumType === EnumTypes.SmokingStatus).options;
        this.Gender = response.find((d) => d.enumType === EnumTypes.Gender).options;
        this.PatientIdType = response.find((d) => d.tableName === TableNames.PatientIdType).options;
        this.PatientRelationship = response.find((d) => d.tableName === TableNames.PatientRelationship).options;
      }
    });
  }

  getNationality() {
    this.dataService.getData<[]>(`${Modules.nationality}`).then((res) => {
      if (res) {
        this.getNationalityData = res;
      }
    });
  }
  getHearAboutUsData(){
    this.dataService.getData<[]>(`${Modules.getHearAboutUs}`).then((res)=>{
      if(res){
        this.getHearAboutUsDataList=res;
      }
    })
  }
}
