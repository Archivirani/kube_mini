import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdmittedPatientComponent } from './admitted-patient.component';
import { FixedRoutes } from '@urls';
import { AdmittedPatientDetailsComponent } from './admitted-patient-details/admitted-patient-details.component';
import { PatientServicesComponent } from './patient-services/patient-services.component';
import { SharedModule } from '@shared/shared.module';
import { CreateServicesComponent } from './patient-services/create-services/create-services.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdmittedpatientEditpopupComponent } from './patient-services/admittedpatient-editpopup/admittedpatient-editpopup.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DischargePopupComponent } from './patient-services/discharge-popup/discharge-popup.component';
import { TransferpatientPopupComponent } from './patient-services/transferpatient-popup/transferpatient-popup.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { AdmitpatientRequestFormComponent } from './patient-services/admitpatient-request-form/admitpatient-request-form.component';
import { NgxBarcodeModule } from 'ngx-barcode';
const route: Routes = [
  { path: '', component: AdmittedPatientComponent },
  { path: FixedRoutes.AdmittedpatientDetails, component: AdmittedPatientDetailsComponent },
];

@NgModule({
  declarations: [AdmittedPatientComponent, PatientServicesComponent, AdmittedPatientDetailsComponent, CreateServicesComponent, AdmittedpatientEditpopupComponent, DischargePopupComponent, TransferpatientPopupComponent, AdmitpatientRequestFormComponent,],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    TimepickerModule.forRoot(),
    NgxBarcodeModule
  ],
  providers:[BsModalService]

})
export class AdmittedPatientModule {


}
