import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { Order, OrderService } from '@services/model/clinic.model';
import { Patient } from '@services/model/patient.model';
import { Modules } from '@urls';

@Component({
  selector: 'clinic-services',
  templateUrl: './clinic-services.component.html',
  styleUrls: ['./clinic-services.component.scss']
})
export class ClinicServicesComponent implements OnInit {
  public appointmentDetails: Appointment;
  @Input() set Appointment(data: Appointment) {
    this.appointmentDetails = data;
  };
  serviceModel: string;
  consultationModel: string;

  public isIPadAir = false;
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }
  constructor(public clinicService: ClinicService, private dataService: DataService) {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.clinicService.clinicOrderDetails = [];
    this.clinicService.getServiceData();
  }
  ngOnInit(): void {
    this.onRouting();
  }

  onRouting(): void {
    this.dataService.getData<Patient[]>(Modules.PatientByAppointment, `${this.appointmentDetails.id}`).then((response) => {
      if (response && response.length) {
        response[0].orders.forEach((order: Order) => {
          if (order.orderServices && order.orderServices.length) {
            order.orderServices.forEach((orderService: OrderService) => {
              orderService.defaultPrice = orderService.price;
              setTimeout(() => {
                if (orderService.serviceId !== 0) {
                  orderService.type = "Services";
                  orderService.isSelected = true;
                  let clinicData = this.clinicService.clinicServices.find(d => d.id === orderService.serviceId);
                  if (clinicData) { clinicData.isSelected = true; };
                  this.clinicService.onInsertOrder(orderService);
                }
                if (orderService.consultationId !== 0) {
                  orderService.type = "Consultation";
                  orderService.isSelected = true;
                  let consultationData = this.clinicService.clinicConsultation.find(d => d.id === orderService.consultationId);
                  if (consultationData) { consultationData.isSelected = true; }
                  this.clinicService.onInsertOrder(orderService);
                }
              }, 1000);
            });
          }
        })
      }
    });
  }

}
