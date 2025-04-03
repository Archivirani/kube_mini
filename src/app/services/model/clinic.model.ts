import { Appointment } from "./appointment.model";
import { Patient } from "./patient.model";
import { Physician } from "./physician.model";

export interface Order {
  allservicesarePaid?:boolean;
  user: any;
  dateTime: string;
  physicianId: number;
  physician: Physician;
  patientId: number;
  appointmentId: number;
  orderServices: OrderService[];
  isPaid?: boolean;
  id: number;
  createdBy: number;
  createdDate: string;
  updatedBy: any;
  updatedDate: any;
  comment: string;
  payment: {
    paymentDetails: PaymentDetails[];
  }
  patient?: Patient;
  caseTypesTbl:any;
  visitId:number;
  patientRoomsAssigned?:any;
  appointment:Appointment;
  categorization :any;
}

export interface PaymentDetails {
  paymentType: string,
  amount: number,
  comment: string,
  paymentId: number,
  id: number,
  createdBy: number,
  createdDate: string,
  updatedBy: string,
  updatedDate: string
}
export interface OrderService {
  id: number;
  name: string;
  number:number;
  price: number;
  dateTime: string;
  discount: number;
  quantity: number;
  comment: any;
  serviceId: number;
  consultationId: number;
  orderId: number;
  code: string;
  categorization: string;
  defaultPrice?: number;
  isSelected?: boolean;
  type?: string;
  formatDateTime?: Date;
  unit?: string;
  desiredDate?:string;
  desiredTime?: string;
  isPaid?:boolean;
}


export interface PatientDocument {
  Type: string;
  documentDate: string | number | Date;
  name: string;
  status: string;
  dateTime: string;
  physicianId: number;
  physician: Physician;
  patientId: number;
  appointmentId: any;
  id: number;
  createdBy: number;
  createdDate: string;
  updatedBy: any;
  updatedDate: any;
  type: string;
  soapPoints: PatientDocumentPreview[];
}
export interface PatientDocumentPreview {
  id: number;
  title: string;
  comment: string;
  xpStart: number;
  ypStart: number;
  xpEnd: number;
  ypEnd: number;
  documentId: number;
}

// export enum caseTypesTbl{
//   InPatient = 1,
//   OutPatient = 2,
//   ERPatient = 3,
//   DayCase = 4
// }