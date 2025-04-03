import { Appointment } from "./appointment.model";
import { PatientDocument, Order } from "./clinic.model";
import { VoucherDetails } from "./order.model";

export class Patient {
  medicalRecordNumber: string;
  appointmentDateTime:any;
  firstName: string;
  familyName?: string;
  thirdName?: string;
  secondName?: string;
  mothersName?:string;
  email: string;
  contactNo1: string;
  contactNo2?: string;
  bloodGroup?: string;
  dateOfBirth: any;
  gender?: string;
  identificationNo?: string;
  relativeFirstName?: string;
  relativeLastName?: string;
  relativeGender?: string;
  emergencyContactNo?: string;
  comment?: string;
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  profileUrl?: string;
  isDeleted?: boolean;
  isActive?: boolean;
  isBilled?: boolean;
  isOrdered?: boolean;
  idType?: string;
  patientIdType: any;
  relation?: string;
  patientRelationship: any;
  profileFile?: any;
  appointments: Appointment[];
  orders: Order[];
  id: number;
  nationality: any;
  createdBy?: number;
  createdDate?: string;
  updatedBy?: number;
  updatedDate?: string;
  generalDocument?: PatientGeneralDocument[];
  consultationDocument?: PatientConsultationDocument[];
  faceNeckDocument: FaceNeckDocument[];
  surgeryProcedureDocument: SurgeryProcedureDocument[];
  attachmentDocument: AttachmentDocument[];
  soapNoteDocuments: SoapNoteDocuments[]
  vouchers: VoucherDetails[];
  smokingStatus?: string;
  visitNoteDetailsDocuments?: VisitNoteDocuments[];
  patient: Patient;
  isProvisional:boolean;
  user:User
  job:string  
}
export class User{
username:string
}
export class PatientGeneralDocument {
  title: string;
  type: string;
  dateTime: string;
  physicianId: number;
  physician: string;
  patientId: number;
  patient: string;
  appointmentId: number;
  note: string;
  documentUrl: string;
  isPdfDocument?: boolean;
  doctor_Code?:string
  document_number?:string;

}

export class Floors{
  floorName?:string;
  floornumber?:number;
}
export class Rooms{
  roomName?:string;
  roomNumber?:string;
}
export class Beds{
  badName?:string;
  badNumber?:string;
}
export class PatientConsultationDocument {
  type: string;
  dateTime: string;
  physicianId: number;
  physician: string;
  patientId: number;
  patient: string;
  appointmentId: number;
  summary: string;
  age: number;
  gender: string;
  mainComplaint: string;
  breathingDifficulty: string;
  priorSurgeries: string;
  priorComplications: string;
  bloodDisorders: string;
  allergies: string;
  examination: string;
  endonasalExamination: string;
  psychIssues: string;
  smoking: string;
  priorAnesthesia: boolean;
  priorAnesthesiaSummery: string;
}

export class FaceNeckDocument {
  type: string;
  dateTime: string;;
  physicianId: string;
  physician: string;
  patientId: string;
  patient: string;
  appointmentId: string;
  summary: string;
  age: number;
  gender: string;
  mainComplaint: string;
  priorSurgeries: string;
  priorComplications: string;
  priorTreatments: string;
  filterLocation: string;
  threadLocation: string;
  permanentFillers: boolean;
  permanentFillersLocation: string;
  priorNeckLiposuction: boolean;
  energyDevice: boolean;
  bloodThinners: boolean;
  bloodThinnerType: string;
  allergies: string;
  priorAnesthesia: boolean;
  priorAnesthesiaSummary: string;
  hypertension: boolean;
  hypertensionMeds: string;
  hypertensionManagingDoctor: string;
  documentDm: boolean;
  documentDmMeds: string;
  documentDmLastHeg: string;
  documentDmMangingDoctor: string;
  documentCad: string;
  documentCadLastEcho: string;
  psychIssues: string;
  psychIssuesMeds: string;
  historyOf: string;
  examination: string;
  photoEvaluationWithPatient: string;
  patientSpecificConcernAndRequest: string;
  surgicalPlan: string;
}

export class SurgeryProcedureDocument {
  id: number;
  type: string;
  physicianId: number;
  physician: string;
  patientId: number;
  appointmentId: number;
  documentUrl: string;
  dateTime: string;
  preOperativeDiagnosis: string;
  postOperativeDiagnosis: string;
  operation: string;
  operationIndications: string;
  operationNote: string;
  document_number?:string;
}

export class AttachmentDocument {
  id: number;
  type: string;
  dateTime: string;
  physicianId: number;
  patientId: number;
  appointmentId: number;
  documentUrl: string;
  isPdfDocument: boolean;
  note: string;
  patientDocuments:patientDocuments;
  document_number?:string;
}
export class patientDocuments{
  doctorDode?:string
}
export class SoapNoteDocuments {
  appointmentId: string;
  assessmentGoals: string;
  createdBy: string;
  createdDate: string;
  currentMeds: string;
  dateOfBirth: string;
  doctor_Code: string;
  document_number: string;
  doucumentDate: string;
  generalInformation: string;
  id: number;
  objectiveFindings: string;
  patientDocuments: {}
  patientId: string;
  pationName: string;
  planOfTreatment: string;
  subjective: string;
  updatedBy: number;
  updatedDate: string;
}
export class VisitNoteDocuments {
  id: number;
  createdBy: string;
  updatedBy: string;
  updatedDate: string;
  visitNoteGeneralId: number;
  visitNoteGeneralDocuments: {}
  visitNoteStatus: string;
  diagnosisCode: number;
  doctor_Code: string;
  patientId: string;
  appointmentId: string;
  document_number: number;
  documentType: string;
}
