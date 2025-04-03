import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit {

  public userType:number;
  
  constructor(public appointmentService: AppointmentService) { 
    const setData= JSON.parse(sessionStorage.getItem('User'))
    this.userType=setData.userTypeId;
  }

  ngOnInit(): void {
  }

}
