import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FixedRoutes } from '@urls';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TimeRange } from './enum/time.enum';
import { Options } from './model/option.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService implements OnDestroy {
  public routeSubscription: Subscription;
  public dayOnlyAppointment: boolean = false;
  public floatingDayAppointment: boolean = false;
  public dayOnlyAppointmentLabel: string = "";
  public isShowArrow: boolean = false;
  //public isShowCalender: boolean = false;
  public conigurationlist:any[]=[{name:'Specialties',isSelected:false,id:1},{name:'Doctors',isSelected:false,id:2},{name:'Floors',isSelected:false,id:3},{name:'Rooms',isSelected:false,id:4},{name:'Beds',isSelected:false,id:5},{name:'Services',isSelected:false,id:6},{name:'Medications',isSelected:false,id:7},{name:'Users',isSelected:false,id:8},{name:'Booking Slots',isSelected:false,id:9}];

  // for the report list
  public reportsList : any[] = [
    {name:'Registered Patients',isSelected:false,id:1},
    {name:'Admitted Patients',isSelected:false,id:2},
    {name:'ER Patients',isSelected:false,id:3},
    {name:'Discharged Patients',isSelected:false,id:4},
    {name:'Invoices',isSelected:false,id:5},
    {name:'Laboratory Orders',isSelected:false,id:6},
    {name:'Radiology Orders',isSelected:false,id:7},
    {name:'Appointments',isSelected:false,id:8},
    {name:'User Authority Log',isSelected:false,id:9}
  ];

  public currentDate: Date = new Date();
  public defaultView: any = TimeRange.Daily;
  public appointmentView: Options[] = [{ value: TimeRange.Daily, key: "1" }, { value: TimeRange.Weekly, key: "7" }];
  public selectedView: Subject<string> = new Subject<string>();

  public selectedDate: Subject<Date[]> = new Subject<Date[]>();
  public downloadAppointment: Subject<boolean> = new Subject<boolean>();

  public nextEvent: Subject<boolean> = new Subject<boolean>();
  public prevEvent: Subject<boolean> = new Subject<boolean>();
  public submitEvent: Subject<boolean> = new Subject<boolean>();
  public isEvent:Subject<any>=new Subject<any>();
  public selectedAppoinmentDate: Subject<Date> = new Subject<Date>();
  public isCalShown: boolean = false;
  constructor(public router: Router) {
    this.routeSubscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {

        if (this.router.url === `/${FixedRoutes.Appointment}`) {
          this.isShowArrow = false;
          setTimeout(() => {
            this.dayOnlyAppointment = true;
          },);
        } else {
          this.dayOnlyAppointment = false;
        }
      });

  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


}
