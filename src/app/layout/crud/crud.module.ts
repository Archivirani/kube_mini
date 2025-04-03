import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FixedRoutes } from '@urls';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddAppointmentDetailsComponent } from './add-appointment-type/add-appointment-details/add-appointment-details.component';
import { AddAppointmentTypeComponent } from './add-appointment-type/add-appointment-type.component';
import { AddConsulationDetailsComponent } from './add-consultation/add-consulation-details/add-consulation-details.component';
import { AddConsultationComponent } from './add-consultation/add-consultation.component';
import { AddPatientDetailsComponent } from './add-patient-type/add-patient-details/add-patient-details.component';
import { AddPatientTypeComponent } from './add-patient-type/add-patient-type.component';
import { AddRelationDetailsComponent } from './add-relation-type/add-relation-details/add-relation-details.component';
import { AddRelationTypeComponent } from './add-relation-type/add-relation-type.component';
import { AddServiceComponent } from './add-service/add-service-detail/add-service.component';
import { AddServiceDetailsComponent } from './add-service/add-service-details.component';
import { CrudComponent } from './crud.component';
const crudRoute: Routes = [
  {
    path: '', redirectTo: FixedRoutes.Service, pathMatch: 'full'

  },
  // { path: FixedRoutes.Service, component: AddServiceDetailsComponent },
  //     { path: FixedRoutes.ServiceRegister, component: AddServiceComponent },
  //     { path: FixedRoutes.ServiceEdit, component: AddServiceComponent },

  //     { path: FixedRoutes.PatientRelations, component: AddRelationDetailsComponent },
  //     { path: FixedRoutes.RegisterRelation, component: AddRelationTypeComponent },
  //     { path: FixedRoutes.RegisterRelationEdit, component: AddRelationTypeComponent },

  //     { path: FixedRoutes.PatientIdTypes, component: AddPatientDetailsComponent },
  //     { path: FixedRoutes.PatientIdRegister, component: AddPatientTypeComponent },
  //     { path: FixedRoutes.PatientIdEdit, component: AddPatientTypeComponent },


  //     { path: FixedRoutes.ConsultationDetails, component: AddConsulationDetailsComponent },
  //     { path: FixedRoutes.Consultation, component: AddConsultationComponent },
  //     { path: FixedRoutes.ConsultationEdit, component: AddConsultationComponent },

  //     { path: FixedRoutes.AppointmentsDetails, component: AddAppointmentDetailsComponent },
  //     { path: FixedRoutes.AppontmentType, component: AddAppointmentTypeComponent },
  //     { path: FixedRoutes.AppointmentEdit, component: AddAppointmentTypeComponent }
]

@NgModule({
  declarations: [
    CrudComponent,
    AddServiceComponent,
    AddAppointmentTypeComponent,
    AddPatientTypeComponent,
    AddRelationTypeComponent,
    AddConsultationComponent,
    AddServiceDetailsComponent,
    AddRelationDetailsComponent,
    AddPatientDetailsComponent,
    AddConsulationDetailsComponent,
    AddAppointmentDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    RouterModule.forChild(crudRoute),
    BsDatepickerModule.forRoot(),
  ]
})
export class CrudModule { }
