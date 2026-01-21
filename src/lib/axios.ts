import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_AGENT_API_URL,
  isServer = typeof window === "undefined";

const instance = axios.create({
  baseURL,
  timeout: 30000, // 30 секундын timeout
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(async (config) => {
  if (isServer) {
    const { cookies } = await import("next/headers"),
      token = cookies().get("authToken")?.value;
    if (token) {
      config.headers["Authorization"] = `${token}`;
    }
  } else {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      config.headers["Authorization"] = `${token}`;
    }
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Axios error:", error);

    // Network error-ийн тохиолдолд илүү тодорхой мэдээлэл өгөх
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      const networkError = new Error(
        "Сүлжээний холболт амжилтгүй. Сервертэй холбогдох боломжгүй байна."
      );
      networkError.name = "NetworkError";
      return Promise.reject(networkError);
    }

    // Timeout error
    if (error.code === "ECONNABORTED") {
      const timeoutError = new Error(
        "Хүсэлт хэт удаан үргэлжилсэн. Дахин оролдоно уу."
      );
      timeoutError.name = "TimeoutError";
      return Promise.reject(timeoutError);
    }

    return Promise.reject(error?.response?.data ?? error);
  }
);

// Axios-г response.data буцаадаг generic интерфэйс болгон тунхаглах
export interface DataAxiosInstance {
  request(arg0: {
    url: string;
    data: any;
    method: "delete" | "post" | "put";
    params: {};
  }): unknown;
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
}

const api = instance as unknown as DataAxiosInstance;

export default api;
