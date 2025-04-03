import { Component, OnInit, ViewChild } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { UpdateConfigurationlistComponent } from '../update-configurationlist/update-configurationlist.component';
import { AddConfigurationlistComponent } from '../add-configurationlist/add-configurationlist.component';
import Swal from 'sweetalert2';
import { ConversationTableComponent } from '../conversation-table/conversation-table.component';
import { Subscription } from 'rxjs';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { ResourceService } from '@services/resource.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'data-maintenance-table',
  templateUrl: './data-maintenance-table.component.html',
  styleUrls: ['./data-maintenance-table.component.scss'],
})
export class DataMaintenanceTableComponent implements OnInit {
  public specialtyList: any[] = [];
  public roomsList:any[]=[];
  public doctorsList: any[] = [];
  public floorsList: any[] = [];
  public userList: any[] = [];
  public bookedSlots: any[] = [];
  public consumables: any[] = [];
  public bedList: any[] = [];
  public setData: any;
  public serviceData: any;
  public medicationData: any[] = [];
  public userType:number;
  public selectedEvent:any;
  private specialityListBackup:any;
  public bookingSlotsData: any[]=[];
  public getCategoryList: any;
  public allServicesByCategoryList: any;
  public subcategoryList: any;
  private doctorsData:any;
  public searchSubscription:Subscription;
  public category:any;
  public subcategory:any;
  bookingSlotsList: any;
  floorsData: any;
  roomsData: any;
  bedsData: any;
  serviceList: any;
  medicationlist: any;
  userData:any;
  consumablesData:any;
  @ViewChild('updatePopup') updatePopup: UpdateConfigurationlistComponent;
  @ViewChild('addPopup') addPopup: AddConfigurationlistComponent;
  @ViewChild('conversationTable')conversationTable:ConversationTableComponent;
  
