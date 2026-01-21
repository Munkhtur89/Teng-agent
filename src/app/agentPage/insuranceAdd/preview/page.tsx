"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { LoadingModal } from "@/components";
import {
  FormData,
  InsurancePackageWithRisks,
  InsuranceProduct,
  DynamicField,
  Driver,
  VehicleInfo,
  PropertyData,
  FeeCalculationRequest,
  FeeCalculationResponse,
} from "../types";
import { insuranceApi } from "@/lib/api";
import { IoArrowBack } from "react-icons/io5";

export default function PreviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [selectedProductCode, setSelectedProductCode] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [insurancePackages, setInsurancePackages] = useState<
    InsurancePackageWithRisks[]
  >([]);
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | undefined>(
    undefined
  );
  const [feeDetails, setFeeDetails] = useState<
    FeeCalculationResponse["data"] | null
  >(null);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [insuranceId, setInsuranceId] = useState<string | null>(null);
  const [contractsData, setContractsData] = useState<any>(null);

  useEffect(() => {
    // localStorage-аас мэдээлэл авах
    const savedFormData = localStorage.getItem("contractPreviewData");
    const savedSelectedProductCode = localStorage.getItem(
      "contractPreviewSelectedProductCode"
    );
    const savedSelectedProduct = localStorage.getItem(
      "contractPreviewSelectedProduct"
    );
    const savedDynamicFields = localStorage.getItem(
      "contractPreviewDynamicFields"
    );
    const savedVehicleInfo = localStorage.getItem("contractPreviewVehicleInfo");
    const savedPropertyData = localStorage.getItem(
      "contractPreviewPropertyData"
    );

    if (!savedFormData) {
      // Хэрэв мэдээлэл байхгүй бол буцах
      router.push("/agentPage/insuranceAdd");
      return;
    }

    try {
      setFormData(JSON.parse(savedFormData));
      setSelectedProductCode(savedSelectedProductCode || "");
      setSelectedProduct(savedSelectedProduct || "");
      if (savedDynamicFields) {
        setDynamicFields(JSON.parse(savedDynamicFields));
      }
      if (savedVehicleInfo) {
        setVehicleInfo(JSON.parse(savedVehicleInfo));
      }
      if (savedPropertyData) {
        setPropertyData(JSON.parse(savedPropertyData));
      }

      // Edit mode мэдээллийг авах
      const savedIsEditMode = localStorage.getItem("contractPreviewIsEditMode");
      const savedInsuranceId = localStorage.getItem("contractPreviewInsuranceId");
      const savedContractsData = localStorage.getItem("contractPreviewContractsData");

      if (savedIsEditMode === "true" && savedInsuranceId) {
        setIsEditMode(true);
        setInsuranceId(savedInsuranceId);
        if (savedContractsData) {
          setContractsData(JSON.parse(savedContractsData));
        }
      }
    } catch (error) {
      console.error("Error parsing saved data:", error);
      router.push("/agentPage/insuranceAdd");
      return;
    }

    // Insurance packages болон products татах
    fetchInsurances();
  }, [router]);

  // Хураамжийн тооцоолол (ялангуяа 1210 гадаад аялал дээр)
  useEffect(() => {
    const calculateFee = async () => {
      if (!formData) return;
      // Зөвхөн пакет сонгогдсон үед тооцоолно
      if (!formData.product) return;

      try {
        setFeeError(null);

        const requestData: FeeCalculationRequest = {
          packageId: Number(formData.product),
          evaluation: Number(formData.evaluation || 0),
          couponCode: "",
          travelDaysId: formData.x_travel_days_id
            ? Number(formData.x_travel_days_id)
            : undefined,
          countryGroupId: formData.x_country_group_id
            ? Number(formData.x_country_group_id)
            : undefined,
          isCovid:
            formData.x_is_covid === "true" || formData.x_is_covid === 1 ? 1 : 0,
          travelMembers:
            formData.drivers && Array.isArray(formData.drivers)
              ? formData.drivers.map((driver) => ({
                  firstname: driver.driverFirstname || "",
                  lastname: driver.driverLastname || "",
                  register: driver.driverRegisterNo || "",
                }))
              : [],
        };

        const res = await insuranceApi.feeCalculation(requestData);
        const data = (res as any)?.data ?? (res as any);
        setFeeDetails(data as FeeCalculationResponse["data"]);
      } catch (error) {
        console.error("Fee calculation error on preview:", error);
        setFeeError("Хураамжийн тооцоолол хийхэд алдаа гарлаа");
      }
    };

    calculateFee();
  }, [formData]);

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setInsurancePackages(data.packages || []);
      setLoading(false);
    } catch (err: any) {
      console.error("API алдааны мэдээлэл:", err);
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!formData) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowLoadingModal(true);

    try {
      const token = Cookies.get("authToken");

      // Dynamic fields
      const dynamicValues: Record<string, string> = {};
      dynamicFields.forEach((field: DynamicField) => {
        dynamicValues[field.name] = formData[field.name] || "";
      });

      // Remove duplicate drivers based on registration number
      const uniqueDrivers = (formData.drivers || []).filter(
        (driver: Driver, index: number, self: Driver[]) => {
          if (!driver.driverRegisterNo) return true;
          return (
            index ===
            self.findIndex(
              (d: Driver) => d.driverRegisterNo === driver.driverRegisterNo
            )
          );
        }
      );

      let contractData: any;

      // 1. 1210 болон 425, 426 үед related_partners-ийг contract дотор оруулах
      if (
        selectedProductCode === "1210" &&
        (formData.product === "425" || formData.product === "426")
      ) {
        contractData = {
          branchCode: "Branch 220",
          startDate: formData.startDate,
          endDate: formData.endDate,
          paymentDivide: Number(formData.paymentDivide || 1),
          partnerLastname: formData.partnerLastname,
          partnerFirstname: formData.partnerFirstname,
          partnerRegisterNo: formData.partnerRegisterNo,
          partnerPhoneNumber: formData.partnerPhoneNumber,
          partnerEmail: formData.partnerEmail,
          partnerAddress: formData.partnerAddress,
          contracts: [
            {
              itemEvaluation: formData.evaluation,
              packageId: Number(formData.product),
              ownerLastname: formData.ownerLastname,
              ownerFirstname: formData.ownerFirstname,
              ownerRegisterNo: formData.ownerRegisterNo,
              ownerAddress: formData.ownerAddress,
              ownerPhoneNumber: formData.ownerPhoneNumber,
              ownerEmail: formData.ownerEmail,
              couponCode: formData.couponCode || "",
              dynamic_fields: dynamicValues,
              related_partners: uniqueDrivers.map((driver) => ({
                firstname: driver.driverFirstname || "",
                lastname: driver.driverLastname || "",
                register_number: driver.driverRegisterNo || "",
                passport_number:
                  driver.ownerPassportNumber || driver.driverLicense || "",
              })),
            },
          ],
          signature: formData.signature || "",
        };
      } else if (
        selectedProductCode === "1401" ||
        selectedProductCode === "1212" ||
        selectedProductCode === "1206" ||
        selectedProductCode === "1203"
      ) {
        // Даатгуулагчийн мэдээлэл
        const ownerContract = {
          itemEvaluation: formData.evaluation,
          packageId: Number(formData.product),
          ownerLastname: formData.ownerLastname,
          ownerFirstname: formData.ownerFirstname,
          ownerRegisterNo: formData.ownerRegisterNo,
          ownerAddress: formData.ownerAddress,
          ownerPhoneNumber: formData.ownerPhoneNumber,
          ownerEmail: formData.ownerEmail,
          couponCode: "",
          dynamic_fields: dynamicValues,
        };

        // Жолооч нарын мэдээлэл
        const driverContracts = uniqueDrivers.map((driver) => ({
          itemEvaluation: formData.evaluation,
          packageId: Number(formData.product),
          ownerLastname: driver.driverLastname,
          ownerFirstname: driver.driverFirstname,
          ownerRegisterNo: driver.driverRegisterNo,
          ownerAddress: "",
          ownerPhoneNumber: driver.driverPhoneNumber,
          ownerEmail: driver.driverEmail,
          couponCode: "",
          dynamic_fields: dynamicValues,
        }));

        contractData = {
          branchCode: "Branch 220",
          startDate: formData.startDate,
          endDate: formData.endDate,
          paymentDivide: Number(formData.paymentDivide || 1),
          partnerLastname: formData.partnerLastname,
          partnerFirstname: formData.partnerFirstname,
          partnerRegisterNo: formData.partnerRegisterNo,
          partnerPhoneNumber: formData.partnerPhoneNumber,
          partnerAddress: formData.partnerAddress,
          partnerEmail: formData.partnerEmail,
          contracts: [ownerContract, ...driverContracts],
          signature: formData.signature || "",
        };
      } else if (selectedProductCode === "1210") {
        // 1210 - Нэмэлт Даатгуулагч: зөвхөн жолооч нарын мэдээлэл
        const driverContracts = uniqueDrivers.map((driver) => ({
          itemEvaluation: formData.evaluation,
          packageId: Number(formData.product),
          ownerLastname: driver.driverLastname,
          ownerFirstname: driver.driverFirstname,
          ownerPassportNumber: driver.ownerPassportNumber,
          ownerRegisterNo: driver.driverRegisterNo,
          ownerAddress: "",
          ownerPhoneNumber: driver.driverPhoneNumber,
          ownerEmail: driver.driverEmail,
          couponCode: "",
          dynamic_fields: dynamicValues,
        }));

        contractData = {
          branchCode: "Branch 220",
          startDate: formData.startDate,
          endDate: formData.endDate,
          paymentDivide: Number(formData.paymentDivide || 1),
          partnerLastname: formData.partnerLastname,
          partnerFirstname: formData.partnerFirstname,
          partnerRegisterNo: formData.partnerRegisterNo,
          partnerPhoneNumber: formData.partnerPhoneNumber,
          partnerAddress: formData.partnerAddress,
          partnerEmail: formData.partnerEmail,
          contracts: driverContracts,
          signature: formData.signature || "",
        };
      } else {
        contractData = {
          branchCode: "Branch 220",
          startDate: formData.startDate,
          endDate: formData.endDate,
          paymentDivide: formData.paymentDivide || 1,
          partnerLastname: formData.partnerLastname,
          partnerFirstname: formData.partnerFirstname,
          partnerRegisterNo: formData.partnerRegisterNo,
          partnerPhoneNumber: formData.partnerPhoneNumber,
          partnerEmail: formData.partnerEmail,
          partnerAddress: formData.partnerAddress,
          contracts: [
            {
              itemEvaluation: formData.evaluation,
              packageId: Number(formData.product),
              ownerLastname: formData.ownerLastname,
              ownerFirstname: formData.ownerFirstname,
              ownerRegisterNo: formData.ownerRegisterNo,
              ownerAddress: formData.ownerAddress,
              ownerPhoneNumber: formData.ownerPhoneNumber,
              ownerEmail: formData.ownerEmail,
              driver_ids: uniqueDrivers.map((driver) => ({
                firstname: driver.driverFirstname || "",
                lastname: driver.driverLastname || "",
                register_number: driver.driverRegisterNo || "",
                phone_number: driver.driverPhoneNumber || "",
                email: driver.driverEmail || "",
              })),
              dynamic_fields: dynamicValues,
            },
          ],
          signature: "",
        };
      }

      // Edit mode бол update API, үгүй бол create API
      let apiUrl: string;
      let requestData: any;

      if (isEditMode && insuranceId && contractsData) {
        // Update API руу явуулах формат
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/insurance/update`;
        
        // Contracts-д contractId болон related_partners-д id нэмэх
        const contractsWithIds = contractData.contracts.map((contract: any, index: number) => {
          const savedContract = contractsData.contracts?.[index];
          const updatedContract: any = {
            ...contract,
            contractId: savedContract?.contractId || undefined,
          };

          // related_partners-д id нэмэх
          if (contract.related_partners && savedContract?.related_partners) {
            updatedContract.related_partners = contract.related_partners.map((partner: any, pIndex: number) => {
              const savedPartner = savedContract.related_partners?.[pIndex];
              return {
                ...partner,
                id: savedPartner?.id || undefined,
              };
            });
          }

          return updatedContract;
        });

        requestData = {
          insuranceId: Number(insuranceId),
          ...contractData,
          contracts: contractsWithIds,
        };
      } else {
        // Create API
        apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/agent/insurance/create`;
        requestData = contractData;
      }

      console.log("Request data:", requestData);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token || ""}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log(isEditMode ? "Contract updated:----" : "Contract created:----", result);

      // localStorage-аас мэдээлэл устгах
      localStorage.removeItem("contractPreviewData");
      localStorage.removeItem("contractPreviewSelectedProductCode");
      localStorage.removeItem("contractPreviewSelectedProduct");
      localStorage.removeItem("contractPreviewDynamicFields");
      localStorage.removeItem("contractPreviewVehicleInfo");
      localStorage.removeItem("contractPreviewPropertyData");
      localStorage.removeItem("contractPreviewIsEditMode");
      localStorage.removeItem("contractPreviewInsuranceId");
      localStorage.removeItem("contractPreviewContractsData");

      // Get insuranceId from response and redirect
      const redirectId = result?.insuranceId || insuranceId;
      if (redirectId) {
        window.location.href = `/agentPage/${redirectId}`;
      } else {
        alert(isEditMode ? "Гэрээ хадгалахад алдаа гарлаа" : "Гэрээ үүсгэхэд алдаа гарлаа");
      }
    } catch (err: any) {
      console.error("API алдааны мэдээлэл:", err);
      alert("Гэрээ үүсгэхэд алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
      setShowLoadingModal(false);
    }
  };

  const handleBack = () => {
    router.push("/agentPage/insuranceAdd");
  };

  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const selectedPackage = insurancePackages.find(
    (pkg) => pkg.packageId === Number(formData.product)
  );
  const selectedProductName = products.find(
    (p) => p.productCode === selectedProduct
  )?.productName;

  return (
    <div className="min-h-screen relative bg-gray-200">
      <div className="container mx-auto pt-6 pb-20">
        <div className="space-y-8">
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out border border-blue-400/20"
                >
                  <div className="flex items-center justify-center w-6 h-6 group-hover:bg-blue-500 rounded-full transition-all duration-300">
                    <IoArrowBack
                      size={16}
                      className="text-white group-hover:text-white transition-colors"
                    />
                  </div>
                  <span className="font-semibold text-sm">Буцах</span>
                </button>
              </div>

              <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
                {isEditMode ? "Гэрээ засах - Урьдчилан харах" : "Гэрээний мэдээлэл"}
              </h1>
            </div>

            <div className="bg-white p-8 rounded-xl space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  Үндсэн мэдээлэл
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Даатгалын бүтээгдэхүүн
                    </p>
                    <p className="font-medium">{selectedProductName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Даатгалын багц</p>
                    <p className="font-medium">
                      {selectedPackage?.packageName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Эхлэх огноо</p>
                    <p className="font-medium">{formData.startDate || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Дуусах огноо</p>
                    <p className="font-medium">{formData.endDate || "-"}</p>
                  </div>
                  {formData.evaluation > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Үнэлгээ</p>
                      <p className="font-medium">
                        {formData.evaluation.toLocaleString()} ₮
                      </p>
                    </div>
                  )}
                  {formData.commission > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Комисс</p>
                      <p className="font-medium">
                        {formData.commission.toLocaleString()} ₮
                      </p>
                    </div>
                  )}
                  {feeDetails && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">
                          Нэг даатгуулагчийн хураамж, ₮
                        </p>
                        <p className="font-medium">
                          {(
                            feeDetails.total_fee /
                            (feeDetails.insuree_count &&
                            feeDetails.insuree_count > 0
                              ? feeDetails.insuree_count
                              : 1)
                          ).toLocaleString("mn-MN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Нийт хураамж, ₮</p>
                        <p className="font-medium">
                          {feeDetails.total_fee.toLocaleString("mn-MN")}
                        </p>
                      </div>
                    </>
                  )}
                  {feeError && (
                    <div className="col-span-2">
                      <p className="text-sm text-red-600">{feeError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              {(selectedProductCode !== "1304" &&
                selectedProductCode !== "1217" &&
                selectedProductCode !== "1302" &&
                selectedProductCode !== "1205" &&
                selectedProductCode !== "1210" &&
                selectedProductCode !== "1306") ||
              (selectedProductCode === "1210" &&
                ["425", "426"].includes(formData.product)) ? (
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-blue-900 mb-4">
                    Даатгуулагчийн мэдээлэл
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Овог</p>
                      <p className="font-medium">
                        {formData.ownerLastname || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Нэр</p>
                      <p className="font-medium">
                        {formData.ownerFirstname || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Регистрийн дугаар</p>
                      <p className="font-medium">
                        {formData.ownerRegisterNo || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Утасны дугаар</p>
                      <p className="font-medium">
                        {formData.ownerPhoneNumber || "-"}
                      </p>
                    </div>
                    {formData.ownerEmail && (
                      <div>
                        <p className="text-sm text-gray-600">И-мэйл</p>
                        <p className="font-medium">
                          {formData.ownerEmail || "-"}
                        </p>
                      </div>
                    )}
                    {formData.ownerAddress && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Хаяг</p>
                        <p className="font-medium">
                          {formData.ownerAddress || "-"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Vehicle Information */}
              {(selectedProductCode === "1401" ||
                selectedProductCode === "1403" ||
                selectedProductCode === "1206" ||
                selectedProductCode === "1406" ||
                selectedProductCode === "1407" ||
                selectedProductCode === "2001" ||
                selectedProductCode === "1402" ||
                selectedProductCode === "1305" ||
                selectedProductCode === "1404" ||
                selectedProductCode === "1203") &&
              formData.plateNumber ? (
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-blue-900 mb-4">
                    Тээврийн хэрэгслийн мэдээлэл
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Улсын дугаар</p>
                      <p className="font-medium">
                        {formData.plateNumber || "-"}
                      </p>
                    </div>
                    {vehicleInfo && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Марк</p>
                          <p className="font-medium">
                            {vehicleInfo.markName || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Загвар</p>
                          <p className="font-medium">
                            {vehicleInfo.modelName || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Үйлдвэрлэсэн он
                          </p>
                          <p className="font-medium">
                            {vehicleInfo.buildYear || "-"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Driver Information */}
              {(selectedProductCode === "1206" ||
                selectedProductCode === "1203" ||
                (selectedProductCode === "1210" &&
                  ["423", "424", "425", "426"].includes(formData.product))) &&
              formData.drivers &&
              formData.drivers.length > 0 ? (
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-blue-900 mb-4">
                    {selectedProductCode === "1210"
                      ? "Даатгуулагч нарын мэдээлэл"
                      : "Жолооч нарын мэдээлэл"}
                  </h2>
                  <div className="space-y-4">
                    {formData.drivers.map((driver, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <h3 className="font-medium text-gray-800 mb-2">
                          {selectedProductCode === "1210"
                            ? `Даатгуулагч #${index + 1}`
                            : `Жолооч #${index + 1}`}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Овог</p>
                            <p className="font-medium">
                              {driver.driverLastname || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Нэр</p>
                            <p className="font-medium">
                              {driver.driverFirstname || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Регистрийн дугаар
                            </p>
                            <p className="font-medium">
                              {driver.driverRegisterNo || "-"}
                            </p>
                          </div>
                          {driver.driverPhoneNumber && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Утасны дугаар
                              </p>
                              <p className="font-medium">
                                {driver.driverPhoneNumber || "-"}
                              </p>
                            </div>
                          )}
                          {driver.ownerPassportNumber && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Паспортын дугаар
                              </p>
                              <p className="font-medium">
                                {driver.ownerPassportNumber || "-"}
                              </p>
                            </div>
                          )}
                          {driver.driverEmail && (
                            <div>
                              <p className="text-sm text-gray-600">И-мэйл</p>
                              <p className="font-medium">
                                {driver.driverEmail || "-"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Related Partners Information (for 1210 with 425, 426) */}
              {selectedProductCode === "1210" &&
                ["425", "426"].includes(formData.product) &&
                formData.relatedPartners &&
                formData.relatedPartners.length > 0 && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">
                      Гэр бүлийн гишүүдийн мэдээлэл
                    </h2>
                    <div className="space-y-4">
                      {formData.relatedPartners.map((partner, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <h3 className="font-medium text-gray-800 mb-2">
                            Гишүүн #{index + 1}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Овог</p>
                              <p className="font-medium">
                                {partner.lastname || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Нэр</p>
                              <p className="font-medium">
                                {partner.firstname || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Регистрийн дугаар
                              </p>
                              <p className="font-medium">
                                {partner.register_number || "-"}
                              </p>
                            </div>
                            {partner.passport_number && (
                              <div>
                                <p className="text-sm text-gray-600">
                                  Паспортын дугаар
                                </p>
                                <p className="font-medium">
                                  {partner.passport_number || "-"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Dynamic Fields */}
              {dynamicFields.length > 0 && (
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-blue-900 mb-4">
                    Нэмэлт мэдээлэл
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {dynamicFields.map((field) => {
                      const rawValue = formData[field.name];
                      if (
                        rawValue === undefined ||
                        rawValue === null ||
                        rawValue === ""
                      )
                        return null;

                      // Хэрвээ сонголттой (selection_ids) талбар бол id-гаар нь name-ийг нь харуулна
                      let displayValue: string | number = rawValue;
                      if (
                        field.selection_ids &&
                        field.selection_ids.length > 0
                      ) {
                        const selectedOption = field.selection_ids.find(
                          (opt) =>
                            String(opt.id) === String(rawValue) ||
                            opt.name === String(rawValue)
                        );
                        if (selectedOption) {
                          displayValue = selectedOption.name;
                        }
                      }

                      return (
                        <div key={field.id}>
                          <p className="text-sm text-gray-600">{field.label}</p>
                          <p className="font-medium">
                            {String(displayValue) || "-"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Буцах
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className={`bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg ${
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
                    isEditMode ? "Хадгалах" : "Баталгаажуулах"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoadingModal isOpen={showLoadingModal} message={isEditMode ? "Гэрээ хадгалж байна..." : "Гэрээ үүсгэж байна..."} />
    </div>
  );
}
