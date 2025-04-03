import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FixedRoutes } from '@urls';
import { VoucherComponent } from './voucher.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { CreateVoucherComponent } from './create-voucher/create-voucher.component';
import { VoucherService } from '@services/voucher.service';
import { BsModalService } from 'ngx-bootstrap/modal';

const voucherRoute: Routes = [
  { path: '', component: VoucherComponent },
  { path: FixedRoutes.PatientRegister, component: VoucherComponent },
]


@NgModule({
  declarations: [
    VoucherComponent,
    CreateVoucherComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    RouterModule.forChild(voucherRoute)
  ],
  providers: [VoucherService, BsModalService]
})
export class VoucherModule { }
