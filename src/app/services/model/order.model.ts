export interface OrderPayment {
  orderIdList: number[]
  payment: Payment
}

export interface Payment {
  paymentDetails: PaymentDetail[]
}

export interface PaymentDetail {
  paymentType: string
  amount: number
  comment: string
  paymentId: number
  payment: string
}


export interface VoucherDetails {
  patientId: number;
  dateTime: string;
  number: string;
  value: string;
  status: string;
  qrCode: string;
}
