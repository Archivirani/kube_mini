import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService } from '@services/model/clinic.model';
import { StatusFlags } from '@services/model/data.service.model';
import { EditCommentPopupComponent } from '@shared/component/edit-comment-popup/edit-comment-popup.component';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'create-clinic-order',
  templateUrl: './create-clinic-order.component.html',
  styleUrls: ['./create-clinic-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateClinicOrderComponent implements OnDestroy {
  public currency: string = environment.currency;
  public createClinicForm: FormGroup;
  public orderSetSubscription: Subscription;

  @ViewChild('editCommentPopup') editCommentPopup: EditCommentPopupComponent;
  @Input() Appointment: Appointment;

  @Input() set customData(data: OrderService[]) {
    this.createClinicForm = new FormGroup({ orderServices: new FormArray([]) });
    if (data && data.length) {
      data.forEach((data) => {
        (this.createClinicForm.get('orderServices') as FormArray).push(this.createForm(data));
      });
    }
  };

  @Output() deleteData: EventEmitter<any> = new EventEmitter<any>();

  constructor(public clinicService: ClinicService, private dataService: DataService, private changeDetectorRef: ChangeDetectorRef) {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    this.orderSetSubscription = this.clinicService.orderSet.subscribe((resp) => {
      if (resp) {
        if (this.createClinicForm.valid) {
          const order = {
            ...this.createClinicForm.value,
            dateTime: new Date(),
            physicianId: this.Appointment.physicianId,
            patientId: this.Appointment.patientId,
            appointmentId: this.Appointment.id
          };
          this.dataService.post<any>(Modules.CreateOrder, order).then((response) => {
            if (response.status === StatusFlags.Success) {
              this.clinicService.clearData();
              this.clinicService.changeTab.next("Patient-Profile");
            }
          });
        }
      } else {
        this.clinicService.clearData();
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })

  }

  ngOnInit(): void {
    //this.subscribeToChange();
  }

  subscribeToChange(index: number) {
    const frmArray = this.createClinicForm.get('orderServices') as FormArray;
    frmArray.valueChanges.subscribe(
      result => {
        this.changeDetectorRef.detectChanges();
        result.forEach(d => { d.isNotEdit ? false : true });

        this.clinicService.clinicOrderDetails[index].price = result[index].price;
        this.clinicService.clinicOrderDetails[index].defaultPrice = result[index].price;

        this.clinicService.clinicOrderDetails[index].quantity = result[index].quantity;
        this.clinicService.clinicOrderDetails[index].discount = result[index].discount;
      }
    );
  }

  createForm(data: any): FormGroup {
    return new FormGroup({
      id: new FormControl(0),
      dateTime: new FormControl(new Date(new Date().toLocaleString())),
      DesiredDate: new FormControl(new Date().toLocaleDateString()),
      DesiredTime: new FormControl(new Date().toLocaleTimeString()),
      name: new FormControl(data.name),
      quantity: new FormControl(data.quantity ? data.quantity : 1, [Validators.min(1)]),
      price: new FormControl(data.defaultPrice),
      discount: new FormControl(data.discount ? data.discount : 0, [Validators.max(100)]),
      comment: new FormControl(data.comment),
      serviceId: new FormControl(data.type === "Services" ? data.serviceId ? data.serviceId : data.id : 0),
      consultationId: new FormControl(data.type === "Consultation" ? data.consultationId ? data.consultationId : data.id : 0),
      order: new FormControl(data.order),
      type: new FormControl(data.type),
      isNotEdit: new FormControl(true),
    })
  };

  editItem(index: number) {
    this.createClinicForm.get('orderServices')['controls'][index].patchValue({ isNotEdit: false });
    this.subscribeToChange(index);
  }

  editComment(data: any, index: number) {
    this.editCommentPopup.showPopup({ ...data, index: index });
    this.editCommentPopup.onClose.subscribe((resp: any) => {
      this.createClinicForm.get('orderServices')['controls'][resp.data.index].get('comment').setValue(resp.comment);
      this.clinicService.clinicOrderDetails[resp.data.index].comment = resp.comment;
    });
  }

  deleteItem(data: OrderService) {
    this.deleteData.emit(data);
  }

  ngOnDestroy(): void {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
  }
}
