import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { AppointmentComponent } from './appointment.component';
import { DailyViewComponent } from './daily-view/daily-view.component';
import { WeeklyViewComponent } from './weekly-view/weekly-view.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

const route: Routes = [
  { path: '', component: AppointmentComponent },
]

@NgModule({
  declarations: [
    AppointmentComponent,
    WeeklyViewComponent,
    DailyViewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(route),
    BsDropdownModule.forRoot(),
    NgSelectModule,
    BsDatepickerModule.forRoot(),
  ],
  exports: [AppointmentComponent]
})
export class AppointmentModule { }
