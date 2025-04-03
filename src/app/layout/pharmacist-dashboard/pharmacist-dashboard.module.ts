import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacistDashboardComponent } from './pharmacist-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '@shared/shared.module';
// import { AreaChartComponent } from '../dashboard/area-chart/area-chart.component';
// import { DoughnutChartComponent } from '../dashboard/doughnut-chart/doughnut-chart.component';
import { PharmacistHeaderComponent } from './pharmacist-header/pharmacist-header.component';

const route: Routes = [
  { path: '', component: PharmacistDashboardComponent},
];

@NgModule({
  declarations: [PharmacistDashboardComponent, PharmacistHeaderComponent],
  imports: [
    CommonModule,RouterModule.forChild(route),NgSelectModule, FormsModule, BsDatepickerModule.forRoot(),SharedModule
  ]
})
export class PharmacistDashboardModule { }
