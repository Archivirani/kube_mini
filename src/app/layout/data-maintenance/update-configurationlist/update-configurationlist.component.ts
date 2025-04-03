import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-configurationlist',
  templateUrl: './update-configurationlist.component.html',
  styleUrls: ['./update-configurationlist.component.scss'],
  providers: [BsModalService]
})
export class UpdateConfigurationlistComponent implements OnInit {
  private modalRef: BsModalRef;
  public doctorsForm: FormGroup;
  public updateFloorForm: FormGroup;
  public medicationForm: FormGroup;
  public updateServicesForm: FormGroup;
  public updateRoomsForm:FormGroup;
  specialityform: FormGroup;
  updateBedsForm:FormGroup;
  userForm: FormGroup;
  consumableForm: FormGroup;
  bookedSlotsForm: FormGroup;
  public doctorsList:any[]=[];
  public userTypeList:any[]=[]
  private setData: any;
  public specialityList: any[] = []
  public getRoomStatusdata:any[]=[]
  public getbedStatusdata:any[]=[]
  public floorsList:any[]=[]
  public roomsList:any[]=[]
  public getCategoryList: any;
  public subcategoryList:any;
  public statuslist = [{ name: 'Active', active: '1' }, { name: 'Not Active', active: '0' }]
  public categorizationList = ['Loboratory','Procedures and packages','Consultation','Radiology','Medication']
  public getDoctor:any[] = [];
  public userData:any[]
  @Output() sendOnload: EventEmitter<any> = new EventEmitter();

  @ViewChild('updateFloorsPopup', { static: true }) updateFloorsPopup: TemplateRef<any>;
  @ViewChild('upadteMedicationPopup', { static: true }) upadteMedicationPopup: TemplateRef<any>;
  @ViewChild('updateServicesPopup', { static: true }) updateServicesPopup: TemplateRef<any>;
  @ViewChild('updateDoctorPopup', { static: true }) updateDoctorPopup: TemplateRef<any>;
  @ViewChild('updateSpecialityPopup', { static: true }) updateSpecialityPopup: TemplateRef<any>;
  @ViewChild('updateBedsPopup', { static: true }) updateBedsPopup: TemplateRef<any>;
  @ViewChild('updateRoomsPopup', { static: true }) updateRoomsPopup: TemplateRef<any>;
  @ViewChild('updateUserPopup', { static: true }) updateUserPopup: TemplateRef<any>;
  @ViewChild('updateBookedSlotsPopup', { static: true }) updateBookedSlotsPopup: TemplateRef<any>;
  @ViewChild('upadteConsumablePopup', { static: true }) upadteConsumablePopup: TemplateRef<any>;

  constructor(private modalService: BsModalService, private dataService: DataService) { 
  }

  ngOnInit(): void {
    this.setData = JSON.parse(sessionStorage.getItem('User'));
    this.getDoctorslist();  
    this.getSpecialityList();
    this.getFloorsList();
    this.getAllRoomsList();
    this.getUserTypelist() ;
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

  //For Speciality-Update
  showSpecialityPopup(data) {
    this.createSpecialityForm(data);
    this.modalRef = this.modalService.show(this.updateSpecialityPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  }

  UpdateSpeciality() {
    const payload = this.specialityform.value;
    this.dataService.put<[]>(Modules.getSpeciality, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Speciality Updated Successfully')
        this.sendOnload.emit('Specialties');
      }
    });
  }

  createSpecialityForm(data) {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.specialityform = new FormGroup({
      active: new FormControl(data.active),
      hosp_Code: new FormControl(getData.hosp_Code),
      id: new FormControl(data.id),
      speciality_Code: new FormControl(data.speciality_Code),
      speciality_desc: new FormControl(data.speciality_desc),
      arabic_desc: new FormControl(data.arabic_desc),
    });
  }
  // for Doctors update

