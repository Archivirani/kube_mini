import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppointmentService } from '@services/appointment.service';
import { ClinicService } from '@services/clinic.service';
import { CrudService } from '@services/crud.service';
import { TimeRange } from '@services/enum/time.enum';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes } from '@urls';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PatientDataFilterPopupComponent } from '../patient-data-filter-popup/patient-data-filter-popup.component';
import { Appointment } from '@services/model/appointment.model';
import { Router } from '@angular/router';
// import { Subscription } from 'rxjs';

@Component({
  selector: 'layout-panel-header',
  templateUrl: './layout-panel-header.component.html',
  styleUrls: ['./layout-panel-header.component.scss'],
  providers: [BsModalService]
})
export class LayoutPanelHeaderComponent {
  public routerLink = FixedRoutes;
  public isIPadAir = false;
  public isSelected = false;
  public modalRef: BsModalRef;
  public searchDataForm: FormGroup;
  @ViewChild('datePicker') datePicker: BsDatepickerDirective;
  @ViewChild('filterPopup') filterPopup: PatientDataFilterPopupComponent;
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }
  constructor(private modalService: BsModalService, public resourceService: ResourceService, public crudService: CrudService, private router: Router, public clinicService: ClinicService, public appointmentService: AppointmentService) {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }


  onAgeTransformation(date: Date): string {
    const currentDate = new Date();
    const birthDate = new Date(date);

    let ageDiff = currentDate.getTime() - birthDate.getTime();
    let ageDate = new Date(ageDiff); 
    let years = ageDate.getUTCFullYear() - 1970;

    if (years > 1) {
      return `${years} year(s)`;
    }
    let months = ageDate.getUTCMonth();
    if (years < 1) {
    if (months < 1) {
    let days = ageDate.getUTCDate() - 1;
      return `${days} Day(s)`;
    }
    return `${months} month(s)`;
    }
    return `${years} year(s)`;
  }

  onChangeSerchEvent(event: any) {
    const target = event.target.value;
    this.resourceService.searchEvent.next(target);
  }

  getLOSDays(date:Date){
    const currentDate = new Date();
    const admittedDate = new Date(date);

    let LOS = currentDate.getTime() - admittedDate.getTime();
    let LOSDate = new Date(LOS); 
    let days = LOSDate.getUTCDate();
      return `${days}`;
  }

  // showCalander(){
  //   // if(this.appointmentService.defaultView ==TimeRange.Daily){
  //   //   document.getElementById('calDaily').setAttribute("style", "display:block;");
  //   // }
  //   // else{
  //   //   document.getElementById('calWeekly').setAttribute("style", "display:block;");
  //   // }
  //   this.appointmentService.isShowCalender = true;
  //   this.appointmentService.isShowArrow = false;
  //   //document.getElementById('calDaily').setAttribute("style", "display:block;");
  // }


  onShown(event: any) {
    this.datePicker.bsValue = this.appointmentService.currentDate;
    this.datePicker.show();
    this.appointmentService.isCalShown = true;
  }

  onHiddenEvent(isAppoinmentView) {
    if (isAppoinmentView) {
      //this.appointmentService.isShowCalender = false;
      this.appointmentService.isShowArrow = (this.appointmentService.defaultView == TimeRange.Daily);
      //document.getElementById('calDaily').setAttribute("style", "display:none;");
    }
    else {
      // this.resourceService.isShowCalender = false;
      // this.resourceService.isShowArrow =true;
      //document.getElementById('calToday').setAttribute("style", "display:none;");
    }
  }


  // showDatePicker(){
  //   // this.resourceService.isShowCalender = true;
  //   // this.resourceService.isShowArrow = false;
  //   //document.getElementById('calToday').setAttribute("style", "display:block;");
  // }
}
