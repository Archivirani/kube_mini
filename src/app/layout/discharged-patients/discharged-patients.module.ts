import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DischargedPatientsComponent } from './discharged-patients.component';
import { FixedRoutes } from '@urls';
import { EditDischargePopupComponent } from './edit-discharge-popup/edit-discharge-popup.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';

const route: Routes = [
  { path: '', component: DischargedPatientsComponent },
  { path: FixedRoutes.DischargedPatients, component: DischargedPatientsComponent },
  { path: FixedRoutes.EditdischargePopup, component: EditDischargePopupComponent },
];

@NgModule({
  declarations: [DischargedPatientsComponent, EditDischargePopupComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
  ],
  providers:[BsModalService, GlobalSearchFilter]
})
export class DischargedPatientsModule { }
