import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { SharedModule } from "@shared/shared.module";
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// import { AreaChartComponent } from '../dashboard/area-chart/area-chart.component';
// import { DoughnutChartComponent } from '../dashboard/doughnut-chart/doughnut-chart.component';
import { DoctorHeaderComponent } from './doctor-header/doctor-header.component';

const route: Routes = [
  { path: '', component: DoctorDashboardComponent},
];

@NgModule({
    declarations: [DoctorDashboardComponent, DoctorHeaderComponent],
    imports: [
        CommonModule,RouterModule.forChild(route),SharedModule, NgSelectModule, FormsModule, BsDatepickerModule.forRoot()
    ]
})
export class DoctorDashboardModule { }
