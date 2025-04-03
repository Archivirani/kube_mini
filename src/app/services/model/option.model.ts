export class OptionsTransfer {
  enumType?: string;
  tableName?: string;
  keyField?: string;
  valueField?: string;
  cascadeBy?: string;
  cascadeValue?: string;
  storeId?: boolean;
  options?: Options[];
}

export class Options {
  key: string;
  value: string;
  icon?: string;
}

export class PatientRelationship {
  id: number;
  name: string;
}
export class PatientType {
  id: number;
  name: string;
}
export class Consultation {
  id:number;
  code: number;
  name: string;
  defaultPrice: string;
}

export class AppointmentType {
  id: number;
  name: string;
}


export enum EnumTypes {
  BloodGroup = ' BloodGroup',
  Gender = 'Gender',
  PriorTreatment = 'PriorTreatment',
  FilterLocation = 'FilterLocation',
  ThreadLocation = 'ThreadLocation',
  SmokingStatus  = 'SmokingStatus'
}

export enum TableNames {
  Patient = 'Patient',
  Physician = 'Physician',
  PatientIdType = 'PatientIdType',
  AppointmentType = 'AppointmentType',
  PatientRelationship = 'PatientRelationship',
}

export enum FieldNames {
  Id = 'Id',
  Name = 'Name',
}

export enum AccessDetials {
  MasterAccess = 1,
  AdminAccess = 2,
  NursingAccess = 3,
  DoctorDashboard = 5,
  PharmacistDashboard = 6,
  Cashier = 11,
  OPDoctor = 12,
  Clerk = 13,
  SeniorCashier = 14,
  AllUsers = 13,
  RadTencnician=16,
  LabTechnician=15,
  Hospitalist=17,
  CashierLevel1=18,
  CashierLevel2=19,
  SeniorClerk=20
}
