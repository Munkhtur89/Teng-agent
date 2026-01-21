
"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";
import { LoadingModal } from "@/components";
import {
  InsuranceProduct,
  InsurancePackageWithRisks as InsurancePackage,
  VehicleInfo,
  DynamicField,
  FormData,
  Driver,
  RelatedPartner,
  PropertyData,
} from "./types";

// Import components
import CustomerInfo from "./components/CustomerInfo";
import BasicInfo from "./components/BasicInfo";
import VehicleInfoComponent from "./components/VehicleInfo";
import DriverInfo from "./components/DriverInfo";
import DynamicFields from "./components/DynamicFields";
import Assessment from "./components/Assessment";

import { useAgentAuth } from "@/providers/AgentAuthContext";

import { IoArrowBack } from "react-icons/io5";
import ApartmentSearch from "./components/ApartmentSearch";
import { BsFillPassportFill } from "react-icons/bs";
import ApartOwner from "./components/ApartOwner";
import TravelaBroad from "./components/TravelaBroad";
import TravelMember from "./components/TravelMember";
import TravelUsers from "./components/TravelUsers";
import toast from "react-hot-toast";

type ChatMessage = {
  sender: "ai" | "user";
  text?: string;
  time: string;
  imageUrl?: string;
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logoutAgent } = useAgentAuth();
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInsuranceId, setEditInsuranceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insurancePackages, setInsurancePackages] = useState<
    InsurancePackage[]
  >([]);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyData | undefined>(
    undefined
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProductCode, setSelectedProductCode] = useState<string>("");
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [filteredPackages, setFilteredPackages] = useState<InsurancePackage[]>(
    []
  );

  const [selectedPercentage, setSelectedPercentage] = useState<number>(0);
  const [isVehicleInfoLoading, setIsVehicleInfoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isOwnerInfoLoading, setIsOwnerInfoLoading] = useState(false);
  const [isApartmentSearchLoading, setIsApartmentSearchLoading] =
    useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [customerSearchType, setCustomerSearchType] = useState<
    "individual" | "organization"
  >("individual");

  const handleCustomerSearchTypeChange = (
    type: "individual" | "organization"
  ) => {
    setCustomerSearchType(type);
    // Сонгосон төрлөөс хамаарахгүй талбаруудын алдаануудыг арилгах
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (type === "organization") {
        // Байгуулгын үед иргэний талбаруудын алдаануудыг арилгах
        delete newErrors.ownerLastName;
        delete newErrors.ownerAddress;
      } else {
        // Иргэний үед байгуулгын талбаруудын алдаануудыг арилгах
        delete newErrors.ownerEmail;
      }
      return newErrors;
    });
  };

  console.log("products", filteredPackages);
  const [formData, setFormData] = useState<FormData>({
    product: "",
    option: "",
    warranty: "",
    bankContract: "",
    isAutoNumbered: false,
    isRepeatingPattern: false,
    modification: "Үндсэн",
    evaluation: 0,
    commission: 0,
    payment: 0,
    startDate: "2025-02-05",
    endDate: "2026-02-04",
    customerManager: "",
    ownerLastname: "",
    ownerFirstname: "",
    ownerRegisterNo: "",
    ownerAddress: "",
    ownerPhoneNumber: "",
    ownerEmail: "",
    plateNumber: "",
    searchType: "plateNumber",
    drivers: [],
    dynamicFields: {},
    partnerLastname: "",
    partnerFirstname: "",
    partnerRegisterNo: "",
    partnerPhoneNumber: "",
    partnerEmail: "",
    passport_number: "",
    relatedPartners: [],
    paymentDivide: 1,
  });

  const [selectedDynamicValues, setSelectedDynamicValues] = useState<
    Record<string, string>
  >({});

  const [isDivide, setIsDivide] = useState(false);

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Алдааны мэдээллийг арилгах
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Automatically calculate commission when product or evaluation changes
    if (name === "product" || name === "evaluation") {
      const selectedPackage = insurancePackages.find(
        (pkg) => pkg.packageId === Number(formData.product || value)
      );

      if (selectedPackage && formData.evaluation) {
        const commission =
          (Number(formData.evaluation) * selectedPackage.percentage) / 100;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          commission: commission,
        }));
      }
    }

    if (name === "product" && value) {
      const token = Cookies.get("authToken");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/insurance/package/fields?packageId=${value}`,
          {
            headers: {
              Authorization: `${token || ""}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Алдаа гарлаа");
        }

        const data = await response.json();
        setDynamicFields(data);
        console.log("Dynamic fields:", data);

        const selectedPackage = insurancePackages.find(
          (pkg) => pkg.packageId === Number(value)
        );
        setSelectedProductCode(selectedPackage?.productCode || "");
        setSelectedPercentage(selectedPackage?.percentage || 0);
        setIsDivide(selectedPackage?.isDivide || false);
      } catch (error) {
        console.error("Dynamic fields fetching error:", error);
      }
    }
  };

  const fetchInsurances = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/insurance/packages/tree`,
        {
          method: "GET",
          headers: {
            Authorization: `${token || ""}`,
          },
        }
      );

      if (!response.ok) {
        // Зөвхөн authentication алдаа гарвал logout хийх
        if (response.status === 401 || response.status === 403) {
          logoutAgent();
          router.push("/");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setInsurancePackages(data.packages || []);
      setLoading(false);
    } catch (err: any) {
      console.error("API алдааны мэдээлэл:", err);
      console.log("token---------------------==", err.message);

      // Network алдаа эсвэл CSP блоклогдсон тохиолдолд logout хийхгүй
      if (err.message?.includes("blocked") || err.message?.includes("CSP")) {
        setError("Сүлжээний холболт амжилтгүй. Дахин оролдоно уу.");
        setLoading(false);
        return;
      }

      // Бусад алдаанд зөвхөн алдааны мэдээлэл харуулах
      setError("Мэдээлэл авахад алдаа гарлаа");
      setLoading(false);
    }
  };

  const fetchInsuranceById = async (insuranceId: string) => {
    try {
      setLoading(true);
      const token = Cookies.get("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/insurance/show`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify({
            insuranceId: Number(insuranceId),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logoutAgent();
          router.push("/");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched insurance data:", data);

      // Эхний contract-ийн мэдээлэл
      const firstContract = data.contracts?.[0];
      if (!firstContract) {
        toast.error("Гэрээний мэдээлэл олдсонгүй");
        router.push("/agentPage");
        return;
      }

      // Contracts мэдээллийг localStorage-д хадгалах (update хийхэд contractId, related_partners id хэрэгтэй)
      const contractsData = {
        insuranceId: data.insuranceId,
        contracts: data.contracts?.map((contract: any) => ({
          contractId: contract.contractId,
          related_partners: contract.related_partners?.map((partner: any) => ({
            id: partner.id,
            firstname: partner.firstname,
            lastname: partner.lastname,
            register_number: partner.register_number,
            phone_number: partner.phone_number,
            email: partner.email,
          })) || [],
        })) || [],
      };
      localStorage.setItem("contractPreviewContractsData", JSON.stringify(contractsData));

      // Package-ийг олох
      const packageName = firstContract.packageName;
      const foundPackage = insurancePackages.find(
        (pkg) => pkg.packageName === packageName
      );

      if (foundPackage) {
        setSelectedProduct(foundPackage.productCode);
        setFormData((prev) => ({
          ...prev,
          product: foundPackage.packageId.toString(),
          startDate: data.startDate || prev.startDate,
          endDate: data.endDate || prev.endDate,
          evaluation: firstContract.itemEvaluation || data.totalEvaluation || 0,
          commission: firstContract.fee || 0,
          ownerLastname: firstContract.ownerLastname || "",
          ownerFirstname: firstContract.ownerFirstname || "",
          ownerRegisterNo: firstContract.ownerRegisterNo || "",
          paymentDivide: data.payments?.length || 1,
        }));

        // Dynamic fields татах
        if (foundPackage.packageId) {
          const fieldsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/insurance/package/fields?packageId=${foundPackage.packageId}`,
            {
              headers: {
                Authorization: `${token || ""}`,
              },
            }
          );

          if (fieldsResponse.ok) {
            const fieldsData = await fieldsResponse.json();
            setDynamicFields(fieldsData);

            // Dynamic fields-ийн утгуудыг бөглөх
            if (firstContract.dynamic_fields) {
              const dynamicValues: Record<string, any> = {};
              Object.keys(firstContract.dynamic_fields).forEach((key) => {
                dynamicValues[key] = firstContract.dynamic_fields[key];
                setFormData((prev) => ({
                  ...prev,
                  [key]: firstContract.dynamic_fields[key],
                }));
              });
              setSelectedDynamicValues(dynamicValues);

              // Plate number-г dynamic fields-аас олох
              if (firstContract.dynamic_fields.x_plate_number) {
                setFormData((prev) => ({
                  ...prev,
                  plateNumber: firstContract.dynamic_fields.x_plate_number,
                }));
              }
            }
          }
        }

        setSelectedProductCode(foundPackage.productCode);
        setSelectedPercentage(foundPackage.percentage || 0);
        setIsDivide(foundPackage.isDivide || false);
      } else {
        toast.error("Багц олдсонгүй");
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Гэрээний мэдээлэл татахад алдаа:", err);
      toast.error("Гэрээний мэдээлэл татахад алдаа гарлаа");
      setLoading(false);
    }
  };

  const fetchVehicleInfo = async () => {
    setIsVehicleInfoLoading(true);
    try {
      const token = Cookies.get("authToken");

      // searchType-аас хамааран body бэлдэх
      const requestBody =
        formData.searchType === "archiveNumber"
          ? { cabinNumber: formData.plateNumber }
          : { plateNumber: formData.plateNumber };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/xyp/vehicle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Тээврийн хэрэгслийн мэдээлэл татахад алдаа гарлаа");
      }

      const data = await response.json();
      setVehicleInfo(data);
      console.log("Vehicle info:", data);

      // Ирсэн датаагаас formData-г шинэчлэх
      if (data) {
        setFormData((prev) => ({
          ...prev,
          // Тээврийн хэрэгслийн мэдээлэл
          plateNumber: data.plateNumber || prev.plateNumber,
          // Эзэмшигчийн мэдээлэл
          ownerLastname: data.ownerLastname || prev.ownerLastname,
          ownerFirstname: data.ownerFirstname || prev.ownerFirstname,
          ownerRegisterNo: data.ownerRegnum || prev.ownerRegisterNo,

          ownerPhoneNumber:
            data.ownerHandphone || data.ownerHomephone || prev.ownerPhoneNumber,
          ownerAddress: data.ownerAddress
            ? `${data.ownerAddress.state}, ${data.ownerAddress.soum}, ${data.ownerAddress.apartment} тоот, ${data.ownerAddress.door}`
            : prev.ownerAddress,
        }));

        // Dynamic fields-ийн утгуудыг автоматаар бөглүүлэх
        const updatedFormData = { ...formData };
        dynamicFields.forEach((field: DynamicField) => {
          // API-аас ирсэн дататай холбох
          switch (field.name) {
            case "x_plate_number":
              updatedFormData[field.name] = data.plateNumber || "";
              break;
            case "x_frame_number":
              updatedFormData[field.name] = data.cabinNumber || "";
              break;
            case "x_car_brand":
              updatedFormData[field.name] = data.markName || "";
              break;
            case "x_car_model":
              updatedFormData[field.name] = data.modelName || "";
              break;
            case "x_build_year":
              updatedFormData[field.name] = data.buildYear || "";
              break;
            case "x_imported_date":
              updatedFormData[field.name] = data.importDate || "";
              break;
            case "x_partner_lastname":
              updatedFormData[field.name] = data.ownerLastname || "";
              break;
            case "x_partner_name":
              updatedFormData[field.name] = data.ownerFirstname || "";
              break;
            case "x_partner_vat":
              updatedFormData[field.name] = data.ownerRegnum || "";
              break;
            case "x_additional_field":
              // Хоосон байлгаж, гараар оруулна
              break;
            case "x_car_class":
              updatedFormData[field.name] = data.className || "";
              break;
            default:
              // Бусад талбаруудыг шалгах
              if (data[field.name as keyof typeof data]) {
                updatedFormData[field.name] =
                  data[field.name as keyof typeof data];
              }
              break;
          }
        });

        setFormData(updatedFormData);
      }
    } catch (error) {
      console.error("Error fetching vehicle info:", error);
      alert("Тээврийн хэрэгслийн мэдээлэл татахад алдаа гарлаа");
    } finally {
      setIsVehicleInfoLoading(false);
    }
  };

  const searchCustomerInfo = async (
    keyword: string,
    searchType: "individual" | "organization"
  ) => {
    setIsSearching(true);
    try {
      const token = Cookies.get("authToken");
      const requestBody =
        searchType === "organization"
          ? { vat: keyword, type: "company" }
          : { vat: keyword };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/xyp/informations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Хайлт амжилтгүй боллоо");
      }

      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        toast.error("Даатгуулагчийн мэдээлэл олдсонгүй");
        return;
      }

      // Байгуулгын үед general объектоос мэдээлэл авах
      if (searchType === "organization" && data.general) {
        setFormData((prev) => ({
          ...prev,
          ownerLastname: "",
          ownerFirstname: data.general.companyName || "",
          ownerRegisterNo: data.general.companyRegnum || "",
          ownerPhoneNumber: data.general.phone || "",
          ownerEmail: "",
          ownerAddress: "",
        }));
      } else {
        // Иргэний үед
        setFormData((prev) => ({
          ...prev,
          ownerLastname: data.lastname || "",
          ownerFirstname: data.firstname || "",
          ownerRegisterNo: data.regnum || "",
          ownerPhoneNumber: data.phone || "",
          ownerEmail: data.email || "",
          ownerAddress: data.passportAddress || "",
        }));
      }
    } catch (error) {
      console.error("Хайлтын алдаа:", error);
      toast.error("Даатгуулагчийн мэдээлэл олдсонгүй. Гараар бөглөнө үү.");
    } finally {
      setIsSearching(false);
    }
  };

  const searchApartmentOwnerInfo = async (keyword: string) => {
    setIsSearching(true);
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/xyp/informations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify({
            vat: keyword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Хайлт амжилтгүй боллоо");
      }

      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        toast.error("Даатгуулагчийн мэдээлэл олдсонгүй");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        ownerLastname: data.lastname || "",
        ownerFirstname: data.firstname || "",
        ownerRegisterNo: data.regnum || "",
        ownerPhoneNumber: "",
        ownerAddress: data.passportAddress || "",
      }));
    } catch (error) {
      console.error("Хайлтын алдаа:", error);
      toast.error("Даатгуулагчийн мэдээлэл олдсонгүй. Гараар бөглөнө үү.");
    } finally {
      setIsSearching(false);
    }
  };

  const searchApartmentInfo = async (
    propertyNumber: string,
    ownerRegnum: string
  ): Promise<PropertyData | null> => {
    setIsApartmentSearchLoading(true);
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/xyp/property`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify({
            propertyNumber: propertyNumber,
            ownerRegnum: ownerRegnum,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Хайлт амжилтгүй боллоо");
      }

      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        toast.error("Орон сууцны мэдээлэл олдсонгүй");
        return null;
      }

      // Property data-г state-д хадгалах (DynamicFields компонентийн хувьд)
      setPropertyData(data as PropertyData);

      // Property data-г буцааж өгөх
      return data as PropertyData;
    } catch (error) {
      console.error("Хайлтын алдаа:", error);
      alert("Орон сууцны мэдээлэл олдсонгүй. Гараар бөглөнө үү.");
      return null;
    } finally {
      setIsApartmentSearchLoading(false);
    }
  };

  useEffect(() => {
    const editId = searchParams.get("editId");
    if (editId) {
      setEditInsuranceId(editId);
      setIsEditMode(true);
    }
    fetchInsurances();
  }, [searchParams]);

  useEffect(() => {
    if (editInsuranceId && insurancePackages.length > 0) {
      fetchInsuranceById(editInsuranceId);
    }
  }, [editInsuranceId, insurancePackages]);

  useEffect(() => {
    if (selectedProduct) {
      const packages = insurancePackages.filter(
        (pkg) => pkg.productCode === selectedProduct
      );
      setFilteredPackages(packages);
    } else {
      setFilteredPackages([]);
    }
  }, [selectedProduct, insurancePackages]);

  useEffect(() => {
    if (vehicleInfo) {
      const updatedFormData = { ...formData };

      // Loop through dynamic fields and set values from vehicleInfo if alias exists
      dynamicFields.forEach((field: DynamicField) => {
        // Check if field name exists in vehicleInfo
        if (vehicleInfo[field.name as keyof typeof vehicleInfo]) {
          // Set the value from vehicleInfo to formData
          updatedFormData[field.name] =
            vehicleInfo[field.name as keyof typeof vehicleInfo];
        }
      });

      setFormData(updatedFormData);
    }
  }, [vehicleInfo, dynamicFields]);

  // Баталгаажуулалтын функц
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // BasicInfo баталгаажуулалт
    if (!selectedProduct) {
      errors.productType = "Даатгалын бүтээгдэхүүн сонгоно уу";
    }
    if (!formData.product) {
      errors.product = "Даатгалын багц сонгоно уу";
    }
    if (
      selectedProduct !== "2801" &&
      selectedProduct !== "1210" &&
      !formData.evaluation
    ) {
      errors.evaluation = "Үнэлгээ оруулна уу";
    }
    if (!formData.startDate) {
      errors.startDate = "Эхлэх огноо сонгоно уу";
    }
    if (!formData.endDate) {
      errors.endDate = "Дуусах огноо сонгоно уу";
    }

    // CustomerInfo баталгаажуулалт (selectedProductCode-оос хамаарна)
    const needsCustomerInfo =
      selectedProductCode !== "1304" &&
      selectedProductCode !== "1217" &&
      selectedProductCode !== "1302" &&
      selectedProductCode !== "1205" &&
      selectedProductCode !== "1210" &&
      selectedProductCode !== "1306";

    const needsTravelaBroad =
      selectedProductCode === "1210" &&
      ["425", "426"].includes(formData.product);

    const needsApartOwner =
      selectedProductCode === "1217" ||
      selectedProductCode === "1306" ||
      selectedProductCode === "1304" ||
      selectedProductCode === "1205" ||
      selectedProductCode === "1302";

    if (needsCustomerInfo || needsTravelaBroad || needsApartOwner) {
      // CustomerInfo-ийн хувьд searchType-аас хамаарч шалгах
      if (needsCustomerInfo) {
        // Иргэний мэдээлэл сонгосон үед
        if (customerSearchType === "individual") {
          if (!formData.ownerLastname) {
            errors.ownerLastName = "Овог оруулна уу";
          }
          if (!formData.ownerFirstname) {
            errors.ownerFirstName = "Нэр оруулна уу";
          }
          if (!formData.ownerRegisterNo) {
            errors.ownerRegisterNo = "Регистрийн дугаар оруулна уу";
          }
          if (!formData.ownerPhoneNumber) {
            errors.ownerPhoneNumber = "Утасны дугаар оруулна уу";
          }
          if (!formData.ownerAddress) {
            errors.ownerAddress = "Хаяг оруулна уу";
          }
        } else {
          // Байгуулгын мэдээлэл сонгосон үед
          if (!formData.ownerFirstname) {
            errors.ownerFirstName = "Байгуулгын нэр оруулна уу";
          }
          if (!formData.ownerRegisterNo) {
            errors.ownerRegisterNo = "Байгуулгын регистрийн дугаар оруулна уу";
          }
          if (!formData.ownerPhoneNumber) {
            errors.ownerPhoneNumber = "Байгуулгын утасны дугаар оруулна уу";
          }
          if (!formData.ownerEmail) {
            errors.ownerEmail = "Байгуулгын и-мэйл оруулна уу";
          }
        }
      } else if (needsTravelaBroad) {
        // TravelaBroad-д зөвхөн иргэний мэдээлэл шаардлагатай
        if (!formData.ownerLastname) {
          errors.ownerLastName = "Овог оруулна уу";
        }
        if (!formData.ownerFirstname) {
          errors.ownerFirstName = "Нэр оруулна уу";
        }
        if (!formData.ownerRegisterNo) {
          errors.ownerRegisterNo = "Регистрийн дугаар оруулна уу";
        }
        if (!formData.ownerPhoneNumber) {
          errors.ownerPhoneNumber = "Утасны дугаар оруулна уу";
        }
      } else if (needsApartOwner) {
        // ApartOwner-д зөвхөн иргэний мэдээлэл шаардлагатай
        if (!formData.ownerLastname) {
          errors.ownerLastName = "Овог оруулна уу";
        }
        if (!formData.ownerFirstname) {
          errors.ownerFirstName = "Нэр оруулна уу";
        }
        if (!formData.ownerRegisterNo) {
          errors.ownerRegisterNo = "Регистрийн дугаар оруулна уу";
        }
        if (!formData.ownerPhoneNumber) {
          errors.ownerPhoneNumber = "Утасны дугаар оруулна уу";
        }
        if (!formData.ownerAddress) {
          errors.ownerAddress = "Хаяг оруулна уу";
        }
      }
    }

    // VehicleInfo баталгаажуулалт
    const needsVehicleInfo =
      selectedProductCode === "1403" ||
      selectedProductCode === "1406" ||
      selectedProductCode === "1407" ||
      selectedProductCode === "2001" ||
      selectedProductCode === "1402" ||
      selectedProductCode === "1305" ||
      selectedProductCode === "1404";

    if (needsVehicleInfo && !formData.plateNumber) {
      errors.plateNumber = "Улсын дугаар эсвэл арлын дугаар оруулна уу";
    }

    // DriverInfo баталгаажуулалт

    // DynamicFields баталгаажуулалт
    dynamicFields.forEach((field: DynamicField) => {
      if (field.required) {
        const fieldValue = formData[field.name];
        if (!fieldValue || fieldValue.toString().trim() === "") {
          errors[field.name] = `${field.label} оруулна уу`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Баталгаажуулалт хийх
    if (!validateForm()) {
      // Алдааны мэдээлэл харуулах
      const errorMessages = Object.values(validationErrors);
      if (errorMessages.length > 0) {
        alert(
          `Дараах заавал бөглөх талбарууд дутуу байна:\n\n${errorMessages.join(
            "\n"
          )}`
        );
        // Эхний алдаатай талбар руу scroll хийх
        const firstErrorField = Object.keys(validationErrors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          (element as HTMLElement).focus();
        }
      }
      return;
    }

    // Мэдээллийг localStorage-д хадгалах
    try {
      localStorage.setItem("contractPreviewData", JSON.stringify(formData));
      localStorage.setItem(
        "contractPreviewSelectedProductCode",
        selectedProductCode
      );
      localStorage.setItem("contractPreviewSelectedProduct", selectedProduct);
      localStorage.setItem(
        "contractPreviewDynamicFields",
        JSON.stringify(dynamicFields)
      );
      if (vehicleInfo) {
        localStorage.setItem(
          "contractPreviewVehicleInfo",
          JSON.stringify(vehicleInfo)
        );
      }
      if (propertyData) {
        localStorage.setItem(
          "contractPreviewPropertyData",
          JSON.stringify(propertyData)
        );
      }

      // Edit mode-д insuranceId болон contractId хадгалах
      if (isEditMode && editInsuranceId) {
        localStorage.setItem("contractPreviewIsEditMode", "true");
        localStorage.setItem("contractPreviewInsuranceId", editInsuranceId);
        // Contracts мэдээлэл хадгалах (contractId, related_partners id гэх мэт)
        const savedContractsData = localStorage.getItem("contractPreviewContractsData");
        if (savedContractsData) {
          // Хэрэв өмнө хадгалсан бол тэр хэвээр үлдээх
        }
      } else {
        localStorage.removeItem("contractPreviewIsEditMode");
        localStorage.removeItem("contractPreviewInsuranceId");
        localStorage.removeItem("contractPreviewContractsData");
      }

      // Preview хуудас руу шилжих
      window.location.href = "/agentPage/insuranceAdd/preview";
    } catch (error) {
      console.error("Error saving preview data:", error);
      alert("Мэдээлэл хадгалахад алдаа гарлаа");
    }
  };

  const handleDriversChange = (drivers: Driver[]) => {
    setFormData((prev) => ({
      ...prev,
      drivers,
    }));
  };

  const handleDynamicFieldChange = (name: string, value: string) => {
    setSelectedDynamicValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Form data-г шууд өөрчлөх
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRelatedPartnersChange = (relatedPartners: RelatedPartner[]) => {
    setFormData((prev) => ({
      ...prev,
      relatedPartners,
    }));
  };

  return (
    <div className="min-h-screen  relative bg-gray-200">
      <div className="container mx-auto pt-6 pb-20">
        {/* Зүүн талын формын хэсэг */}
        <div className=" space-y-8">
          <div className=" p-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/agentPage")}
                  className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out border border-blue-400/20"
                >
                  <div className="flex items-center justify-center w-6 h-6  group-hover:bg-blue-500 rounded-full transition-all duration-300">
                    <IoArrowBack
                      size={16}
                      className="text-white group-hover:text-white transition-colors"
                    />
                  </div>
                  <span className="font-semibold text-sm">Буцах</span>
                </button>
              </div>

              <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
                {isEditMode ? "Гэрээ засах" : "Шинэ гэрээ үүсгэх"}
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-8 bg-white p-8 rounded-xl"
            >
              {/* Basic Insurance Information */}
              <BasicInfo
                formData={formData}
                loading={loading}
                products={products}
                selectedProduct={selectedProduct}
                filteredPackages={filteredPackages}
                selectedPercentage={selectedPercentage}
                handleInputChange={handleInputChange}
                setSelectedProduct={(value) => {
                  setSelectedProduct(value);
                  // Алдааны мэдээллийг арилгах
                  if (validationErrors.productType) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.productType;
                      return newErrors;
                    });
                  }
                }}
                isDivide={isDivide}
                paymentDivide={formData.paymentDivide}
                errors={validationErrors}
              />

              {/* oron suuts owner  */}
              {(selectedProductCode === "1217" ||
                selectedProductCode === "1306" ||
                selectedProductCode === "1304" ||
                selectedProductCode === "1217" ||
                selectedProductCode === "1205" ||
                selectedProductCode === "1302") && (
                <ApartOwner
                  formData={{
                    ownerLastname: formData.ownerLastname || "",
                    ownerFirstname: formData.ownerFirstname || "",
                    ownerRegisterNo: formData.ownerRegisterNo || "",
                    ownerPhoneNumber: formData.ownerPhoneNumber || "",
                    ownerEmail: formData.ownerEmail || "",
                    ownerAddress: formData.ownerAddress || "",
                  }}
                  handleInputChange={handleInputChange}
                  onSearch={searchApartmentOwnerInfo}
                  isSearching={isSearching}
                  errors={validationErrors}
                />
              )}

              {selectedProductCode === "1210" &&
                ["425", "426"].includes(formData.product) && (
                  // button insurance owner or customer
                  <div className="bg-gray-200 rounded-xl p-2">
                    <div className="flex items-center gap-2 m-4">
                      <BsFillPassportFill
                        className="text-[#000080]"
                        size={18}
                      />

                      <h2 className="text-[20px] font-medium text-[#000080]">
                        Даатгуулагчийн мэдээлэл
                      </h2>
                    </div>
                    {/* Customer Information */}
                    <div className=" mt-4 rounded-lg">
                      <TravelaBroad
                        formData={{
                          ownerLastName: formData.ownerLastname || "",
                          ownerFirstName: formData.ownerFirstname || "",
                          ownerRegisterNo: formData.ownerRegisterNo || "",
                          ownerPhoneNumber: formData.ownerPhoneNumber || "",
                          ownerEmail: formData.ownerEmail || "",
                          ownerAddress: formData.ownerAddress || "",
                        }}
                        handleInputChange={handleInputChange}
                        onSearch={searchCustomerInfo}
                        isSearching={isSearching}
                        errors={validationErrors}
                      />
                    </div>
                  </div>
                )}

              {selectedProductCode !== "1304" &&
                selectedProductCode !== "1217" &&
                selectedProductCode !== "1302" &&
                selectedProductCode !== "1205" &&
                selectedProductCode !== "1210" &&
                selectedProductCode !== "1306" && (
                  // button insurance owner or customer
                  <div className="bg-gray-200 rounded-xl p-2">
                    <div className="flex items-center gap-2 m-4">
                      <BsFillPassportFill
                        className="text-[#000080]"
                        size={18}
                      />
                      <h2 className="text-[20px] font-medium text-[#000080]">
                        Даатгуулагчийн мэдээлэл
                      </h2>
                    </div>

                    {/* Customer Information */}
                    <div className=" mt-4 rounded-lg">
                      <CustomerInfo
                        formData={{
                          ownerLastName: formData.ownerLastname || "",
                          ownerFirstName: formData.ownerFirstname || "",
                          ownerRegisterNo: formData.ownerRegisterNo || "",
                          ownerPhoneNumber: formData.ownerPhoneNumber || "",
                          ownerEmail: formData.ownerEmail || "",
                          ownerAddress: formData.ownerAddress || "",
                        }}
                        handleInputChange={handleInputChange}
                        onSearch={searchCustomerInfo}
                        isSearching={isSearching}
                        searchType={customerSearchType}
                        onSearchTypeChange={handleCustomerSearchTypeChange}
                        errors={validationErrors}
                      />
                    </div>
                  </div>
                )}

              {/* Vehicle Information - Only show if product  */}
              {(selectedProductCode === "1401" ||
                selectedProductCode === "1403" ||
                selectedProductCode === "1406" ||
                selectedProductCode === "1407" ||
                selectedProductCode === "2001" ||
                selectedProductCode === "1402" ||
                selectedProductCode === "1305" ||
                selectedProductCode === "1404") && (
                <VehicleInfoComponent
                  formData={formData}
                  isVehicleInfoLoading={isVehicleInfoLoading}
                  handleInputChange={handleInputChange}
                  fetchVehicleInfo={fetchVehicleInfo}
                  errors={validationErrors}
                />
              )}

              {/* {["1402", "2001", "1305", "1406", "1407", "1404"].includes(
          selectedProductCode
   
        )} */}

              <>
                {/* Driver Information - Only show if product code is 1401 or 1210 */}
                {(selectedProductCode === "1206" ||
                  selectedProductCode === "1203") && (
                  <DriverInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleDriversChange={handleDriversChange}
                    handleRelatedPartnersChange={handleRelatedPartnersChange}
                    selectedProductCode={selectedProductCode}
                  />
                )}
              </>

              {(selectedProductCode === "1306" ||
                selectedProductCode === "1304" ||
                selectedProductCode === "1301" ||
                selectedProductCode === "1307") && (
                <ApartmentSearch
                  onSearch={searchApartmentInfo}
                  isApartmentSearchLoading={isApartmentSearchLoading}
                  onPropertyDataFound={(data: any) => {
                    setPropertyData(data);
                    // CustomerInfo-ийн мэдээллийг хадгалах
                    if (data) {
                      const updatedFormData: any = {
                        // Орон сууцны мэдээллийг шинэчлэх
                        ownerAddress: data.address,
                        // Хэрэв эзэмшигчийн мэдээлэл байвал түүнийг шинэчлэх
                        ...(data.lastname && { ownerLastname: data.lastname }),
                        ...(data.firstname && {
                          ownerFirstname: data.firstname,
                        }),
                        ...(data.regnum && { ownerRegisterNo: data.regnum }),
                        ...(data.phone && { ownerPhoneNumber: data.phone }),
                        ...(data.email && { ownerEmail: data.email }),
                      };

                      // Dynamic fields-уудыг автоматаар бөглөх
                      if (dynamicFields.length > 0) {
                        // Улсын бүртгэлийн дугаар
                        const propertyNumberField = dynamicFields.find(
                          (field) =>
                            field.name === "x_national_registration_number"
                        );
                        if (propertyNumberField && data.propertyNumber) {
                          updatedFormData["x_national_registration_number"] =
                            data.propertyNumber;
                        }

                        // Хөрөнгийн төрөл
                        const propertyTypeField = dynamicFields.find(
                          (field) => field.name === "x_estimatetype"
                        );
                        if (propertyTypeField && data.intent) {
                          updatedFormData["x_estimatetype"] = data.intent;
                        }

                        // Талбай м.кв
                        const squareField = dynamicFields.find(
                          (field) => field.name === "x_build_plot_sq"
                        );
                        if (squareField && data.square) {
                          updatedFormData["x_build_plot_sq"] = data.square;
                        }

                        // Хаяг / тоот
                        const addressField = dynamicFields.find(
                          (field) => field.name === "x_address_street"
                        );
                        if (addressField) {
                          const fullAddress = [
                            data.addressDetail,
                            data.addressStreetName,
                            data.addressApartmentName,
                            data.addressRegionName,
                            data.addressTownName,
                          ]
                            .filter(Boolean)
                            .join(", ");
                          if (fullAddress) {
                            updatedFormData["x_address_street"] = fullAddress;
                          }
                        }

                        // Үл хөдлөх хөрөнгийн гэрчилгээний дугаар
                        const certificateField = dynamicFields.find(
                          (field) => field.name === "x_certificateno"
                        );
                        if (certificateField) {
                          if (data.certificateNumber) {
                            updatedFormData["x_certificateno"] =
                              data.certificateNumber;
                          } else if (
                            data.processList &&
                            data.processList.length > 0
                          ) {
                            const latestProcess =
                              data.processList[data.processList.length - 1];
                            if (latestProcess.certificateNumber) {
                              updatedFormData["x_certificateno"] =
                                latestProcess.certificateNumber;
                            }
                          }
                        }

                        // Байршил /аймаг, хот/
                        const cityField = dynamicFields.find(
                          (field) => field.name === "x_address_city_id"
                        );
                        if (cityField && data.aimagCityName) {
                          const cityOption = cityField.selection_ids?.find(
                            (opt) =>
                              opt.name
                                .toLowerCase()
                                .includes(data.aimagCityName.toLowerCase()) ||
                              data.aimagCityName
                                .toLowerCase()
                                .includes(opt.name.toLowerCase())
                          );
                          if (cityOption) {
                            updatedFormData["x_address_city_id"] =
                              cityOption.id.toString();
                          }
                        }

                        // Байршил /сум, дүүрэг/
                        const districtField = dynamicFields.find(
                          (field) => field.name === "x_district"
                        );
                        if (districtField && data.soumDistrictName) {
                          const districtOption =
                            districtField.selection_ids?.find(
                              (opt) =>
                                opt.name
                                  .toLowerCase()
                                  .includes(
                                    data.soumDistrictName.toLowerCase()
                                  ) ||
                                data.soumDistrictName
                                  .toLowerCase()
                                  .includes(opt.name.toLowerCase())
                            );
                          if (districtOption) {
                            updatedFormData["x_district"] =
                              districtOption.id.toString();
                          }
                        }

                        // Байршил /Баг, Хороо/
                        const bagKhorooField = dynamicFields.find(
                          (field) => field.name === "x_team_committee"
                        );
                        if (bagKhorooField && data.bagKhorooName) {
                          const bagKhorooOption =
                            bagKhorooField.selection_ids?.find(
                              (opt) =>
                                opt.name
                                  .toLowerCase()
                                  .includes(data.bagKhorooName.toLowerCase()) ||
                                data.bagKhorooName
                                  .toLowerCase()
                                  .includes(opt.name.toLowerCase())
                            );
                          if (bagKhorooOption) {
                            updatedFormData["x_team_committee"] =
                              bagKhorooOption.id.toString();
                          }
                        }
                      }

                      setFormData((prev) => ({
                        ...prev,
                        ...updatedFormData,
                      }));
                    }
                  }}
                />
              )}

              {/* 425, 426 үед гэр бүлийн мэдээлэл */}
              {selectedProductCode === "1210" &&
                ["425", "426"].includes(formData.product) && (
                  // button insurance owner or customer
                  <div className="bg-gray-200 rounded-xl p-2">
                    <div className="flex items-center gap-2 m-4">
                      <BsFillPassportFill
                        className="text-[#000080]"
                        size={18}
                      />

                      <h2 className="text-[20px] font-medium text-[#000080]">
                        Гэр бүлийн мэдээлэл
                      </h2>
                    </div>
                    {/* Customer Information */}
                    <div className=" mt-4 rounded-lg">
                      <TravelMember
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleDriversChange={handleDriversChange}
                        handleRelatedPartnersChange={
                          handleRelatedPartnersChange
                        }
                        selectedProductCode={selectedProductCode}
                      />
                    </div>
                  </div>
                )}

              {/* 423, 424 үед даатгуулагчийн мэдээлэл */}
              {selectedProductCode === "1210" &&
                ["423", "424"].includes(formData.product) && (
                  // button insurance owner or customer
                  <div className="bg-gray-200 rounded-xl p-2">
                    <div className="flex items-center gap-2 m-4">
                      <BsFillPassportFill
                        className="text-[#000080]"
                        size={18}
                      />

                      <h2 className="text-[20px] font-medium text-[#000080]">
                        Даатгуулагчийн мэдээлэл
                      </h2>
                    </div>
                    {/* Customer Information */}
                    <div className=" mt-4 rounded-lg">
                      <TravelUsers
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleDriversChange={handleDriversChange}
                        handleRelatedPartnersChange={
                          handleRelatedPartnersChange
                        }
                        selectedProductCode={selectedProductCode}
                      />
                    </div>
                  </div>
                )}

              {/* Dynamic Fields */}
              <DynamicFields
                dynamicFields={dynamicFields}
                formData={formData}
                handleInputChange={handleInputChange}
                onDynamicFieldChange={handleDynamicFieldChange}
                onFormDataChange={(name: string, value: string) => {
                  setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                  }));
                  // Алдааны мэдээллийг арилгах
                  if (validationErrors[name]) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors[name];
                      return newErrors;
                    });
                  }
                }}
                selectedDynamicValues={selectedDynamicValues}
                vehicleInfo={vehicleInfo}
                propertyData={propertyData}
                errors={validationErrors}
              />

              {selectedProductCode === "1210" && (
                <Assessment
                  formData={formData}
                  loading={loading}
                  products={products}
                  selectedProduct={selectedProduct}
                  filteredPackages={filteredPackages}
                  selectedPercentage={selectedPercentage}
                  handleInputChange={handleInputChange}
                  setSelectedProduct={setSelectedProduct}
                  selectedDynamicValues={selectedDynamicValues}
                />
              )}

              <div className="flex justify-end pt-6  border-blue-100">
                {/* submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-blue-600 w-full text-center align-center justify-center text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isEditMode ? "Хадгалж байна..." : "Үүсгэж байна..."}
                    </>
                  ) : (
                    isEditMode ? "Гэрээ хадгалах" : "Гэрээ үүсгэх"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      <LoadingModal isOpen={showLoadingModal} message="Гэрээ үүсгэж байна..." />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
}
