import api from "./axios";

// Төрлүүд
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

// Agent related endpoints
export const agentApi = {
  getProfile: () => api.get("/api/v1/agent/profile"),
  revokeToken: (userId: string | undefined | null) =>
    api.post("/api/revoke/token", { user_id: userId }),
  setupTwoFactor: () => api.post("/api/v1/app/2fa/setup"),
  verifyAndEnableTwoFactor: (payload: { secret: string; totp_code: string }) =>
    api.post("/api/v1/app/2fa/verify-and-enable", payload),
  disableTwoFactor: () => api.post("/api/v1/agent/two-factor/disable"),
  getTwoFactorStatus: () => api.get("/api/v1/app/2fa/status"),
};

// Insurance endpoints
export const insuranceApi = {
  getList: (params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    name?: string;
    offset?: number;
    registerNumber?: string;
    plateNumber?: string;
  }) => api.post("/api/v1/agent/insurance/list", params),

  create: (payload: any) => api.post("/api/v1/agent/insurance/create", payload),

  feeCalculation: (payload: any) =>
    api.post("/api/v1/agent/insurance/fee/calculation", payload),

  getPackagesTree: () => api.get("/api/v1/agent/insurance/packages/tree"),

  getPackageFields: (packageId: string | number) =>
    api.get(`/api/v1/agent/insurance/package/fields`, {
      params: { packageId },
    }),

  getById: (payload: { insuranceId: number | string }) =>
    api.post("/api/v1/agent/insurance/show", payload),

  getInvoice: (payload: any) =>
    api.post("/api/v1/agent/insurance/invoice", payload),

  payQPayCheck: (payload: any) =>
    api.post("/api/v1/agent/insurance/qpay/check", payload),

  payGolomtInit: (payload: any) =>
    api.post("/api/v1/agent/insurance/paid", payload),

  getContractPdf: (contractId: string | number) =>
    api.get(`/api/v1/agent/insurance/contract/pdf?contractId=${contractId}`),

  getContractPdfBlob: (contractId: string | number) =>
    (api as any).get(
      `/api/v1/agent/insurance/contract/pdf?contractId=${contractId}`,
      {
        responseType: "blob",
      }
    ) as Promise<Blob>,
};

// XYP endpoints
export const xypApi = {
  getVehicle: (payload: any) => api.post("/api/v1/agent/xyp/vehicle", payload),
  getInformations: (payload: any) =>
    api.post("/api/v1/agent/xyp/informations", payload),
  getProperty: (payload: any) =>
    api.post("/api/v1/agent/xyp/property", payload),
};

// Image/File endpoints
export const fileApi = {
  listImages: (payload: any) =>
    api.post("/api/v1/agent/insurance/image/list", payload),
  uploadImage: (form: FormData) =>
    api.post("/api/v1/agent/insurance/image/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadBase64: (payload: { insuranceId: number; photo_base64: string }) =>
    api.post("/api/v1/agent/insurance/image/upload", payload),
};

// Reports endpoints
export const reportsApi = {
  getInsuranceReport: (startDate: string, endDate: string) =>
    (api as any).get(`/api/v1/agent/insurance/report`, {
      params: { startDate, endDate },
      responseType: "blob",
    }) as Promise<Blob>,
};

// Auth endpoints (refresh etc.)
export const authApi = {
  refreshToken: (payload: any) => api.post("/api/refresh/token", payload),
  authenticate: (payload: {
    login: string;
    password: string;
    totp_code?: string;
  }) => api.post("/api/authenticate", payload),
};
