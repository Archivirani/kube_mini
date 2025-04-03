import { Patient } from "./patient.model";
import { Physician } from "./physician.model";

export interface Appointment {
  popupname:string,
  appointmentDateTime: string;
  appointmentMinutes: number;
  patientDisease?: string;
  appointmentTypeId?: number;
  appointmentStatus?: number;
  patientAdmission?: patientAdmission;
  physicianId?: number;
  patientId?: number;
  startTime: string;
  endTime: string;
  medicalRecordNumber?: string,
  speciality_Code?: string,
  physician?: Physician;
  patient?: Patient;
  appointmentType?: AppointmentType;
  appointmentDescription: string;
  specialityDetails:Speciality;
  id: number;
  createdBy?: number;
  createdDate?: string;
  updatedBy?: number;
  updatedDate?: string;
  orderId?: number;
  statusColor?: string;
  statusText?: string;
  isExisting?: boolean;
  doctor_Code?:string;
  doctor_code?:string;
  specialities?:specialitiesData
  provisionalMRM?:string
  doctors?:doctors;
  isProvisional?:boolean;
  MedicalRecord?:string;
  comment?:string;
  floors?:any;
  rooms:any;
  bads:any;
  patientName?:any;
}

export interface specialitiesData {
  speciality_desc :string
  doctors?:doctors;
}

export interface AppointmentIsClinic {
  id: number;
  checkIn: boolean;
}
export interface patientAdmission {
  caseType: number;
  admissionStatus: admissionStatus;
  patient: Patient;
  doctors:any
}
export interface Speciality{
  speciality_Code:string;
}
export interface doctors{
  doctor_Name:string;
  doctor_Code?:string;
  specialities?:specialitiesData;
}
export interface admissionStatus {
  status: string
}

export interface AppointmentType {
  id: number;
  name: string;
}

export interface AppointmentCounts {
  planned: number;
  notShow: number;
  checkedIn: number;
  cancelled: number;
  closedEncounter: number;
}

export enum AppointmentStatus {
  Planned = 1,
  NotShow = 2,
  CheckedIn = 3,
  Cancelled = 4,
  ClosedEncounter = 5
}
