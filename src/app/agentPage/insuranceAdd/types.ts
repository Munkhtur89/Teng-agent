export interface InsuranceProduct {
  productId: number;
  productCode: string;
  productName: string;
}

export interface InsurancePackageWithRisks {
  packageId: number;
  productCode: string;
  packageName: string;
  percentage: number;
  termMonth: string; // Нэмэгдсэн
  packageType: string; // Нэмэгдсэн
  risks: Array<{
    riskId: number;
    riskName: string;
    riskAmount: number;
  }>;
  isDivide?: boolean;
  fee_amount?: number;
}

export interface InsuranceContract {
  branchCode: string;
  startDate: string;
  endDate: string;
  paymentDivide: number;
  contracts: Array<{
    itemEvaluation: number;
    packageId: number;
    ownerLastname: string;
    ownerFirstname: string;
    ownerRegisterNo: string;
    ownerAddress: string;
    ownerPhoneNumber: string;
    ownerEmail: string;
    driver_ids: Array<{
      firstname: string;
      lastname: string;
      register_number: string;
      phone_number: string;
      email: string;
    }>;
    dynamic_fields: Record<string, string>;
  }>;
  signature: string;
}

export interface VehicleInfo {
  archiveDate: string | null;
  archiveFirstNumber: string;
  archiveNumber: string;
  axleCount: number;
  buildYear: number;
  cabinNumber: string;
  capacity: number;
  certificateNumber: string;
  className: string;
  colorName: string;
  countryName: string;
  fueltype: string;
  height: number;
  importDate: string;
  intent: string | null;
  length: number;
  manCount: number;
  markName: string;
  mass: number;
  modelName: string;
  motorNumber: string | null;
  ownerAddress: {
    apartment: string;
    door: string;
    soum: string;
    state: string;
    street: string | null;
  };
  ownerCountry: string;
  ownerFirstname: string;
  ownerHandphone: string;
  ownerHomephone: string;
  ownerLastname: string;
  ownerRegnum: string;
  ownerType: string;
  ownerWorkphone: string | null;
  plateNumber: string;
  transmission: string | null;
  type: string;
  typeId: number;
  weight: number;
  wheelPosition: string;
  width: number;
}

export interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  selection_ids?: Array<{
    id: number;
    name: string;
  }>;
}

export interface Driver {
  id: string;
  driverLastname?: string;
  driverFirstname?: string;
  driverRegisterNo?: string;
  driverPhoneNumber?: string;
  driverEmail?: string;
  driverLicense?: string;
  ownerPassportNumber?: string;
}

export interface RelatedPartner {
  lastname: string;
  firstname: string;
  register_number: string;
  passport_number: string;
}

export interface FormData {
  product: string;
  option: string;
  warranty: string;
  bankContract: string;
  isAutoNumbered: boolean;
  isRepeatingPattern: boolean;
  modification: string;
  evaluation: number;
  commission: number;
  payment: number;
  startDate: string;
  endDate: string;
  customerManager: string;
  ownerLastname: string;
  ownerFirstname: string;
  ownerRegisterNo: string;
  ownerAddress: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
  plateNumber: string;
  searchType: string;
  drivers: Driver[];
  dynamicFields: Record<string, any>;
  partnerLastname?: string;
  partnerFirstname?: string;
  partnerRegisterNo?: string;
  partnerPhoneNumber?: string;
  partnerEmail?: string;
  relatedPartners: RelatedPartner[];
  isCustomerInfoFilled?: boolean;
  isOwnerInfoFilled?: boolean;
  [key: string]: any;
}

// API дуудалтын төрөл
export interface FeeCalculationRequest {
  packageId: number;
  evaluation: number;
  couponCode?: string;
  travelDaysId?: number;
  countryGroupId?: number;
  isCovid?: number;
  travelMembers?: Array<{
    firstname: string;
    lastname: string;
    register: string;
  }>;
}

// API хариу төрөл
export interface FeeCalculationResponse {
  success: boolean;
  data?: {
    evaluation: number;
    currency: string;
    rate: number;
    fee: number;
    coupon_code: string;
    discount: number;
    total_fee: number;
    insuree_count: number;
  };
  error?: string;
}

