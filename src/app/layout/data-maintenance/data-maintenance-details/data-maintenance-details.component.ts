import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';

@Component({
  selector: 'data-maintenance-details',
  templateUrl: './data-maintenance-details.component.html',
  styleUrls: ['./data-maintenance-details.component.scss']
})
export class DataMaintenanceDetailsComponent implements OnInit {
  public userType:number;
  constructor(public appointmentService: AppointmentService) { 
    const setData= JSON.parse(sessionStorage.getItem('User'))
    this.userType=setData.userTypeId;
  }

  ngOnInit(): void {


  }



}
