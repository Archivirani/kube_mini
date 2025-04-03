import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from '@services/data.service';
import { FieldNames, Options, OptionsTransfer, TableNames } from '@services/model/option.model';
import { Patient } from '@services/model/patient.model';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-configurationlist',
  templateUrl: './add-configurationlist.component.html',
  styleUrls: ['./add-configurationlist.component.scss'],
  providers: [BsModalService]
})
export class AddConfigurationlistComponent implements OnInit {
  public setData: any;
  private modalRef: BsModalRef;
  public specialtyList: any[] = [];
  public getRoomStatusdata:any[]=[];
  public floorsList:any[]=[];
  public doctorsList:any[]=[];
  public userTypeList:any[]=[]
  public PatientIdType: Options[] = [];
  public AppointmentType: Options[] = [];
  public specialitiesData: any;
  public getDoctor: any;
  public getCategoryList: any;
  public subcategoryList:any;
  public optionsToGet: OptionsTransfer[] = [{ tableName: TableNames.PatientIdType, keyField: FieldNames.Id, valueField: FieldNames.Name }, { tableName: TableNames.AppointmentType, keyField: FieldNames.Id, valueField: FieldNames.Name }];
  public addBedsForm:FormGroup;
  floorform: FormGroup;
  specialityform: FormGroup;
  doctorsForm: FormGroup;
  medicationForm: FormGroup;
  servicesForm: FormGroup;
  updateRoomsForm:FormGroup;
  userForm:FormGroup;
  bookedSlotsForm:FormGroup;
  consumableForm:FormGroup;
  @Output() sendOnload: EventEmitter<any> = new EventEmitter();

  @ViewChild('addSpecialityPopup', { static: true }) addSpecialityPopup: TemplateRef<any>;
  @ViewChild('addFloorPopup', { static: true }) addFloorPopup: TemplateRef<any>;
  @ViewChild('addServicesPopup', { static: true }) addServicesPopup: TemplateRef<any>;
  @ViewChild('addDoctorPopup', { static: true }) addDoctorPopup: TemplateRef<any>;
  @ViewChild('addMedicationPopup', { static: true }) addMedicationPopup: TemplateRef<any>;
  @ViewChild('addRoomsPopup', { static: true }) addRoomsPopup: TemplateRef<any>;
  @ViewChild('addBedsPopup', { static: true }) addBedsPopup: TemplateRef<any>;
  @ViewChild('addUserPopup', { static: true }) addUserPopup: TemplateRef<any>;
  @ViewChild('addBookedSlotsPopup', { static: true }) addBookedSlotsPopup: TemplateRef<any>;
  @ViewChild('addConsumablesPopup', { static: true }) addConsumablesPopup: TemplateRef<any>;
  roomsList: any[]=[];
  getbedStatusdata: any[]=[];
  userData: any[];




  constructor(private modalService: BsModalService, private dataService: DataService) {

  }
  public statuslist = [{ name: 'Active', active: '1' }, { name: 'Not Active', active: '0' }]
  // public categorizationList = ['Loboratory', 'Procedures and packages', 'Consultation', 'Radiology', 'Medication']
  ngOnInit(): void {
    this.setData = JSON.parse(sessionStorage.getItem('User'));
    this.getSpecialityList();
    this.getFloorsList();
    this.getbedStatuslist();
    this.getAllRoomsList();
    this.getDoctorslist();
    this.getUserTypelist();
    this.getUserList()
  }

