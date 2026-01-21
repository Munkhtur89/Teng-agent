"use client";
import React, { useEffect, useState } from "react";
import { BsFillPassportFill } from "react-icons/bs";
import {
  AssessmentProps,
  FeeCalculationRequest,
  FeeCalculationResponse,
} from "../types";
import { insuranceApi } from "@/lib/api";

const Assessment: React.FC<AssessmentProps> = ({
  formData,

  handleInputChange,
  selectedDynamicValues,
}) => {
  const [feeError, setFeeError] = useState<string | null>(null);
  const [feeDetails, setFeeDetails] = useState<
    FeeCalculationResponse["data"] | null
  >(null);
  const calculateFee = async () => {
    setFeeError(null);

    try {
      const requestData: FeeCalculationRequest = {
        packageId: Number(formData.product),
        evaluation: 0,
        couponCode: "",
        isCovid: selectedDynamicValues["x_is_covid"]
          ? selectedDynamicValues["x_is_covid"] === "true"
            ? 1
            : 0
          : 0,
        travelDaysId: selectedDynamicValues["x_travel_days_id"]
          ? Number(selectedDynamicValues["x_travel_days_id"])
          : undefined,
        countryGroupId: selectedDynamicValues["x_country_group_id"]
          ? Number(selectedDynamicValues["x_country_group_id"])
          : undefined,
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

      setFeeDetails(res as any);
    } catch (error) {
      console.error("Fee calculation error:", error);
      setFeeError("Хураамжийн тооцоолол хийхэд алдаа гарлаа");
      alert(feeError);
    }
  };

  useEffect(() => {
    calculateFee();
  }, [
    formData.product,
    formData.evaluation,
    formData.drivers,
    selectedDynamicValues["x_travel_days_id"],
    selectedDynamicValues["x_country_group_id"],
    selectedDynamicValues["x_is_covid"],
  ]);

  useEffect(() => {
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];

    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const formattedEndDate = endDate.toISOString().split("T")[0];

    handleInputChange({
      target: {
        name: "startDate",
        value: startDate,
      },
    } as React.ChangeEvent<HTMLInputElement>);

    handleInputChange({
      target: {
        name: "endDate",
        value: formattedEndDate,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 border border-blue-600 bg-[#f7f7f7]">
      {/* Тооцоолуурын гарчиг */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="radio"
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          checked={true}
          readOnly
        />
        <h2 className="text-lg font-semibold text-gray-800">
          Даатгалын тооцоолуур
        </h2>
      </div>

      {feeDetails && (
        <div>
          {/* Дээд хэсэг - 3 багана */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Ханш */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <div className="text-sm text-gray-500">Ханш</div>
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {feeDetails.rate}
              </div>
            </div>
          </div>

          {/* Тасархай шугам */}
          <div className="border-b border-dashed border-gray-300 mb-6"></div>

          {/* Доод хэсэг - 3 багана */}
          <div className="grid grid-cols-3 gap-6">
            {/* Үнэлгээ */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Үнэлгээ, ₮</div>
              <div className="text-2xl font-bold text-gray-800">
                {feeDetails.evaluation.toLocaleString("mn-MN")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
