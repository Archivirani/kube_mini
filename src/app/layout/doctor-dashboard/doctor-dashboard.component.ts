import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Appointment, AppointmentCounts, AppointmentIsClinic, AppointmentStatus } from '@services/model/appointment.model';
import { BookAppointmentPopupComponent } from '@shared/component/book-appointment-popup/book-appointment-popup.component';
import { ReasonPopupComponent } from '@shared/component/reason-popup/reason-popup.component';
import { appointmentPieChartData, conversionChartData } from '../dashboard/charts';
import { ChartService } from '../dashboard/chart.service';
import { Subscription } from 'rxjs';
import { SystemCount } from '@services/model/system.count.model';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent{
 public viewOfChart: any = [{ Value: 'Day' }, { Value: 'Month' }, { Value: 'Week' }, { Value: 'Year' }];
public selectedChart: string = 'Day';
public currentDate = new Date();
public todayAppointments: Appointment[] = [];
public appointmentCount = 0;
public patientStatus = AppointmentStatus;
public fromDay: string = "";
public today: string = "";
@Input() class = '';
@Input() control = true;
@Input() chartClass = 'dashboard-donut-chart';

@ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;
@ViewChild('reasonPopup') reasonPopup: ReasonPopupComponent;

chartDataConfig: ChartService;
areaChartData = conversionChartData;
appointmentChart: any = appointmentPieChartData;
confirmSubscription: Subscription;
appointmentStatus = AppointmentStatus;
systemCounts: SystemCount = { appointments: 0, inClinic: 0, patients: 0, revenue: 0, inBasket: 0 };
public isIPadAir = false;

@HostListener('window:load', ['$event'])
@HostListener('window:resize', ['$event'])
onResizeEvent() {
  window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
}
constructor(public dataService: DataService, private chartService: ChartService) {
  window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  this.chartDataConfig = this.chartService;
}

getAppointmentToday(date: Date) {
  this.todayAppointments = [];
  let getData = JSON.parse(sessionStorage.getItem('User'));
  this.dataService.getData<Appointment[]>(`${Modules.ByDateAndDoctCode}?date=${formatDate(date, "MM-dd-YYYY", "en-Us")}&Hosp_Code=${getData.hosp_Code}&Doctor_Code=${getData.doctor_Code}`).then((response:any) => {
  // this.dataService.getData<Appointment[]>(`${Modules.AppointmentByDate}/${formatDate(date, "YYYY-MM-ddTHH:mm:ss", "en-Us")}`).then((response) => {
    this.onLoad(date);
    this.onloadAppointmentCount('Day', date);
    if (response && response.length) {
      response.forEach((element) => { element.patient.profileUrl = !!element.patient.profileUrl ? `${Modules.Images}${sessionStorage.TenantCode}/Images/${element.patient.profileUrl}` : "" }); this.todayAppointments = response;
    }
  });
}

onLoad(date: Date): void {
  const setData = JSON.parse(sessionStorage.getItem('User'))
  this.dataService.getData<SystemCount>(`${Modules.SystemCount}?date=${formatDate(date, "YYYY-MM-ddTHH:mm:ss", "en-Us")}&Hosp_Code=${setData.hosp_Code}&UserId=${setData.id}`).then((data) => { this.systemCounts = {}; if (data) { this.systemCounts = data; } });
}

onStatusChange(item: any) {
  if(item.patient.isProvisional){
    Swal.fire({
      title: 'Please Complete Patient Registration Process',
      icon: 'warning',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Ok",
      confirmButtonColor: '#3f7473',
      customClass: {
        container: 'notification-popup'
      }
    })
  }else{
    const setData=JSON.parse(sessionStorage.getItem('User'))
    this.dataService.postData<AppointmentIsClinic>(Modules.AppointmentPatientInClinic, { id: item.id, appointmentStatus: AppointmentStatus.CheckedIn,Updateby:setData.id, DateTime: new Date().toLocaleString() }).then(() => this.getAppointmentToday(this.currentDate));
  }  
}

onCancel(data: Appointment) {
  this.reasonPopup.showPopup(data);
  this.reasonPopup.onClose.subscribe((resp) => {
    this.dataService.postData<Appointment>(Modules.AppointmentCancel, {...resp}).then(() => this.getAppointmentToday(this.currentDate));
  })
}

openBookAppointment(data: Appointment): void {
  this.bookAppointment.showPopup(data);
}

onloadAppointmentCount(data: string, date?: Date) {
  this.fromDay = "";
  this.today = "";
  switch (data) {
    case 'Day':
      this.fromDay = `${formatDate(date, "YYYY-MM-dd", "en-Us")}T00:00:00`;
      this.today = `${formatDate(date, "YYYY-MM-dd", "en-Us")}T00:00:00`;
      break;
    case 'Week':
      this.fromDay = `${formatDate(new Date(new Date().setDate(new Date().getDate() - 7)), "YYYY-MM-dd", "en-Us")}T00:00:00`;
      this.today = `${formatDate(new Date(), "YYYY-MM-dd", "en-Us")}T00:00:00`;
      break;
    case 'Month':
      this.fromDay = `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)), "YYYY-MM-dd", "en-Us")}T00:00:00`;
      this.today = `${formatDate(new Date(), "YYYY-MM-dd", "en-Us")}T00:00:00`;
      break;
    case 'Year':
      this.fromDay = `${formatDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), "YYYY-MM-dd", "en-Us")}T00:00:00`;
      this.today = `${formatDate(new Date(), "YYYY-MM-dd", "en-Us")}T00:00:00`;
      break;
  }
  if (!!this.fromDay && !!this.today) { this.onLoadAppointmentsDiagram(this.fromDay, this.today) }
}

onLoadAppointmentsDiagram(startDate: string, endDate: string) {
  this.dataService.postData<AppointmentCounts>(Modules.AppointmentCounts, { startDate: startDate, endDate: endDate }).then((response) => {
    if (response) {
      const percentageData: number[] = [];
      this.appointmentCount = response.cancelled + response.checkedIn + response.planned + response.notShow;
      response.cancelled = this.getPercentage(this.appointmentCount, response.cancelled);
      response.checkedIn = this.getPercentage(this.appointmentCount, response.checkedIn);
      response.planned = this.getPercentage(this.appointmentCount, response.planned);
      response.notShow = this.getPercentage(this.appointmentCount, response.notShow);
      response.closedEncounter = this.getPercentage(this.appointmentCount, response.closedEncounter);
      Object.keys(response).forEach((resp) => { percentageData.push(response[resp]); });
      appointmentPieChartData.datasets.forEach(element => { element.data = percentageData });
      this.appointmentChart = { ...appointmentPieChartData };
    }
  });
}

// onDownloadFile(){
//   this.dataService.downloadFile(`${Modules.DownloadAppoinmentList}`, { startDate: this.fromDay, endDate: this.today }, "hello.xlsx")
// }

getPercentage(total: number, value: number): number {
  return (value * 100) / total;
}
}
