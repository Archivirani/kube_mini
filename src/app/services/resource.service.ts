import { Injectable, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { FixedRoutes } from '@urls';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Beds, Floors, Patient, Rooms } from './model/patient.model';
import { AppointmentService } from './appointment.service';
import { AddService } from './model/AddService.model';

@Injectable({ providedIn: 'root' })
export class ResourceService implements OnDestroy {
  public currentPageConfig: PageConfiguration = {};
  private routeSubscription: Subscription;
  public currentPatient: Patient;
  public currentPatientData: any;
  public currentFloors: Floors;
  public currentRooms: Rooms;
  public currentBeds: Beds;
  public currentSpecialities: any;
  public dayOnlyAppointment: boolean = false;
  public dayOnlyAppointmentLabel: string = '';
  public submitEvent: Subject<boolean> = new Subject();
  public cancelEvent: Subject<boolean> = new Subject();
  public filterEvent: Subject<boolean> = new Subject();
  public getSelectedPatient: any;
  public totalRecords: Subject<number> = new Subject();
  public totalRecordss: number;

  public searchQuerySubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  getSearchQuery(): Observable<string> {
    return this.searchQuerySubject.asObservable();
  }

  public nextEvent: Subject<boolean> = new Subject<boolean>();
  public prevEvent: Subject<boolean> = new Subject<boolean>();
  public activeTabSubject = new BehaviorSubject<string>('Services');
  public activeTab$ = this.activeTabSubject.asObservable();
  public searchText: string = '';
  public searchEvent: Subject<string> = new Subject<string>();
  //public isShowCalender: boolean = false;
  public clinicDate: Date = new Date();
  public paymentDate: Date = new Date();
  public admittedPatientDate: Date = new Date();
  public DisschargedPatientDate: Date = new Date();
  public ErPatientDate: Date = new Date();
  public selectedClinicDate: Subject<Date> = new Subject<Date>();
  //public isShowArrow: boolean = true;
  private totalCountSubscription: Subscription;
  constructor(
    private title: Title,
    public router: Router,
    private appointmentService: AppointmentService
  ) {
    this.routeSubscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.applyPageConfiguration(this.router.url);
        this.title.setTitle(this.currentPageConfig.mainHeader);
        this.currentPatient = null;
      });
  }
  private manageTotalCountSubscription(): void {
    if (this.totalCountSubscription) {
      this.totalCountSubscription.unsubscribe();
    }
    this.totalCountSubscription = this.totalRecords.subscribe((res: number) => {
      this.totalRecordss = res;
    });
  }
  applyPageConfiguration(url: string) {
    this.currentPageConfig = { cancelButtonTitle: 'Cancel', isHeaderDisplay: true, isPatientAppointment: false, isDashboard: false, doctordashboar: false, PharmacistDashboard: false, isPatientHeader: false, isSearchField: false, isAdmittedPatientButton: false, isAdmitButton: false };
    this.dayOnlyAppointment = false;
    this.searchText = '';
    switch (url) {

      case `/${FixedRoutes.Patient}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Patients - المرضى',
          saveButtonTitle: 'Search',
          saveButtonIcon: 'assets/images/Search-Icon.svg',
          routerLink: `${FixedRoutes.Patient}/${FixedRoutes.PatientRegister}`,
          isSearchField: true,
        };
        break;

      case `/${FixedRoutes.Patient}/${FixedRoutes.PatientRegister}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Register a Patient - تسجيل المريض',
          saveButtonTitle: 'Save Patient',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Patient}/${FixedRoutes.PatientEdit}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Edit Patient - تعديل بيانات المريض',
          saveButtonTitle: 'Update Patient',
          cancelButtonTitle: 'Close',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.InpatientRegistration}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isHeaderDisplay: true,
          mainHeader: 'Admit Patient',
        };
        break;

      case `/${FixedRoutes.Appointment}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Appointments - المواعيد',
          saveButtonIcon: 'assets/images/note-add.svg',
          saveButtonTitle: 'Book Appointment',
          isPatientAppointmentTitle: 'Patient Appointments',
          isPatientAppointment: true,
          isSaveButton: true,
          isSearchField: true,
          isAdmittedPatientButton: true,
          admitButtonIcon: "assets/images/filter.svg"
        };
        break;

      case `/${FixedRoutes.Dashboard}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isDashboard: true,
          isHeaderDisplay: false,
          mainHeader: 'Dashboard',
        };
        break;

      case `/${FixedRoutes.DoctorDashboard}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          doctordashboar: true,
          isHeaderDisplay: false,
          mainHeader: 'DoctorDashboard',
        };
        break;

      case `/${FixedRoutes.PharmacistDashboard}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          PharmacistDashboard: true,
          isHeaderDisplay: false,
          mainHeader: 'PharmacistDashboard',
        };
        break;

      case `/${FixedRoutes.MyClinic}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'OP Clinics - العيادات الخارجية',
          saveButtonTitle: 'Appointments',
          isAppointment: true,
          isSearchField: true
        };
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.Pharmacy}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Pharmacy',
          saveButtonTitle: 'Search for a Patient',
          isAppointment: true,
          isSearchField: true
        };
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.ErPatient}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          // saveButtonTitle: 'Search',
          mainHeader: 'Emergency Patients',
          isAdmittedPatientButton: true,
          AdmitButtonTitle: 'Create an ER Visit',
          // isAppointment: true,
          isSearchField: true,
          // isAdmitButton: true,
          isSaveButton: true,
          saveButtonIcon: "assets/images/filter.svg",
        }
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.Radiology}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          saveButtonTitle: 'Search For a Patient',
          mainHeader: 'Radiology OP Orders',
          isAppointment: true,
        }
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.Admittedpatient}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Admitted Patients',
          isAdmittedPatientButton: true,
          AdmitButtonTitle: 'Admit a Patient',
          isSearchField: true,
          isAdmitButton: true,
          isSaveButton: true,
          isDownButton: true,
          saveButtonIcon: "assets/images/filter.svg"
        }
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.DischargedPatients}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Discharged Patients',
          isDownButton: true,
          isSearchField: true,
          isSaveButton: true,
          isAdmittedPatientButton: false,
          saveButtonIcon: "assets/images/filter.svg"
        }
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.Order}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isHeaderDisplay: true,
          mainHeader: 'Payments - المدفوعات',
          isSearchField: true,
          isDownButton: true,
          isSaveButton: true,
          saveButtonIcon: "assets/images/filter.svg",
          isAdmittedPatientButton: true,
          AdmitButtonTitle: 'Search for a Patient'
        };
        this.dayOnlyAppointment = true;
        break;

      case `/${FixedRoutes.ErPatient}/${FixedRoutes.Erpatientdetails}`:
      case `/${FixedRoutes.Admittedpatient}/${FixedRoutes.AdmittedpatientDetails}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isAdmitPatientheader: true,
        };
        break;

      case `/${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`: {
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isPaymentHeader: true,
        };
      }
        break;

      case `/${FixedRoutes.Radiology}/${FixedRoutes.RadiologyDetails}`:
      case `/${FixedRoutes.Order}/${FixedRoutes.paymentHeader}`:
      case `/${FixedRoutes.laboratory}/${FixedRoutes.laboratoryDetails}`:
      case `/${FixedRoutes.Pharmacy}/${FixedRoutes.PharmacyDetails}`:
      case `/${FixedRoutes.MyClinic}/${FixedRoutes.MyClinicDetails}`: {
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isOPPatientheader: true,
        };
      }
        break;

      case `/${FixedRoutes.Datamaintenance}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isHeaderDisplay: true,
          mainHeader: 'Hospital Data Maintenance',
        };
        break;

      case `/${FixedRoutes.Reports}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isHeaderDisplay: true,
          mainHeader: 'Reports',
        };
        break;

      case `/${FixedRoutes.Voucher}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          isHeaderDisplay: true,
          mainHeader: 'Voucher Details - تفاصيل القسيمة',
        };
        break;

      // case `${FixedRoutes.Crud}/${FixedRoutes.Service}`:
      //   this.currentPageConfig = {
      //     ...this.currentPageConfig,
      //     // serviceButtonTitle:'Service',
      //     // consultationButtonTitle:'Consultation',
      //     // appointmentButtonTitle:'Appointment',
      //     // patientIdButtonTitle:'Patient Id',
      //     // relationshipTypeButtonTitle:'Relation Type',
      //     // mainHeader: 'Services ',
      //     saveButtonTitle: 'Register a Service',
      //     saveButtonIcon: "assets/images/patient.svg",
      //     routerLink: `${FixedRoutes.Crud}`
      //   }
      //   break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.Service}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          saveButtonTitle: 'Register a Service - تسجيل الخدمة',
          saveButtonIcon: 'assets/images/patient.svg',
          routerLink: `${FixedRoutes.Settings}/${FixedRoutes.ServiceRegister}`,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.ServiceRegister}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Service - الخدمة',
          saveButtonTitle: 'Save Service',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.ServiceEdit}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Edit Service - تحرير الخدمة',
          saveButtonTitle: 'Update Service  ',
          cancelButtonTitle: 'Close',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.AppointmentsDetails}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          saveButtonTitle: 'Register an Appointment Type - تسجيل نوع الموعد',
          saveButtonIcon: 'assets/images/patient.svg',
          routerLink: `${FixedRoutes.Settings}/${FixedRoutes.AppontmentType}`,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.AppontmentType}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Appointment Type - نوع الموعد',
          saveButtonTitle: 'Save Appointment Type',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.AppointmentEdit}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Edit Appointment - تحرير الموعد',
          saveButtonTitle: 'Update Appointment  ',
          cancelButtonTitle: 'Close',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.ConsultationDetails}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          saveButtonTitle: 'Register a Consultation - تسجيل الاستشارة',
          saveButtonIcon: 'assets/images/patient.svg',
          routerLink: `${FixedRoutes.Settings}/${FixedRoutes.Consultation}`,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.Consultation}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Consultation - الاستشارة',
          saveButtonTitle: 'Save Consultation',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.ConsultationEdit}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Edit Consulation - تحرير الاستشارة',
          saveButtonTitle: 'Update Consulation  ',
          cancelButtonTitle: 'Close',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.PatientIdTypes}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          saveButtonTitle: 'Register a Patient Id',
          saveButtonIcon: 'assets/images/patient.svg',
          routerLink: `${FixedRoutes.Settings}/${FixedRoutes.PatientIdRegister}`,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.PatientIdRegister}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Patient Id - رقم المريض',
          saveButtonTitle: 'Save Patient Id',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.PatientIdEdit}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Edit Patient Id - تحرير رقم المريض ',
          saveButtonTitle: 'Update PatientId  ',
          cancelButtonTitle: 'Close',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.PatientRelations}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          saveButtonTitle: 'Register Relation Type',
          // mainHeader: 'Relation-Type Details',
          saveButtonIcon: 'assets/images/patient.svg',
          routerLink: `${FixedRoutes.Settings}/${FixedRoutes.RegisterRelation}`,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.RegisterRelation}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Relation Type - نوع العلاقة',
          saveButtonTitle: 'Save Relation Type',
          isCancelButton: true,
          isSaveButton: true,
        };
        break;

      case `/${FixedRoutes.Settings}/${FixedRoutes.RegisterRelationEdit}`:
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Edit Realation Type - تحرير نوع العلاقة',
          saveButtonTitle: 'Update Realation Type',
          cancelButtonTitle: 'Close',
          isCancelButton: true,
          isSaveButton: true,
        };

      case `/${FixedRoutes.laboratory}`:
        this.manageTotalCountSubscription();
        this.currentPageConfig = {
          ...this.currentPageConfig,
          mainHeader: 'Laboratory OP Orders List',
          saveButtonTitle: 'Search For A Patient',
          isAppointment: true,
        }
        this.dayOnlyAppointment = true;
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.totalCountSubscription) {
      this.totalCountSubscription.unsubscribe();
    }
  }
}

export class PageConfiguration {
  isHeaderDisplay?: boolean;
  isPatientHeader?: boolean;
  isDashboard?: boolean;
  doctordashboar?: boolean;
  PharmacistDashboard?: boolean;
  mainHeader?: string;
  nextHeader?: String;
  saveButtonTitle?: string;
  AdmitButtonTitle?: string;
  admitButtonIcon?: string;
  saveButtonIcon?: string;
  cancelButtonTitle?: string;
  cancelButtonIcon?: string;
  serviceButtonIcon?: string;
  consultationButtonIcon?: string;
  appointmentButtonIcon?: string;
  patientIdButtonIcon?: string;
  relationshipTypeButtonIcon?: string;
  routerLink?: string;
  isPatientAppointment?: boolean;
  isPatientAppointmentTitle?: string;
  isAppointment?: boolean;
  isSaveButton?: boolean;
  isCancelButton?: boolean;
  isSearchField?: boolean;
  isAdmitButton?: boolean;
  serviceButtonTitle?: String
  consultationButtonTitle?: String
  appointmentButtonTitle?: String
  patientIdButtonTitle?: String
  relationshipTypeButtonTitle?: String;
  isAdmittedPatientButton?: boolean;
  isDownButton?: boolean;
  isAdmitPatientheader?: boolean;
  isOPPatientheader?: boolean;
  isPaymentHeader?: boolean;
}
