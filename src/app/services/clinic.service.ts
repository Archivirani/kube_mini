import { Injectable } from '@angular/core';
import { OrderService } from './model/clinic.model';
import { DataService } from './data.service';
import { FixedRoutes, Modules } from '@urls';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TimeRange } from './enum/time.enum';
@Injectable({ providedIn: 'root' })
export class ClinicService {
  public clinicOrderDetails: OrderService[] = [];
  public clinicServices: OrderService[] = [];
  public clinicConsultation: OrderService[] = [];
  public orderSet: Subject<boolean> = new Subject<boolean>();
  public changeTab: Subject<string> = new Subject<string>();
  private routeSubscription: Subscription;
  public dayOnlyAppointment: boolean = false;
  public dayOnlyAppointmentLabel: string = "";
  public currentNavigatedTab: Subject<any> = new Subject<any>();
  public displayConsultation: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public getAppoinmentId: number;
  checkedradOrdersSearchCount = 0;
  checkedprocedureSearchCount = 0;
  checkedlabOrdersCount = 0;
  public currentSubActiveTab: string = 'Visit-Note';
  public currentDate: Date = new Date();
  public isShowArrow: boolean = false;
  public isCalShown: boolean = false;
  public defaultView: any = TimeRange.Daily;
  public admitPatientEvent: Subject<boolean> = new Subject<boolean>();
  public submitEvent: Subject<boolean> = new Subject<boolean>();
  public serviceModel: string;
  public nextEvent: Subject<boolean> = new Subject<boolean>();
  public prevEvent: Subject<boolean> = new Subject<boolean>();
  public selectedClinicDate: Subject<Date> = new Subject<Date>();

  public onChangeDocTab: Subject<string> = new Subject<string>();

  constructor(private dataService: DataService, public router: Router) {
    this.routeSubscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === `/${FixedRoutes.MyClinic}`) {
          this.isShowArrow = true;
          setTimeout(() => {
            this.dayOnlyAppointment = true;
          }, 500);
        } else {
          this.dayOnlyAppointment = false;
        }
      });
  }

  getServiceData() {
    this.dataService.getData<OrderService[]>(`${Modules.ActiveServices}`).then((response) => {
      if (response && response.length) {
        response.forEach((data: OrderService) => {
          data.isSelected = false;
          data.type = "Services";
          data.serviceId = data.id;
        });
        this.clinicServices = response;
      }
    });
    this.dataService.getData<OrderService[]>(`${Modules.ActiveConsultation}`).then((response) => {
      if (response && response.length) {
        response.forEach((data: OrderService) => {
          data.isSelected = false;
          data.type = "Consultation";
          data.consultationId = data.id;
        });
        this.clinicConsultation = response;
      }
    });
  }

  filterService() {
    let services = this.clinicOrderDetails.filter(d => d.categorization === "Medication" || d.categorization === "Loboratory" || d.categorization === "Radiology");
    return services;
  }
  onInsertOrder(element: OrderService) {
    if (element) {
      if (!this.clinicOrderDetails) {
        this.clinicOrderDetails = [];
      }
      if (element.isSelected) {
        if (this.clinicOrderDetails && !this.clinicOrderDetails.find(d => (d.consultationId === element.id || d.serviceId === element.id || d.id === element.id) && d.type === element.type)) {
          this.clinicOrderDetails.push(element);
        } else {
          const removeAt = this.clinicOrderDetails.findIndex(d => (d.consultationId === element.id || d.serviceId === element.id || d.id === element.id) && d.type === element.type);
          if (removeAt >= 0) {
            this.clinicOrderDetails.splice(removeAt, 1);
          }
        }
      } else {
        const removeAt = this.clinicOrderDetails.findIndex(d => (d.consultationId === element.id || d.serviceId === element.id || d.id === element.id) && d.type === element.type);
        if (removeAt >= 0) {
          this.clinicOrderDetails.splice(removeAt, 1);
        }
      }
      this.clinicOrderDetails = [...this.clinicOrderDetails]
    }
  }

  // onAddCreatedServices(element: OrderService) {
  //   if (element) {
  //     if (!this.clinicOrderDetails) { this.clinicOrderDetails = []; }
  //     this.clinicOrderDetails.push(element);
  //     this.clinicOrderDetails = [...this.clinicOrderDetails]
  //   }
  // }

  deleteData(data: any) {
    let findIndex = -1;
    if (data.type === "Services") {
      findIndex = this.clinicOrderDetails.findIndex(d => d.serviceId === data.serviceId);
      let clinicData = this.clinicServices.find(d => d.id === data.serviceId || d.id === data.consultationId);
      if (clinicData) {
        clinicData.isSelected = false;
      }
    }
    if (data.type === "Consultation") {
      findIndex = this.clinicOrderDetails.findIndex(d => d.consultationId === data.consultationId);
      let consultationData = this.clinicConsultation.find(d => d.id === data.consultationId);
      if (consultationData) {
        consultationData.isSelected = false;
      }
    }
    if (findIndex >= 0) {
      this.clinicOrderDetails.splice(findIndex, 1);
    }
    this.clinicOrderDetails = [...this.clinicOrderDetails]
  }

  clearData() {
    this.clinicOrderDetails = [];
    this.clinicServices.forEach(element => { element.isSelected = false; });
    this.clinicConsultation.forEach(element => { element.isSelected = false; });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