  successPopup(data: string) {
    Swal.fire({
      title: data,
      icon: 'success',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Ok",
      confirmButtonColor: '#3f7473',
      customClass: {
        container: 'notification-popup'
      }
    }).then(() => {
      this.modalRef.hide();
    })
  }
  //For Speciality Insert
  showAddSpecialityPopup() {
    this.createSpecialityForm();
    this.modalRef = this.modalService.show(this.addSpecialityPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciality-popup' });
  }

  createSpecialityForm() {
    this.specialityform = new FormGroup({
      active: new FormControl(),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      id: new FormControl(0),
      speciality_Code: new FormControl(),
      speciality_desc: new FormControl(),
      arabic_desc: new FormControl(),
    });
  }

  addSpeciality() {
    const payload = this.specialityform.value;
    this.dataService.post<[]>(Modules.getSpeciality, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Specialty Added Successfully')
        this.sendOnload.emit('Specialties');
      }
    });
  }

  //For Doctors Insert
  showAddDoctorsPopup() {
    this.createDoctorsForm();
    this.modalRef = this.modalService.show(this.addDoctorPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
  }
  createDoctorsForm() {
    this.doctorsForm = new FormGroup({
      id: new FormControl(0),
      doctor_FName: new FormControl(),
      doctor_MName: new FormControl(''),
      doctor_LName: new FormControl(),
      doctor_Name: new FormControl(),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      speciality_Code: new FormControl(),
      iD_Number: new FormControl(0),
      license_ID: new FormControl(),
      allow_DBook: new FormControl(),
    });

  }
  getSpecialityList() {
    this.dataService.getData(`${Modules.getSpeciality}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.specialtyList = resp;
    });
  }

  addDoctorList() {
    const { doctor_Name, ...res } = this.doctorsForm.value;
    const doctorName = this.doctorsForm.get('doctor_FName')?.value + " " + this.doctorsForm.get('doctor_MName')?.value + ' ' + this.doctorsForm.get('doctor_LName')?.value
    const payload = {
      ...res,
      doctor_Name: doctorName,
    }
    this.dataService.post<[]>(`${Modules.getAttendingPhysician}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Doctor Added Successfully')
      }
      this.sendOnload.emit('Doctor');
    })
  }

  //For Floor insert

  showAddFloorPopup() {
    this.createFloorList();
    this.modalRef = this.modalService.show(this.addFloorPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
  }

  createFloorList() {
    this.floorform = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      hospital: new FormControl(),
      floornumber: new FormControl(),
      floorName: new FormControl(),
      isActive: new FormControl(),
      isBooked: new FormControl(false)
    });
  }

  addFloorList() {
    const payload = this.floorform.value;
    this.dataService.post<[]>(`${Modules.addFloors}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Floors Added Successfully');
        this.sendOnload.emit('Floor');
      }
    })
  }

  //for add medication List

  showaddMedicationPopup() {
    this.createMedicationList();
    this.modalRef = this.modalService.show(this.addMedicationPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
  }
  createMedicationList() {
    this.medicationForm = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      code: new FormControl(''),
      name: new FormControl(),
      defaultPrice: new FormControl(),
      categorization: new FormControl("Medication"),
      unit: new FormControl(),
      arabicName: new FormControl(''),
      isMedication: new FormControl(true),
      isConsumables: new FormControl(false),
      isActive:new FormControl(),
      Barcode:new FormControl(),
    });

  }
  addMedicationList() {
    const payload = this.medicationForm.value;
    this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Medication Added Successfully');
        this.sendOnload.emit('Medication');
      }
    })
  }

  onClose() {
    this.modalRef.hide();
  }

  //for services add

  showAddServicespopup() {
    this.createServicesList();
    this.getCaterogy()
    this.modalRef = this.modalService.show(this.addServicesPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
  }

  createServicesList() {
    this.servicesForm = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      code: new FormControl(''),
      name: new FormControl(),
      defaultPrice: new FormControl(),
      categorization: new FormControl(),
      unit: new FormControl(),
      arabicName: new FormControl(''),
      isMedication: new FormControl(true),
      isConsumables: new FormControl(true),
      isActive:new FormControl(),
      Barcode:new FormControl(),
      subcategories:new FormControl()
    });
  };

  getCaterogy(){
    this.dataService.getData(`${Modules.getCategorization}`).then((res) => {
      this.getCategoryList = res;
    });
  };

  subcategories(event){
    const data = this.getCategoryList.find(d => d.category === event).subCategory;
    this.subcategoryList = data;
  }

  addServicesList() {
    const { isMedication, ...res } = this.servicesForm.value;
    const data = this.servicesForm.value
    const payload = {
      ...res,
      isMedication: data.categorization === 'Medication' ? true : false,
      isConsumables: data.categorization === 'Consumables' ? true : false,
    }
    this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Services Added Successfully');
        this.sendOnload.emit('Service');
      }
    })
  }


  //For Rooms Add
  showRoomsPopup(){
    this.getRoomStatuslist();
    this.getFloorsList();
    this.addRoomsForms();
    this.modalRef = this.modalService.show(this.addRoomsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
  }

  addRoomsForms(){
    this.updateRoomsForm = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      floorsId: new FormControl(),
      floors: new FormControl(null),
      roomNumber: new FormControl(),
      roomName: new FormControl(),
      roomsStatusId: new FormControl(),
      roomsStatus: new FormControl(null),
      isActive: new FormControl(),
      isBooked: new FormControl(false),
    });
  }

  getRoomStatuslist(){
    this.dataService.getData<[]>(Modules.GetRoomsStatus).then((res:any) =>{
      this.getRoomStatusdata=res;
    });
  }

  getFloorsList(){
    this.dataService.getData(`${Modules.getAllFloorsList}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.floorsList = resp;
    });
  }

  addRoomsList(){
    const payload=this.updateRoomsForm.value;
    this.dataService.post<[]>(`${Modules.SaveUpdateRoom}`,payload).then((res:any)=>{
      if(res.status == 1){
        this.successPopup('Rooms Added Successfully')
        this.sendOnload.emit('Room');
      }
    })
  }

