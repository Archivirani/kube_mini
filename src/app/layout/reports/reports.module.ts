import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportDetailsComponent } from './report-details/report-details.component';
import { ReportTableComponent } from './report-table/report-table.component';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { FixedRoutes } from '@urls';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReportFilterPopupComponent } from './report-filter-popup/report-filter-popup.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';


const route: Routes = [
  { path: '', component: ReportsComponent },
  { path: FixedRoutes.Reports, component: ReportsComponent },
];

@NgModule({
  declarations: [
    ReportDetailsComponent,
    ReportTableComponent,
    ReportsComponent,
    ReportFilterPopupComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    BsDatepickerModule,
    SharedModule
  ],
  providers: [BsModalService, GlobalSearchFilter]
})
export class ReportsModule { }
