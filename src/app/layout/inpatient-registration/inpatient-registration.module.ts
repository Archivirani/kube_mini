import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InpatientRegistrationComponent } from './inpatient-registration.component';
import { RouterModule, Routes } from '@angular/router';
import { FixedRoutes } from '@urls';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

const route: Routes = [
  { path: '', component: InpatientRegistrationComponent },
  { path: FixedRoutes.InpatientRegistration, component: InpatientRegistrationComponent },
]

@NgModule({
  declarations: [InpatientRegistrationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    ReactiveFormsModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
  ]
})
export class InpatientRegistrationModule { }
