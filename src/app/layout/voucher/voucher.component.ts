import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Options } from '@services/model/option.model';
import { VoucherService } from '@services/voucher.service';
import { CreateVoucherComponent } from './create-voucher/create-voucher.component';
import { Modules } from '@urls';
import { Patient } from '@services/model/patient.model';
import { VoucherStatus } from '@services/enum/voucher.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements OnInit {
  public dyForm: FormGroup;
  public status: Options[] = [{ key: "1", value: "New" }, { key: "2", value: "Used" }]
  public patientData: Patient;
  public minLenthError: any;
  public imageUrl: string = '';
  public voucherData: [];

  public voucherStatus = VoucherStatus;
  private closeSubscription: Subscription;

  @ViewChild('voucherPopUp') voucherPopUp: CreateVoucherComponent;
  constructor(private voucherService: VoucherService) {
    this.imageUrl = `${Modules.Images}${sessionStorage.TenantCode}/Images/`;
  }

  ngOnInit(): void {
    this.dyForm = this.generateForm();
  }

  generateForm(): FormGroup {
    return new FormGroup({
      patientId: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      patient: new FormControl(),
      dateTime: new FormControl(),
      voucherNumber: new FormControl(),
      voucherValue: new FormControl(),
      status: new FormControl()
    });
  }

  getVouchersById() {
    this.dyForm.markAllAsTouched();
    if (this.dyForm.get('patientId').valid) {
      this.voucherService.getVoucherByPatientId(this.dyForm.controls.patientId.value).subscribe((res) => {
        this.patientData = res ? res.data[0] : null;
      });
    }
  }

  openDialog(data: any) {
    this.dyForm.markAllAsTouched();
    if (this.dyForm.valid) {
      this.voucherPopUp.showPopup(data.id);
      if (this.closeSubscription) { this.closeSubscription.unsubscribe(); };
      this.closeSubscription = this.voucherPopUp.onclose.subscribe((resp) => {
        if (resp) {
          this.getVouchersById();
        }
      });
    }
  }
}
