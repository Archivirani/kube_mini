import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '@services/appointment.service';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { User } from '@services/model/user.model';
import { ResourceService } from '@services/resource.service';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'soap-document',
  templateUrl: './soap-document.component.html',
  styleUrls: ['./soap-document.component.scss']
})
export class SoapDocumentComponent implements OnInit{
  public dyForm: FormGroup;
  private _canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private paint: boolean;
  public canvasConfig = { width: 1100, height: 500 };
  public imageConfig = { width: 470.9, height: 458 };
  maxDate: Date= new Date();
  private clickX: number[] = [];
  private clickY: number[] = [];
  private clickDrag: boolean[] = [];
  private submitSubscription: Subscription;
  private lastXposition: number[] = [];
  private lastYposition: number[] = [];
  @Input() Appointment: Appointment;
  @Input() currentActiveTab: string = "";
  private currentNavigatedTabSubscription: Subscription;


  constructor(public documentationService: DocumentationService,
     private clinicService: ClinicService,public dataService: DataService,  private appoinmentService :AppointmentService, private resourceService :ResourceService) {
    this.dyForm = this.createForm();
    if (this.submitSubscription) { }
    this.submitSubscription = this.documentationService.submitEvent.subscribe((resp) => {

    })
    if (this.currentNavigatedTabSubscription) { this.currentNavigatedTabSubscription.unsubscribe() };
    this.currentNavigatedTabSubscription = this.clinicService.currentNavigatedTab.subscribe((resp: any) => {
      if (resp && resp !== 'Documentation' ) {
        if (this.dyForm.touched) {
          Swal.fire({
            title: "Do You really want to save this document?",
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Discard",
            confirmButtonColor: '#3f7473',
            cancelButtonColor: '#e71d36',
            customClass: {
              container: 'notification-popup'
            }
          }).then((result) => {
            if (result.value) {
              this.submitForm(resp);
            } else {
              if (resp.type === "navigation") {
                this.currentActiveTab = resp.data;
                this.clinicService.changeTab.next(resp.data);
              } else if (resp.type === "sub-navigation") {
                this.clinicService.currentSubActiveTab = resp.data;
              }
            }
          });
        } else {
          if (resp.type === "navigation") {
            this.currentActiveTab = resp.data;
            this.clinicService.changeTab.next(resp.data);
          } else if (resp.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = resp.data;
          }
        }
      }
    })
  }

  ngOnInit(): void {
    this.submitSubscription = this.documentationService.submitEvent.subscribe((resp) => {
      if (resp) {
        this.submitForm({ type: 'navigation', data: "Patient-Profile" });
      } else {
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })
  }

  ngAfterViewInit() {
    this.onLoad();
  }
  onLoad() {
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if(canvas){
      canvas.width = this.canvasConfig?.width;
      canvas.height = this.canvasConfig?.height;
    }
    this.redraw();
    this.createUserEvents();
  }



  private createUserEvents() {
    document.getElementById('clear')?.addEventListener('click', this.clearEventHandler);
  }

  private redraw() {
    let clickX = this.clickX;
    let context = this.context;
    let clickDrag = this.clickDrag;
    let clickY = this.clickY;
    for (let i = 0; i < clickX.length; ++i) {
      context.beginPath();
      if (clickDrag[i] && i) {
        context.moveTo(clickX[i - 1], clickY[i - 1]);
      } else {
        context.moveTo(clickX[i] - 1, clickY[i]);
      }

      context.lineTo(clickX[i], clickY[i]);
      context.stroke();
    }
    context?.closePath();
  }

  private addClick(x: number, y: number, dragging: boolean) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.lastXposition.push(x);
    this.lastYposition.push(y);
    this.clickDrag.push(dragging);
  }

  private clearCanvas() {
    this.context.clearRect(0, 0, this._canvas?.width, this._canvas.height);
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.onLoad();
  }

  private clearEventHandler = () => {
    this.clearCanvas();
  };


  private releaseEventHandler = () => {
    this.paint = false;
    this.redraw();
  };

  private cancelEventHandler = () => {
    this.paint = false;
  };
  submitForm(navigationTab?: any) {
    if (this.dyForm.valid) {
      const data = this.dyForm.value;
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const patientData = {
       id: 0,
       createdBy: getData.id,
       createdDate:new Date(),
       updatedBy: getData.id,
       updatedDate:new Date(),
       document_number:'',
       generalInformation:'',
       pationName:'',
       dateOfBirth:this.Appointment?.patient?.dateOfBirth || this.resourceService.currentPatient.dateOfBirth,
       currentMeds: data.CurrentMeds,
       doucumentDate: data.Date,
       subjective: data.Subjective,
       objectiveFindings: data.ObjectiveFindings,
       assessmentGoals: data.AssessmentGoals,
       planOfTreatment: data.PlanOfTreatment,
       patientId: this.Appointment?.patientId || this.resourceService.currentPatient.id,
       status:'',
       appointmentId:this.Appointment?.id,
        documentType :"Soap Note Document",
        doctor_Code:this.Appointment?.doctor_Code || this.Appointment?.specialities?.doctors?.doctor_Code  || this.Appointment.doctor_code
      }

      this.dataService.post(Modules.soapDocument, patientData).then((response) => {
        this.clinicService.changeTab.next("Patient-Profile");
        if (response.status === StatusFlags.Success) {
          if (navigationTab.type === "navigation") {
            this.currentActiveTab = navigationTab.data;
          } else if (navigationTab.type === "sub-navigation") {
            this.clinicService.currentSubActiveTab = navigationTab.data;
          }
        }
      });

    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  createForm(): FormGroup {
    const currentDate = new Date();
    const time = `${currentDate.getHours()}:${currentDate.getMinutes()}`
    return new FormGroup({
      CurrentMeds: new FormControl('', [Validators.required]),
      Date: new FormControl(currentDate),
      Subjective: new FormControl(),
      ObjectiveFindings: new FormControl(),
      AssessmentGoals: new FormControl(),
      PlanOfTreatment: new FormControl(),
    });
  }
}

