// Insurance package interface
export interface InsurancePackage {
  packageId: number;
  packageName: string;
  productCode: string;
  productName: string;
  termOfInsurance: string;
  premiumRate: number;
  description: boolean;
}

// Payment interface
export interface Payment {
  paymentId: number;
  paymentName: string;
  paymentAmount: number;
  paymentDate: string;
  isPaid: boolean;
  paymentMethod?: "qr" | "bank";
}

// Insurance details interface
export interface InsuranceDetails {
  insuranceId: number;
  packageName: string;
  productName: string;
  ownerFirstname: string;
  ownerLastname: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Full insurance response interface
export interface InsuranceResponse {
  insuranceId: number;
  insuranceName: string;
  branchCode: string;
  startDate: string;
  endDate: string;
  totalEvaluation: number;
  averageFeePercent: number;
  totalFeeAmount: number;
  state: string;
  contracts: {
    contractId: number;
    contractName: string;
    policy_name: string;
    packageName: string;
    itemEvaluation: number;
    fee: number;
    ownerLastname: string;
    ownerFirstname: string;
    ownerRegisterNo: string;
    plate_number: boolean;
    packageIsBankTransfer: boolean;
  }[];
  payments: {
    paymentId: number;
    paymentName: string;
    paymentDate: string;
    paymentAmount: number;
    isPaid: boolean;
    paidAmount: number;
  }[];
}

// QPay response interface
export interface QPayResponse {
  isPaid: any;
  qpay_link: string;
  qpay_invoice: {
    invoice_id: string;
    qr_text: string;
    qr_image: string;
    qPay_shortUrl: string;
    urls: {
      name: string;
      description: string;
      logo: string;
      link: string;
    }[];
  };
}

// File upload interface
export interface UploadedFile {
  id: number;
  file: File;
  preview: string;
}

// Insurance product interface
export interface InsuranceProduct {
  productId: number;
  productCode: string;
  productName: string;
  productAcronym: string;
}

// Insurance package interface with risks
export interface InsurancePackageWithRisks {
  packageId: number;
  packageName: string;
  percentage: number;
  productCode: string;
  productName: string;
  productAcronym: string;
  risks: Array<{
    riskId: number;
    riskName: string;
    conditions: Array<{
      conditionId: number;
      conditionName: string;
    }>;
  }>;
}

// Insurance contract interface
export interface InsuranceContract {
  branchCode: string;
  startDate: string;
  endDate: string;
  paymentDivide: number;
  contracts: {
    itemEvaluation: number;
    packageId: number;
    ownerLastname: string;
    ownerFirstname: string;
    ownerRegisterNo: string;
    ownerAddress: string;
    ownerPhoneNumber: string;
    ownerEmail: string;

    driver_ids?: Array<{
      firstname: string;
      lastname: string;
      register_number: string;
      phone_number: string;
      email: string;
    }>;

    dynamic_fields?: Record<string, any>;
  }[];
  signature: string;
}

// Vehicle information interface
export interface VehicleInfo {
  plateNumber: string;
  cabinNumber: string;
  countryName: string;
  markName: string;
  modelName: string;
  buildYear: number;
  colorName: string;
  type: string;
  ownerType: string;
  intent: string | null;
  className: string;
  motorNumber: string | null;
  importDate: string;
  fuelType: string;
  manCount: number;
  axleCount: number;
  capacity: number;
  mass: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  transmission: string | null;
  wheelPosition: string;
  rfid: string | null;
}

// Dynamic field interface
export interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  alias: keyof VehicleInfo | false;
  selection_ids?: Array<{
    value: string;
    name: string;
  }>;
}

// Basic insurance interface
export interface Insurance {
  insuranceId: number;
  insuranceName: string;
  branchCode: string;
  startDate: string;
  endDate: string;
  totalEvaluation: number;
  averageFeePercent: number;
  totalFeeAmount: number;
  state: string;
  productName?: string;
  contracts?: {
    partner_register: string;
    plate_number: string | boolean;
  }[];
}

// Insurance list response interface
export interface InsuranceListResponse {
  total: number;
  offset: number;
  limit: number;
  insurances: Insurance[];
}
