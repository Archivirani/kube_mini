import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FixedRoutes } from '@urls';
import { PharmacyComponent } from './pharmacy.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchFilterPipe } from '@shared/pipes/search.pipe';
import { PharmacyServiceComponent } from './pharmacy-service/pharmacy-service.component';
import { PharmacyDetailsComponent } from './pharmacy-details/pharmacy-details.component';
import { SharedModule } from '@shared/shared.module';
import { PharmacyRequestFormComponent } from './pharmacy-request-form/pharmacy-request-form.component';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';

const route: Routes = [
  { path: '', component: PharmacyComponent },
  { path: FixedRoutes.Pharmacy, component: PharmacyComponent },
  {path:FixedRoutes.PharmacyDetails,component:PharmacyDetailsComponent}
];

@NgModule({
  declarations: [PharmacyComponent ,SearchFilterPipe, PharmacyServiceComponent, PharmacyDetailsComponent, PharmacyRequestFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers:[BsModalService, GlobalSearchFilter]
})
export class PharmacyModule { }
