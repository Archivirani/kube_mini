import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { FixedRoutes } from '@urls';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderComponent } from './order.component';
import { InvoiceGeneratorComponent } from './invoice-generator/invoice-generator.component';
import { InvoiceHistoryPopupComponent } from './invoice-history-popup/invoice-history-popup.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReciptPopupComponent } from './recipt-popup/recipt-popup.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { PaymentServiceComponent } from './payment-service/payment-service.component';
import { PaymentHeaderComponent } from './payment-header/payment-header.component';
import { PaymentRequestFormComponent } from './payment-request-form/payment-request-form.component';
import { BsModalService } from 'ngx-bootstrap/modal';

const route: Routes = [
  { path: '', component: OrderComponent },
  { path: FixedRoutes.OrderDetails, component: OrderDetailsComponent },
  { path: FixedRoutes.paymentHeader, component: PaymentHeaderComponent },
]
@NgModule({
  declarations: [
    OrderComponent,
    OrderDetailsComponent,
    InvoiceGeneratorComponent,
    InvoiceHistoryPopupComponent,
    ReciptPopupComponent,
    PaymentDetailsComponent,
    PaymentServiceComponent,
    PaymentHeaderComponent,
    PaymentRequestFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    RouterModule.forChild(route),
    NgSelectModule,
  ],
  providers:[BsModalService]
})
export class OrderModule { }