//for bed add
  showBedPopup(){
    this.addBedsForms();
    this.modalRef = this.modalService.show(this.addBedsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
  }
  getAllRoomsList(){
    this.dataService.getData(`${Modules.GetAllRooms}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.roomsList = resp;
    });
  }
  getbedStatuslist(){
    this.dataService.getData<[]>(Modules.GetbedStatus).then((res:any) =>{
      this.getbedStatusdata=res;
    });
  }

  addBedsForms(){
    this.addBedsForm = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      roomId: new FormControl(),
      rooms: new FormControl(),
      badNumber: new FormControl(),
      badName: new FormControl(),
      isActive: new FormControl(),
      isBooked: new FormControl(false),
      floorsId: new FormControl(),
      floors: new FormControl(),
      bedstatusId: new FormControl(),
      badsStatus: new FormControl(),
    });
  }
  
  addBedsList(){
    const payload=this.addBedsForm.value;
    this.dataService.post<[]>(`${Modules.SaveUpdateBed}`,payload).then((res:any)=>{
      if(res.status == 1){
        this.successPopup('Beds Added Successfully')
        this.sendOnload.emit('Bed');
      }
    })
  }
//add User
showUserPopup(){
  this.addUserForm();
  this.modalRef = this.modalService.show(this.addUserPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
}
addUserForm(){
this.userForm=new FormGroup({
   id:new FormControl(0), 
   createdBy:new FormControl(this.setData.id), 
   createdDate:new FormControl(new Date().toLocaleString),
   updatedBy:new FormControl(this.setData.id), 
   updatedDate:new FormControl(new Date()),
   password:new FormControl(),
   isActive:new FormControl(), 
   isDeleted:new FormControl(false), 
   doctor_Code:new FormControl(),
   hosp_Code:new FormControl(this.setData.hosp_Code),
   casheir_id:new FormControl(),
   employee_id:new FormControl(''),
   userTypeId:new FormControl(), 
   userType:new FormControl(null), 
   firstName:new FormControl(),
   lastName:new FormControl(),
  
});
}
getUserList(){
  this.dataService.getData(`${Modules.getUserList}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any)=>{
    this.userData=resp;
  });
}
getDoctorslist() {
  this.dataService.getData(`${Modules.getAttendingPhysician}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
    this.doctorsList = resp;
  });
}
getUserTypelist() {
  this.dataService.getData(`${Modules.getUserTypeList}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any)=>{
    this.userTypeList=resp;
  });
}
addUser(){
  if (this.userData?.some((user: any) => user.employee_id === this.userForm?.get('employee_id').value)) {
    // Show swal message indicating employee_id already exists
    Swal.fire({
      icon: 'error',
      title: 'Employee ID Already Exists',
      text: 'The employee ID you entered already exists in the user list.',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Ok",
      confirmButtonColor: '#3f7473',
      customClass: {
        container: 'notification-popup'
      }
    });
  }else{
    const payload=this.userForm.value;
    this.dataService.post(`${Modules.addUser}`,payload).then(()=>{
      this.sendOnload.emit('Users');
      this.modalRef.hide();
    });
  }
}