  constructor(public appointmentService: AppointmentService, private dataService: DataService,private globalSearch:GlobalSearchFilter, private resourceService: ResourceService) {
    this.setData = JSON.parse(sessionStorage.getItem('User'))
    this.userType=this.setData.userTypeId;
    this.appointmentService.isEvent.subscribe((res) => {
      let data = res.target.innerText;
      this.selectedEvent=res.target.innerText;
      const selectedItem = this.appointmentService.conigurationlist.find(item => item.name === data);
      if (selectedItem) {
        selectedItem.isSelected = !selectedItem.isSelected;
        this.appointmentService.conigurationlist.filter(item => item !== selectedItem).forEach(item => item.isSelected = false);
      }
      if (data == 'Specialties') {
        this.floorsList = [];
        this.doctorsList = [];
        this.bedList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.roomsList = [];
        this.bookedSlots=[];
        this.consumables=[];
        this.userList=[];
        this.getSpecialityList();
      }
      else if (data == 'Doctors') {
        this.specialtyList = [];
        this.floorsList = [];
        this.bedList = [];
        this.roomsList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.userList=[];
        this.bookedSlots=[];
        this.consumables=[];
        this.getDoctorslist();
      }
      else if (data == 'Floors') {
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.roomsList = [];
        this.userList=[];
        this.bookedSlots=[];
        this.consumables=[];
        this.getFloorsList();
      }
      else if (data == 'Beds') {
        this.doctorsList = [];
        this.specialtyList = [];
        this.floorsList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.roomsList = [];
        this.userList=[];
        this.bookedSlots=[];
        this.consumables=[];
        this.getAllBedsList();
      }
      else if (data == 'Services') {
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.floorsList = [];
        this.medicationData = [];
        this.roomsList = [];
        this.userList=[];
        this.bookedSlots=[];
        this.consumables=[];
        this.getServices();
      }
      else if (data == 'Medications') {
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.floorsList = [];
        this.serviceData = [];
        this.roomsList = [];
        this.userList=[];
        this.bookedSlots=[];
        this.consumables=[];
        this.getMedicationList();
      }else if (data == 'Rooms') {
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.floorsList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.userList=[];
        this.bookedSlots=[];
        this.consumables=[];
        this.getAllRoomsList();
      }else if(data == 'Users'){
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.floorsList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.roomsList = [];
        this.bookedSlots=[];
        this.consumables=[];
        this.getUserList();
      }
      else if(data == 'Booking Slots'){
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.floorsList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.roomsList = [];
        this.userList=[];
        this.consumables=[];
        this.getBookingSlots();
      }
      else if(data == 'Consumables'){
        this.doctorsList = [];
        this.specialtyList = [];
        this.bedList = [];
        this.floorsList = [];
        this.serviceData = [];
        this.medicationData = [];
        this.roomsList = [];
        this.userList=[];
        this.bookedSlots=[];
        this.getConsumables();
      }
    });

    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      if(this.selectedEvent == 'Specialties'){
        const fieldnames=["speciality_desc","speciality_Code","active"]
        this.specialtyList = this.globalSearch.transform(this.specialityListBackup, res, fieldnames);
      }
      else if(this.selectedEvent == 'Doctors'){
       const fieldLists=["doctor_Code","doctor_Name","specialities.speciality_desc","active"]
       this.doctorsList = this.globalSearch.transform(this.doctorsData, res, fieldLists);
      }
      else if(this.selectedEvent == 'Floors'){
      const fieldlist=["floornumber","floorName","isActive"]
      this.floorsList = this.globalSearch.transform(this.floorsData, res, fieldlist);
      }
      else if(this.selectedEvent == 'Rooms'){
        const fields=["roomName","roomNumber","floors.floornumber","floors.floorName","isActive"]
        this.roomsList = this.globalSearch.transform(this.roomsData, res, fields);
      }
      else if(this.selectedEvent == 'Beds'){
        const Fields=["badNumber","badsStatus.status","rooms.roomName","rooms.roomNumber","floors.floornumber","floors.floorName","badName","isActive"]
        this.bedList = this.globalSearch.transform(this.bedsData, res, Fields);
      }
      else if(this.selectedEvent == 'Services'){
        const field=["name","categorization","subcategories","arabicName","unit","defaultPrice","isActive"]
        this.allServicesByCategoryList = this.globalSearch.transform(this.serviceList, res, field);
      }
      else if(this.selectedEvent == 'Medications'){
        const fieldNames = ["name","unit","defaultPrice","isActive"];
        this.medicationData = this.globalSearch.transform(this.medicationlist, res, fieldNames);
      }
      else if(this.selectedEvent == 'Users'){
        const field=["userType.name","username","employee_id","loginname","isActive"]
        this.userList = this.globalSearch.transform(this.userData, res, field);
      }
    else if(this.selectedEvent == 'Booking Slots'){
      const field=["specialities?.speciality_desc","doctors?.doctor_Name","startTime","isActive"]
      this.bookedSlots = this.globalSearch.transform(this.bookingSlotsList, res, field);
    }
    });
  }

  ngOnInit(): void {
    this.getCaterogy();
  }

  onUpdateSpeciality(data: any) {
    this.updatePopup.showSpecialityPopup(data);
  }

  addSpecialityList() {
    this.addPopup.showAddSpecialityPopup();
  }
  onDownloadSpeciality() {
    this.dataService.downloadFile(
      `${Modules.specialtyDownload}?Hosp_Code=${this.setData.hosp_Code}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  addDoctorList() {
    this.addPopup.showAddDoctorsPopup();
  }
  addRoomList(){
    this.addPopup.showRoomsPopup()
  }
  getUserList(){
    this.dataService.getData(`${Modules.getUserList}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any)=>{
      this.userList=resp;
      this.userData=resp;
    });
  }
  onUsersDownload(){
    this.dataService.downloadFile(
      `${Modules.usersDownload}?Hosp_Code=${this.setData.hosp_Code}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  getSpecialityList() {
    this.dataService.getData(`${Modules.getSpeciality}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.specialtyList = resp;
      this.specialityListBackup=resp;
    });
  }
  getSingleSpeciality(event) {
    this.dataService.getData(`${Modules.getSpeciality}?Hosp_code=${this.setData.hosp_Code}&Speciality_Code=${event.speciality_Code}`).then((resp: any) => {
    });
  }

  getDoctorslist() {
    this.dataService.getData(`${Modules.getAttendingPhysician}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.doctorsList = resp;
      this.doctorsData=resp;
    });
  }
  onDoctorDownload(){
    this.dataService.downloadFile(
      `${Modules.doctorsDownload}?Hosp_Code=${this.setData.hosp_Code}&Specialitycode=${''}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }

  getFloorsList() {
    this.dataService.getData(`${Modules.getAllFloorsList}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.floorsList = resp;
      this.floorsData=resp;
    });
  }
  onFloorDownload(){
    this.dataService.downloadFile(
      `${Modules.floorsDownload}?Hosp_Code=${this.setData.hosp_Code}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  getAllRoomsList(){
    this.dataService.getData(`${Modules.GetAllRooms}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.roomsList = resp;
      this.roomsData=resp;
    });
  }
  onRoomDownload(){
    this.dataService.downloadFile(
      `${Modules.roomDownload}?Hosp_Code=${this.setData.hosp_Code}&FloorsId=${0}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  getAllBedsList(){
    this.dataService.getData(`${Modules.getAllBedsList}?Hosp_code=${this.setData.hosp_Code}`).then((resp: any) => {
      this.bedList = resp;
      this.bedsData=resp;
    });
  }
  onBedsDownload(){
    this.dataService.downloadFile(
      `${Modules.bedsDownload}?Hosp_Code=${this.setData.hosp_Code}&FloorsId=${0}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  getMedicationList(event?) {
    this.dataService.getData(`${Modules.getMedicationList}?${event === undefined ? '' : event}`).then((res: any) => {
      this.medicationData = res;
      this.medicationlist=res;
    });
  }
  onMedicationDownload(){
    this.dataService.downloadFile(
      `${Modules.medicationsDownload}?Hosp_Code=${this.setData.hosp_Code}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }

  getServices() {
      this.dataService.getData(`${Modules.getAllServices}`).then((res: any) => {
      this.serviceData = res;

    });
  }
  getAllServices() {
    this.dataService.getData(`${Modules.selectAllServicesByCategory}?Category=${this.category}&SubCategory=${this.subcategory}`).then((res) => {
      this.allServicesByCategoryList = res;
      this.serviceList=res;
    });
  }
  getCaterogy(){
    this.dataService.getData(`${Modules.getCategorization}`).then((res) => {
      this.getCategoryList = res;
    });
  }

  subcategories(event){
    this.subcategory = '';
    const data = this.getCategoryList.find(d => d.category === event).subCategory;
    this.subcategoryList = data;
    this.dataService.getData(`${Modules.selectAllServicesByCategory}?Category=${this.category}`).then((res) => {
      this.allServicesByCategoryList = res;
      this.serviceList=res;
    });
  }
  onServiceDownload(){
    this.dataService.downloadFile(
      `${Modules.serviceDownload}?Hosp_Code=${this.setData.hosp_Code}&Category=${this.category}&SubCategory=${this.subcategory}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  getBookingSlots(){
    this.dataService.getData(`${Modules.getSpecialtyBookingSlots}?Hosp_code=${this.setData.hosp_Code}`).then((res: any) => {
      this.bookedSlots = res;
      this.bookingSlotsList = res;
    });
  }
  onBookingSlotsDownload(){
    this.dataService.downloadFile(
      `${Modules.bookingSlotsDownload}?Hosp_Code=${this.setData.hosp_Code}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
    );
  }
  getConsumables(){
    this.dataService.getData(`${Modules.getConsumables}`).then((res : any) => {
      this.consumablesData = res;
      this.consumables = res;
    });
  }

  onUpdateMedication(data: any) {
    this.updatePopup.showMedicationpopup(data);
  }

  onConversationTab(data){
    this.conversationTable.showTable(data);
  }
  addFloorList() {
    this.addPopup.showAddFloorPopup();
  }

  addMedicationList() {
    this.addPopup.showaddMedicationPopup();
  }

  addServicesList() {
    this.addPopup.showAddServicespopup();
  }
  addBedList(){
    this.addPopup.showBedPopup();
  }
  addUserList(){
    this.addPopup.showUserPopup();
  }
  addBookedSlotsList(){
    this.addPopup.showBookedSlotsPopup();
  }
  addConsumables(){
    this.addPopup.showConsumablesPopup();
  }
  onUpdatedoctor(data) {
    this.updatePopup.showDoctorPopup(data)
  }

  onUpdateFloor(data) {
    this.updatePopup.showFloorPopup(data);
  }

  onUpdateServices(data) {
    this.updatePopup.showServicespopup(data);
  }
  onUpdateBeds(data){
    this.updatePopup.showBedsPopup(data);
  }

  onUpdateRoom(data){
    this.updatePopup.showRoomsPopup(data);
  }
  onUpdateUser(data){
    this.updatePopup.showUserPopup(data)
  }
  onUpdateBookedSlots(data){
    this.updatePopup.showBookedSlotsPopup(data);
  }
  onUpdateConsumable(data){
    this.updatePopup.showConsumablePopup(data);
  }
  getOutput(data){
    if(data == 'Specialties'){
      this.getSpecialityList()
    }
    else if(data == 'Doctor'){
      this.getDoctorslist()
    }
    else if(data == 'Floor'){
      this.getFloorsList()
    }
    else if(data == 'Medication'){
      this.getMedicationList()
    }
    else if(data == 'Service'){
      this.getAllServices()
    }
    else if(data == 'Room'){
      this.getAllRoomsList()
    }
    else if(data == 'Users'){
      this.getUserList()
    }
    else if(data == 'Bed'){
      this.getAllBedsList()
    }
    else if(data == 'BookedSlots'){
      this.getBookingSlots();
    }
    else if(data == 'Consumables'){
      this.getConsumables();
    }
  }

  deleteSpecialtyBookingSlots(data:any){
    const value = {
      "id": data.id,
      "createdBy": data.createdBy,
      "createdDate": data.createdDate,
      "updatedBy": data.updatedBy,
      "updatedDate": data.updatedDate,
      "startTime": data.startTime,
      "endTime": data.endTime,
      "speciality_Code": data.speciality_Code,
      "doctor_Code": data.doctor_Code,
      "hosp_Code": data.hosp_Code,
      "isActive":false,
    } 
    this.dataService.postData(`${Modules.deleteSpecialtyBookingSlots}` ,value).then((res: any) => {
    this.getBookingSlots();
    });
  }

  ngOnDestroy(){
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
  }
}
