import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { PatientDocument } from '@services/model/clinic.model';
import { StatusFlags, eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { CommentPopupComponent } from '@shared/component/comment-popup/comment-popup.component';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';

@Component({
  selector: 'face-reading-document',
  templateUrl: './face-reading-document.component.html',
  styleUrls: ['./face-reading-document.component.scss']
})
export class FaceReadingDocumentComponent implements AfterViewInit, OnDestroy {
  private documentPoints: FaceDocumentPoint[] = [];
  private movingOffset: { x: number; y: number };
  private lastInjectedPoints: FaceDocumentPoint;
  private clickPoints: FaceDocumentPoint;
  private closeSubscription: Subscription;
  private submitEventSubscription: Subscription;
  public isEditable: boolean = true;
  public updateComments: boolean = false;

  // public behavior: { move?: boolean, leftResize?: boolean, topResize?: boolean, rightResize?: boolean, bottomResize?: boolean };
  public behavior: number;
  public canvasConfig = { width: 1100, height: 500 };
  public imageConfig = { width: (this.canvasConfig.width / 3), height: (this.canvasConfig.height / 1.5), xPosition: (this.canvasConfig.width / 2) - ((this.canvasConfig.width / 3) / 2), yPosition: (this.canvasConfig.height / 2) - ((this.canvasConfig.height / 1.5) / 2) };
  public labelConfig = { leftXPosition: 300, leftYPosition: 100, rightXPosition: 750, rightYPosition: 100 };

  @Input() Appointment: Appointment;
  @Input() set documentData(data: PatientDocument) {
    this.documentPoints = data.soapPoints;
    this.isEditable = false
  }
  @ViewChild('canvas') canvas: ElementRef<any>;
  @ViewChild('canvasImage') canvasImage: ElementRef<any>;
  @ViewChild('comment', { static: true }) comment: CommentPopupComponent;

  constructor(private documentationService: DocumentationService, private dataService: DataService, private clinicService: ClinicService) {
    if (this.submitEventSubscription) { this.submitEventSubscription.unsubscribe(); }
    this.submitEventSubscription = this.documentationService.submitEvent.subscribe((resp) => {
      if (resp) {
        if (this.documentPoints && this.documentPoints.length) {
          const payload = {
            type: "SOAP",
            physicianId: (this.Appointment.physician && this.Appointment.physician.id) ? this.Appointment.physician.id : 1,
            patientId: this.Appointment.patient.id,
            appointmentId: this.Appointment.id,
            soapPoints: this.documentPoints
          }
          this.dataService.post<FaceDocumentPoint[]>(Modules.Documentation, payload).then((response) => {
            if (response.status === StatusFlags.Success) {
              this.clinicService.changeTab.next("Patient-Profile");
            }
          });
        } else {
          dataService.notify.next({ key: eMessageType.Error, value: "Please add minimum one observation", icon: eMessageIcon.Error });
        }
      } else {
        this.clinicService.changeTab.next("Patient-Profile");
      }
    })
  }

  ngAfterViewInit(): void { this.onLoad(this.isEditable); }

  onLoad(generateEvents: boolean): void {
    this.labelConfig = { leftXPosition: 300, leftYPosition: 100, rightXPosition: 750, rightYPosition: 100 };
    if (generateEvents) {
      const canvasNative = this.canvas.nativeElement;
      canvasNative.width = this.canvasConfig.width;
      canvasNative.height = this.canvasConfig.height;
      canvasNative.addEventListener("mousedown", (e: any) => this.onMouseDown(e), false);
      canvasNative.addEventListener("mouseup", (e: any) => this.onMouseUp(e), false);
      canvasNative.addEventListener("mousemove", (e: any) => this.onMouseMove(e), false);
      this.canvas.nativeElement = canvasNative;
    }
    this.reRenderPoints();
  }

  onMouseMove(event: any) {
    if (this.lastInjectedPoints) {
      let currentPoint = this.documentPoints.find(d => d.guid === this.lastInjectedPoints.guid);
      if (currentPoint) {
        if (this.behavior === ClickEvent.Move) {
          currentPoint.xpStart = this.lastInjectedPoints.xpStart + (event.offsetX - this.movingOffset.x);
          currentPoint.ypStart = this.lastInjectedPoints.ypStart + (event.offsetY - this.movingOffset.y);
          currentPoint.xpEnd = this.lastInjectedPoints.xpEnd + (event.offsetX - this.movingOffset.x);
          currentPoint.ypEnd = this.lastInjectedPoints.ypEnd + (event.offsetY - this.movingOffset.y);
        }
        else if (this.behavior === ClickEvent.LeftResize) { currentPoint.xpStart = event.offsetX; }
        else if (this.behavior === ClickEvent.RightResize) { currentPoint.xpEnd = event.offsetX; }
        else if (this.behavior === ClickEvent.TopResize) { currentPoint.ypStart = event.offsetY; }
        else if (this.behavior === ClickEvent.BottomResize) { currentPoint.ypEnd = event.offsetY; }
        else {
          this.lastInjectedPoints.xpEnd = event.offsetX;
          this.lastInjectedPoints.ypEnd = event.offsetY;
          currentPoint = this.lastInjectedPoints;
        }
      }
    }
    else {
      for (let box of this.documentPoints) {
        let isSet = false;
        if ((box.xpStart + 2 > event.offsetX && box.xpStart - 2 < event.offsetX) && (box.ypStart + 2 < event.offsetY && box.ypEnd - 2 > event.offsetY)) { event.target.style.cursor = 'w-resize'; isSet = true; this.behavior = ClickEvent.LeftResize; }
        if (!isSet && (box.xpEnd + 2 > event.offsetX && box.xpEnd - 2 < event.offsetX) && (box.ypStart + 2 < event.offsetY && box.ypEnd - 2 > event.offsetY)) { event.target.style.cursor = 'w-resize'; isSet = true; this.behavior = ClickEvent.RightResize; }
        if (!isSet && (box.ypStart + 2 > event.offsetY && box.ypStart - 2 < event.offsetY) && (box.xpStart + 2 < event.offsetX && box.xpEnd - 2 > event.offsetX)) { event.target.style.cursor = 'ns-resize'; isSet = true; this.behavior = ClickEvent.TopResize; }
        if (!isSet && (box.ypEnd + 2 > event.offsetY && box.ypEnd - 2 < event.offsetY) && (box.xpStart + 2 < event.offsetX && box.xpEnd - 2 > event.offsetX)) { event.target.style.cursor = 'ns-resize'; isSet = true; this.behavior = ClickEvent.BottomResize; }
        if (!isSet && event.offsetX > box.xpStart && event.offsetX < box.xpEnd && event.offsetY > box.ypStart && event.offsetY < box.ypEnd) { this.movingOffset = { x: event.offsetX, y: event.offsetY }; event.target.style.cursor = 'move'; isSet = true; this.behavior = ClickEvent.Move; }

        if (!isSet) { event.target.style.cursor = 'auto'; this.clickPoints = null; this.movingOffset = null; } else { this.clickPoints = box; return; }
      }
    }
    this.reRenderPoints();
  }

  onMouseDown(event: any) {
    event.preventDefault();
    if (this.clickPoints) { this.lastInjectedPoints = JSON.parse(JSON.stringify(this.clickPoints)); }
    else {
      this.lastInjectedPoints = { guid: GuidGenerator.newGuid(), xpStart: event.offsetX, ypStart: event.offsetY, xpEnd: event.offsetX, ypEnd: event.offsetY, comment: "" };
      this.documentPoints.push(this.lastInjectedPoints);
      this.behavior = ClickEvent.None;
    }
  }

  onMouseUp(event: any) {
    const existingPoint = this.documentPoints.find(d => d.xpEnd === event.offsetX && d.ypEnd === event.offsetY)
    if (existingPoint) { this.openComment(existingPoint); }
    event.preventDefault();
    this.movingOffset = null;
    this.lastInjectedPoints = null;
    this.behavior = ClickEvent.None;
  }

  // checkExisting(event: any) {
  //   let points: FaceDocumentPoint = { guid: GuidGenerator.newGuid(), xpStart: event.offsetX, ypStart: event.offsetY, xpEnd: event.offsetX, ypEnd: event.offsetY, comment: "" };
  //   if (this.documentPoints && this.documentPoints.length) {
  //     const existingPoint: FaceDocumentPoint = this.documentPoints.find(d => (event.offsetX > d.xpStart && event.offsetX < d.xpEnd && event.offsetY > d.ypStart && event.offsetY < d.ypEnd) || (d.xpEnd === event.offsetX && d.ypEnd === event.offsetY));
  //     if (existingPoint != null) { points = existingPoint; }
  //     // if(existingPoint && (existingPoint.xpEnd === event.offsetX && existingPoint.ypEnd === event.offsetY))
  //     // this.updateComments = true;
  //   }
  //   this.openComment(points);
  //   this.lastInjectedPoints = points;
  // }

  reRenderPoints() {
    const canvasNative = this.canvas.nativeElement;
    let context = canvasNative.getContext('2d');
    context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
    if (this.documentPoints && this.documentPoints.length) {
      this.documentPoints.forEach(points => {
        if (!points.connectedTo) { this.drawSquare(context, points); }
        else { this.drawTextConnection(context, points, this.documentPoints.find(d => d.guid === points.connectedTo)); }
      });
    }
    this.canvas.nativeElement = canvasNative;
  }

  drawSquare(context: any, points: FaceDocumentPoint): void {
    context.beginPath();
    context.rect(points.xpStart, points.ypStart, points.xpEnd - points.xpStart, points.ypEnd - points.ypStart);
    context.stroke();
  }

  drawLine(context: any, x1: number, y1: number, x2: number, y2: number) {
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.stroke();
  }

  drawTextConnection(context: any, points: FaceDocumentPoint, connectedTo: FaceDocumentPoint) {
    context.fillText(points.comment, points.xpStart, points.ypStart);
    if (points.xpStart >= this.canvasConfig.width / 2) {
      this.drawLine(context, points.xpStart, points.ypStart, connectedTo.xpStart, connectedTo.ypStart);
    } else {
      this.drawLine(context, points.xpStart + points.comment.length * 4.5, points.ypStart, connectedTo.xpStart, connectedTo.ypStart);
    }
  }

  openComment(comment: any) {
    this.lastInjectedPoints = null;
    if (this.isEditable) {
      this.comment.showPopup(comment);
      if (this.closeSubscription) { this.closeSubscription.unsubscribe(); };
      this.closeSubscription = this.comment.onClose.subscribe((resp) => {
        this.lastInjectedPoints = null;
        if (resp && resp.data && resp.data.guid) {
          const isExisting = this.documentPoints.find(d => d.guid === resp.data.guid);
          const isExistingIndex = this.documentPoints.findIndex(d => d.guid === resp.data.guid);
          if (isExisting && resp.data.comment) {
            isExisting.comment = resp.data.comment;
            const isExistingComment = this.documentPoints.find(d => d.connectedTo === resp.data.guid);
            if (!isExistingComment) {
              this.documentPoints.push({ ...this.getFacePoints(isExisting), guid: GuidGenerator.newGuid(), connectedTo: resp.data.guid, comment: resp.data.comment });
            } else {
              isExistingComment.comment = resp.data.comment;
            }
          } else {
            this.documentPoints.splice(isExistingIndex, 1);
          }
        }
        this.reRenderPoints();
        this.lastInjectedPoints = null;
      });
    }
  }

  getFacePoints(points: FaceDocumentPoint): FaceDocumentPoint {
    let textPoints: FaceDocumentPoint;
    if (points.xpStart >= this.canvasConfig.width / 2) {
      textPoints = { xpStart: this.labelConfig.rightXPosition, ypStart: this.labelConfig.rightYPosition };
      this.labelConfig.rightYPosition += 30;
    } else {
      textPoints = { xpStart: this.labelConfig.leftXPosition, ypStart: this.labelConfig.leftYPosition };
      this.labelConfig.leftYPosition += 30;
    }
    return textPoints;
  }

  ngOnDestroy(): void {
    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    if (this.submitEventSubscription) { this.submitEventSubscription.unsubscribe(); }
  }
}

export enum ClickEvent {
  None = 0,
  Move = 1,
  LeftResize = 2,
  TopResize = 3,
  RightResize = 4,
  BottomResize = 5
}

export class FaceDocumentPoint {
  xpStart: number;
  ypStart: number;
  xpEnd?: number;
  ypEnd?: number;
  guid?: string;
  comment?: string;
  connectedTo?: string;
}

export class GuidGenerator {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