  showDoctorPopup(data) {
    this.createDoctorsForm(data)
    this.modalRef = this.modalService.show(this.updateDoctorPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  }
  onClose() {
    this.modalRef.hide();
  }
  createDoctorsForm(data) {
    this.doctorsForm = new FormGroup({
      id: new FormControl(data.id),
      doctor_FName: new FormControl(data.doctor_FName),
      doctor_MName: new FormControl(data.doctor_MName),
      doctor_LName: new FormControl(data.doctor_LName),
      doctor_Name: new FormControl(data.
        doctor_Name),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      speciality_Code: new FormControl(data.
        speciality_Code),
      iD_Number: new FormControl(0),
      license_ID: new FormControl(data.
        license_ID
      ),
      allow_DBook: new FormControl(data.allow_DBook),
      active: new FormControl(data.active)
    });

  }
  getSpecialityList() {
    this.dataService.getData(`${Modules.getSpeciality}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.specialityList = resp;
    });
  }


  updateDoctorList() {
    const { doctor_Name, ...res } = this.doctorsForm.value;
    const doctorName = this.doctorsForm.get('doctor_FName')?.value + this.doctorsForm.get('doctor_MName')?.value + this.doctorsForm.get('doctor_LName')?.value
    const payload = {
      ...res,
      doctor_Name: doctorName,
    }
    this.dataService.put<[]>(`${Modules.getAttendingPhysician}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Doctor updated Successfully');
        this.sendOnload.emit('Doctor');
      }
    })
  }

  showFloorPopup(data) {
    this.updateFloorForms(data);
    this.modalRef = this.modalService.show(this.updateFloorsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  }

  updateFloorForms(data) {
    this.updateFloorForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      hospital: new FormControl(),
      floornumber: new FormControl(data.floornumber),
      floorName: new FormControl(data.floorName),
      isActive: new FormControl(data.isActive),
      isBooked: new FormControl(data.isBooked)
    });
  }
  updateFloorList() {
    const payload = this.updateFloorForm.value;
    this.dataService.post<[]>(`${Modules.addFloors}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Floor update Successfully')
        this.sendOnload.emit('Floor');
      }

    });
  }

  //For Medication update

  showMedicationpopup(data: any) {
    this.createMedicationList(data);
    this.modalRef = this.modalService.show(this.upadteMedicationPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  }

  createMedicationList(data) {
    this.medicationForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      code: new FormControl(data.code),
      name: new FormControl(data.name),
      defaultPrice: new FormControl(data.defaultPrice),
      categorization: new FormControl("Medication"),
      unit: new FormControl(data.unit),
      arabicName: new FormControl(''),
      isMedication: new FormControl(true),
      isActive:new FormControl(data.isActive),
      barcode:new FormControl(data.barcode),
    });

  }
  updateMedicationList() {
    const payload = this.medicationForm.value;
    this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Medication Updated Successfully');
        this.sendOnload.emit('Medication')
      }
    })
  }

// For service
  showServicespopup(data) {
    this.createServicesList(data);
    this.getCaterogy();
    this.modalRef = this.modalService.show(this.updateServicesPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });

  }
  createServicesList(data) {
    this.updateServicesForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      code: new FormControl(data.code),
      name: new FormControl(data.name),
      defaultPrice: new FormControl(data.defaultPrice),
      categorization: new FormControl(data.categorization),
      unit: new FormControl(data.unit),
      Barcode: new FormControl(data.barcode),
      arabicName: new FormControl(data.arabicName),
      isMedication: new FormControl(true),
      isActive:new FormControl(data.isActive),
      subcategories:new FormControl(data.subcategories)
    });

  }
  getCaterogy(){
    this.dataService.getData(`${Modules.getCategorization}`).then((res) => {
      this.getCategoryList = res;
    });
  };

  subcategories(event){
    const data = this.getCategoryList.find(d => d.category === event).subCategory;
    this.subcategoryList = data;
  };

  updateServicesList() {
    const { isMedication, ...res } = this.updateServicesForm.value;
    const data = this.updateServicesForm.value
    const payload = {
      ...res,
      isMedication: data.categorization === 'Medication' ? true : false,
    }
    this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Services Updated Successfully');
        this.sendOnload.emit('Service');
      }
    })
  }

   // for Rooms update
  showRoomsPopup(data){
    this.getRoomStatuslist();
    this.getFloorsList();
    this.updateRoomsForms(data);
    this.modalRef = this.modalService.show(this.updateRoomsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  }

  updateRoomsForms(data){
    this.updateRoomsForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      floorsId: new FormControl(data.floorsId),
      floors: new FormControl(null),
      roomNumber: new FormControl(data.roomNumber),
      roomName: new FormControl(data.roomName),
      roomsStatusId: new FormControl(data.roomsStatusId),
      roomsStatus: new FormControl(null),
      isActive: new FormControl(data.isActive),
      isBooked: new FormControl(data.isBooked),
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

  updateRoomsList(){
    const payload=this.updateRoomsForm.value;
    this.dataService.post<[]>(`${Modules.SaveUpdateRoom}`,payload).then((res:any)=>{
      if(res.status == 1){
        this.successPopup('Rooms update Successfully')
        this.sendOnload.emit('Room');
      }
      
    })
  }

  // for Beds update

  showBedsPopup(data){
    this.updateBedsForms(data);
    this.getbedStatuslist();
    this.modalRef = this.modalService.show(this.updateBedsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
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

  updateBedsForms(data){
    this.updateBedsForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      roomId: new FormControl(data.roomId),
      rooms: new FormControl(data.rooms),
      badNumber: new FormControl(data.badNumber),
      badName: new FormControl(data.badName),
      isActive: new FormControl(data.isActive),
      isBooked: new FormControl(data.isBooked),
      floorsId: new FormControl(data.floorsId),
      floors: new FormControl(data.floors),
      bedstatusId: new FormControl(data.bedstatusId),
      badsStatus: new FormControl(data.badsStatus),
    });
  }
  
  updateBedsList(){
    const payload=this.updateBedsForm.value;
    this.dataService.post<[]>(`${Modules.SaveUpdateBed}`,payload).then((res:any)=>{
      if(res.status == 1){
        this.successPopup('Beds update Successfully')
        this.sendOnload.emit('Bed');
      }
    })
  }
  //Update User
  showUserPopup(data){
    this.updateUserForm(data);
    this.modalRef = this.modalService.show(this.updateUserPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  }
  updateUserForm(data){
  this.userForm = new FormGroup({
     id:new FormControl(data.id), 
     createdBy:new FormControl(this.setData.id), 
     createdDate:new FormControl(new Date().toLocaleString),
     updatedBy:new FormControl(this.setData.id), 
     updatedDate:new FormControl(new Date()),
     password:new FormControl(''),
     isActive:new FormControl(data.isActive), 
     isDeleted:new FormControl(false), 
     doctor_Code:new FormControl(data.doctor_Code),
     hosp_Code:new FormControl(this.setData.hosp_Code),
     casheir_id:new FormControl(data.casheir_id),
     employee_id:new FormControl(data.employee_id),
     userTypeId:new FormControl(data.userTypeId), 
     userType:new FormControl(null), 
     firstName:new FormControl(data.firstName),
     lastName:new FormControl(data.lastName),
     username:new FormControl(data.username)
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
      this.userTypeList=resp
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
    const payload = this.userForm.value;
    this.dataService.post(`${Modules.addUser}`,payload).then(()=>{
      this.sendOnload.emit('Users');
      this.modalRef.hide();
    });
  }
  }
  // Booked slots
  showBookedSlotsPopup(data){
    this.updateBookedSlotsForm(data);
    this.getDoctorBySpeciality(data?.specialities?.speciality_Code);
    this.modalRef = this.modalService.show(this.updateBookedSlotsPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  };

  updateBookedSlotsForm(data){
    this.bookedSlotsForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date().toISOString()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date().toISOString()),
      startTime: new FormControl(new Date(data.startTime)),
      endTime: new FormControl(new Date(data?.endTime)),
      speciality_Code: new FormControl(data?.specialities?.speciality_Code),
      doctor_Code: new FormControl(data?.doctors?.doctor_Code),
      hosp_Code: new FormControl(this.setData.hosp_Code),
      isActive: new FormControl(data?.isActive),
    });
  };
  addBookedSlots(){
    const res = this.bookedSlotsForm.value;
    const payload ={
      ...res,
      startTime:new Date(res.startTime).toLocaleString(),
      endTime:new Date(res.endTime).toLocaleString(),
    }
    this.dataService.post(`${Modules.specialtyBookingSlots}`,payload).then((res)=>{
      if(res.status == 1){
       this.sendOnload.emit('BookedSlots');
       this.modalRef.hide();
       this.successPopup('Booking Slots update Successfully');
      }
    });
  }

  getDoctorBySpeciality(event: any) {
    if (event) {
      const getUserData = JSON.parse(sessionStorage.User);
      const selectedSpeciality = this.specialityList.find(d => d.speciality_Code === event);
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
  showConsumablePopup(data){
    this.createConsumableList(data);
    this.modalRef = this.modalService.show(this.upadteConsumablePopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup speciallity-update-popup' });
  };
  createConsumableList(data) {
    this.consumableForm = new FormGroup({
      id: new FormControl(data.id),
      createdBy: new FormControl(this.setData.id),
      createdDate: new FormControl(new Date()),
      updatedBy: new FormControl(this.setData.id),
      updatedDate: new FormControl(new Date()),
      code: new FormControl(data.code),
      name: new FormControl(data.name),
      defaultPrice: new FormControl(data.defaultPrice),
      categorization: new FormControl("Consumables"),
      unit: new FormControl(data.unit),
      arabicName: new FormControl(''),
      isMedication: new FormControl(false),
      isConsumables: new FormControl(true),
      isActive:new FormControl(data.isActive)
    });
  };
  updateConsumableList() {
    const payload = this.consumableForm.value;
    this.dataService.post<[]>(`${Modules.addServices}`, payload).then((res: any) => {
      if (res.status == 1) {
        this.successPopup('Consumables Updated Successfully');
        this.sendOnload.emit('Consumables');
      };
    });
  };
}
