import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EmergencyPatientComponent } from './emergency-patient.component';
import { FixedRoutes } from '@urls';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdmitpatientPopupComponent } from './admitpatient-popup/admitpatient-popup.component';
import { EmergencyPatientDetailComponent } from './emergency-patient-detail/emergency-patient-detail.component';
import { EmergencyServicesComponent } from './emergency-services/emergency-services.component';
import { SharedModule } from '@shared/shared.module';
import { createServicesComponent } from './create-services/create-services.component';
import { ErRequestFormComponent } from './er-request-form/er-request-form.component';
import { NgxBarcodeModule } from 'ngx-barcode';
const route: Routes = [
  { path: '', component: EmergencyPatientComponent },
  { path: FixedRoutes.ErPatient, component: EmergencyPatientComponent },
  { path: FixedRoutes.Erpatientdetails, component: EmergencyPatientDetailComponent },
]

@NgModule({
  declarations: [EmergencyPatientComponent, AdmitpatientPopupComponent, EmergencyPatientDetailComponent, EmergencyServicesComponent, createServicesComponent, ErRequestFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    NgSelectModule,
    FormsModule,
    SharedModule,
    NgxBarcodeModule
  ],
  providers: [BsModalService]
})
export class EmergencyPatientModule {


}