export interface AssessmentFormData {
  product: string;
  evaluation: number;
  startDate: string;
  endDate: string;
  drivers?: Array<{
    driverFirstname?: string;
    driverLastname?: string;
    driverRegisterNo?: string;
  }>;
  option?: string;
  warranty?: string;
  bankContract?: string;
  isAutoNumbered?: boolean;
  commission?: number;
  customerManager?: string;
  dynamicFields?: Record<string, any>;
  isRepeatingPattern?: boolean;
  modification?: string;
  ownerAddress?: string;
  ownerEmail?: string;
  ownerFirstname?: string;
  ownerLastname?: string;
  ownerPhoneNumber?: string;
  ownerRegisterNo?: string;
  payment?: number;
  plateNumber?: string;
  x_country_group_id?: string;
  x_travel_days_id?: string;
}

export interface AssessmentProps {
  formData: AssessmentFormData;
  loading: boolean;
  products: InsuranceProduct[];
  selectedProduct: string;
  filteredPackages: InsurancePackageWithRisks[];
  selectedPercentage: number;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setSelectedProduct: (value: string) => void;
  selectedDynamicValues: Record<string, string>;
}

export interface PropertyData {
  address: string;
  addressApartmentName: string;
  addressDetail: string;
  addressRegionName: string | null;
  addressStreetName: string;
  addressTownName: string | null;
  aimagCityCode: string;
  aimagCityName: string;
  bagKhorooCode: string;
  bagKhorooName: string;
  intent: string;
  processList: Array<{
    date: string;
    ownerDataLlist?: any[];
    serviceID: string;
  }>;
  propertyNumber: string;
  soumDistrictCode: string;
  soumDistrictName: string;
  square: string;
  // Эзэмшигчийн мэдээлэл
  lastname?: string;
  firstname?: string;
  regnum?: string;
  phone?: string;
  email?: string;
}

export interface BasicInfoProps {
  formData: {
    product: string;
    evaluation: number;
    startDate: string;
    endDate: string;
    splitPayment?: string;
    paymentDivide?: number;
  };
  loading: boolean;
  products: InsuranceProduct[];
  selectedProduct: string;
  filteredPackages: InsurancePackageWithRisks[];
  selectedPercentage: number;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setSelectedProduct: (value: string) => void;
  isDivide: boolean;
  paymentDivide: number;
  errors?: Record<string, string>;
}

export interface CarInfoProps {
  vehicleInfo: VehicleInfo | null;
  formData: {
    ownerLastname: string;
    ownerFirstname: string;
    ownerRegisterNo: string;
    ownerPhoneNumber: string;
    ownerEmail: string;
    ownerAddress?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearching: boolean;
  errors?: {
    ownerLastname?: string;
    ownerFirstname?: string;
    ownerRegisterNo?: string;
    ownerPhoneNumber?: string;
    ownerEmail?: string;
    ownerAddress?: string;
  };
}

export interface CustomerInfoProps {
  formData: {
    ownerLastName: string;
    ownerFirstName: string;
    ownerRegisterNo: string;
    ownerPhoneNumber: string;
    ownerEmail: string;
    ownerAddress: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (
    keyword: string,
    searchType: "individual" | "organization"
  ) => Promise<void>;
  isSearching: boolean;
  searchType?: "individual" | "organization";
  onSearchTypeChange?: (type: "individual" | "organization") => void;
  errors?: {
    ownerLastName?: string;
    ownerFirstName?: string;
    ownerRegisterNo?: string;
    ownerPhoneNumber?: string;
    ownerEmail?: string;
    ownerAddress?: string;
  };
}

export interface Driver {
  id: string;
  driverLastname?: string;
  driverFirstname?: string;
  driverRegisterNo?: string;
  driverPhoneNumber?: string;
  driverEmail?: string;
  driverLicense?: string;
  driverAddress?: string;
  ownerPassportNumber?: string;
}

export interface RelatedPartner {
  lastname: string;
  firstname: string;
  register_number: string;
  passport_number: string;
}

export interface OwnerInfoProps {
  formData: {
    ownerLastName: string;
    ownerFirstName: string;
    ownerRegisterNo: string;
    ownerPhoneNumber: string;
    ownerEmail: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (keyword: string) => Promise<void>;
  isSearching: boolean;
  errors?: {
    ownerLastName?: string;
    ownerFirstName?: string;
    ownerRegisterNo?: string;
    ownerPhoneNumber?: string;
    ownerEmail?: string;
  };
}

export interface VehicleInfoProps {
  formData: {
    plateNumber: string;
    archiveNumber?: string;
    searchType: string;
  };
  isVehicleInfoLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  fetchVehicleInfo: () => void;
  errors?: Record<string, string>;
}
