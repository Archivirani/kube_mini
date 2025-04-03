import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { FixedRoutes } from '@urls';
import { LayoutComponent } from './layout.component';
import { ClinicService } from '@services/clinic.service';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { CrudService } from '@services/crud.service';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: FixedRoutes.Dashboard, loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule) },
      { path: FixedRoutes.Patient, loadChildren: () => import('./patient/patient.module').then((m) => m.PatientModule) },
      { path: FixedRoutes.Appointment, loadChildren: () => import('./appointment/appointment.module').then((m) => m.AppointmentModule) },
      { path: FixedRoutes.MyClinic, loadChildren: () => import('./my-clinic/my-clinic.module').then((m) => m.MyClinicModule) },
      { path: FixedRoutes.Order, loadChildren: () => import('./order/order.module').then((m) => m.OrderModule) },
      { path: FixedRoutes.Voucher, loadChildren: () => import('./voucher/voucher.module').then((m) => m.VoucherModule) },
      { path: FixedRoutes.DoctorDashboard, loadChildren: () => import('./doctor-dashboard/doctor-dashboard.module').then((m) => m.DoctorDashboardModule) },
      { path: FixedRoutes.PharmacistDashboard, loadChildren: () => import('./pharmacist-dashboard/pharmacist-dashboard.module').then((m) => m.PharmacistDashboardModule) },
      { path: FixedRoutes.InpatientRegistration, loadChildren: () => import('./inpatient-registration/inpatient-registration.module').then((m) => m.InpatientRegistrationModule) },
      { path: FixedRoutes.Admittedpatient, loadChildren: () => import('./admitted-patient/admitted-patient.module').then((m) => m.AdmittedPatientModule) },
      { path: FixedRoutes.DischargedPatients, loadChildren: () => import('./discharged-patients/discharged-patients.module').then((m) => m.DischargedPatientsModule) },
      { path: FixedRoutes.ErPatient, loadChildren: () => import('./emergency-patient/emergency-patient.module').then((m) => m.EmergencyPatientModule) },
      // { path: FixedRoutes.Settings, loadChildren: () => import('./crud/crud.module').then((m) => m.CrudModule) }
      { path: FixedRoutes.Datamaintenance, loadChildren:() => import('./data-maintenance/data-maintenance.module').then((m) => m.DataMaintenanceModule) },
      { path: FixedRoutes.Reports, loadChildren:() => import('./reports/reports.module').then((m) => m.ReportsModule) },
      { path: FixedRoutes.Pharmacy, loadChildren:() => import('./pharmacy/pharmacy.module').then((m) => m.PharmacyModule) },
      { path: FixedRoutes.Radiology, loadChildren:() => import('./radiology/radiology.module').then((m) => m.RadiologyModule) },
      {path:FixedRoutes.laboratory, loadChildren:()=> import('./laboratory/laboratory.module').then((m)=>m.LaboratoryModule)}
    ]
  }
];
@NgModule({
  declarations: [LayoutComponent, SearchBarComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  providers: [ClinicService, CrudService]
})
export class LayoutModule { }