// booked slots
showBookedSlotsPopup(){
  this.BookedSlotsForm();
  this.modalRef = this.modalService.show(this.addBookedSlotsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-popup' });
};

BookedSlotsForm(){
  const startTime=new Date()
  this.bookedSlotsForm = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date().toLocaleTimeString),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      startTime: new FormControl(formatDate(startTime, "HH:mm:ss", "en-Us")),
      endTime: new FormControl(this.addMinutesInTime(startTime,30)),
      speciality_Code: new FormControl(),
      doctor_Code: new FormControl(),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      isActive: new FormControl(),
  });
}

  addBookedSlots(){
    const payload = this.bookedSlotsForm.value;
    this.dataService.post(`${Modules.specialtyBookingSlots}`,payload).then((res:any)=>{
      if(res.status == 1){
        this.sendOnload.emit('BookedSlots');
        this.modalRef.hide();
        this.successPopup('Booked Slots Added Successfully')
      }
    });
  }

  getTimeDifference(startTime: string, endTime: string): number {
    const startTimeDate: Date = new Date(0, 0, 0, +startTime.split(':')[0], +startTime.split(':')[1]);
    const endTimeDate: Date = new Date(0, 0, 0, +endTime.split(':')[0], +endTime.split(':')[1]);
    return Math.round((((endTimeDate.getTime() - startTimeDate.getTime()) / 1000) / 60));
  }
  addMinutesInTime(startTime: Date, minutes: number): string {
    const endTime = new Date(startTime.getTime() + minutes * 60000);
    return this.formatTime(endTime);
  }
  
  formatTime(time: Date): string {
    const hours = ('0' + time.getHours()).slice(-2);
    const minutes = ('0' + time.getMinutes()).slice(-2);
    const seconds = ('0' + time.getSeconds()).slice(-2);
    return `${hours}:${minutes}:${seconds}`;
  }

  getDoctorBySpeciality(event: any) {
    if (event) {
      const getUserData = JSON.parse(sessionStorage.User);
      const selectedSpeciality = this.specialtyList.find(d => d.speciality_Code === event);
      console
      if (selectedSpeciality) {
        this.dataService.getData(`${Modules.GetGetDoctor}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=${selectedSpeciality.dept_Code}&Speciality_Code=${selectedSpeciality.speciality_Code}`).then((res: any) => {
          if (res) {
            this.getDoctor = res;
          }
        });
      }
    }
  }

// Consumables
  showConsumablesPopup(){
    this.createConsumablesList();
    this.modalRef = this.modalService.show(this.addConsumablesPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  };

  createConsumablesList() {
    this.consumableForm = new FormGroup({
      id: new FormControl(0),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      code: new FormControl(''),
      name: new FormControl(),
      defaultPrice: new FormControl(),
      categorization: new FormControl("Consumables"),
      unit: new FormControl(),
      arabicName: new FormControl(''),
      isMedication: new FormControl(false),
      isConsumables: new FormControl(true),
      isActive:new FormControl(),
      Barcode:new FormControl(),
    });
  };
  addConsumablesList() {
    const payload = this.consumableForm.value;
    this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Consumables Added Successfully');
        this.sendOnload.emit('Consumables');
      };
    });
  };
}
