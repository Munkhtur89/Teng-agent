import React, { useEffect } from "react";
import { FaRegIdCard } from "react-icons/fa";
import { DynamicField } from "../types";
import Select from "react-select";

interface PropertyData {
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
    certificateNumber?: string; // Үл хөдлөх хөрөнгийн гэрчилгээний дугаар
  }>;
  propertyNumber: string;
  soumDistrictCode: string;
  soumDistrictName: string;
  square: string;
  certificateNumber?: string; // Үндсэн гэрчилгээний дугаар
}

interface DynamicFieldsProps {
  dynamicFields: DynamicField[];
  formData: Record<string, any>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onDynamicFieldChange: (name: string, value: string) => void;
  onFormDataChange?: (name: string, value: string) => void; // Form data-г шууд өөрчлөх callback
  selectedDynamicValues: Record<string, string>;
  vehicleInfo?: any;
  propertyData?: PropertyData;
  errors?: Record<string, string>;
}

const DynamicFields: React.FC<DynamicFieldsProps> = ({
  dynamicFields,
  formData,
  handleInputChange,
  onDynamicFieldChange,
  onFormDataChange,
  selectedDynamicValues,
  vehicleInfo,
  propertyData,
  errors = {},
}) => {
  if (dynamicFields.length === 0) return null;

  console.log("---------->>>>>>>>>>>------>>>>", formData.product);
  console.log("vehicleInfo %?%%%?%", selectedDynamicValues);
  console.log("Property Data:", propertyData);

  // Property data-аас талбаруудыг автоматаар бөглөх
  useEffect(() => {
    if (propertyData && dynamicFields.length > 0) {
      // Улсын бүртгэлийн дугаар
      const propertyNumberField = dynamicFields.find(
        (field) => field.name === "x_national_registration_number"
      );
      if (propertyNumberField && propertyData.propertyNumber) {
        onDynamicFieldChange(
          "x_national_registration_number",
          propertyData.propertyNumber
        );
        // Form data-г шууд өөрчлөх
        if (onFormDataChange) {
          onFormDataChange(
            "x_national_registration_number",
            propertyData.propertyNumber
          );
        }
      }

      // Хөрөнгийн төрөл
      const propertyTypeField = dynamicFields.find(
        (field) => field.name === "x_estimatetype"
      );
      if (propertyTypeField && propertyData.intent) {
        onDynamicFieldChange("x_estimatetype", propertyData.intent);
        if (onFormDataChange) {
          onFormDataChange("x_estimatetype", propertyData.intent);
        }
      }

      // Талбай м.кв
      const squareField = dynamicFields.find(
        (field) => field.name === "x_build_plot_sq"
      );
      if (squareField && propertyData.square) {
        onDynamicFieldChange("x_build_plot_sq", propertyData.square);
        if (onFormDataChange) {
          onFormDataChange("x_build_plot_sq", propertyData.square);
        }
      }

      // Хаяг / тоот
      const addressField = dynamicFields.find(
        (field) => field.name === "x_address_street"
      );
      if (addressField) {
        // Хаягын бүх утгуудыг нэгтгэх
        const fullAddress = [
          propertyData.addressDetail,
          propertyData.addressStreetName,
          propertyData.addressApartmentName,
          propertyData.addressRegionName,
          propertyData.addressTownName,
        ]
          .filter(Boolean) // Хоосон утгуудыг арилгах
          .join(", "); // Таслалаар холбох

        if (fullAddress) {
          onDynamicFieldChange("x_address_street", fullAddress);
          if (onFormDataChange) {
            onFormDataChange("x_address_street", fullAddress);
          }
        }
      }

      // Үл хөдлөх хөрөнгийн гэрчилгээний дугаар
      const certificateField = dynamicFields.find(
        (field) => field.name === "x_certificateno"
      );
      if (certificateField) {
        // Эхлээд үндсэн certificateNumber-г шалгах
        if (propertyData.certificateNumber) {
          onDynamicFieldChange(
            "x_certificateno",
            propertyData.certificateNumber
          );
        }
        // Хэрэв үндсэн байхгүй бол processList-ээс хамгийн сүүлийн гэрчилгээг авах
        else if (
          propertyData.processList &&
          propertyData.processList.length > 0
        ) {
          const latestProcess =
            propertyData.processList[propertyData.processList.length - 1];
          if (latestProcess.certificateNumber) {
            onDynamicFieldChange(
              "x_certificateno",
              latestProcess.certificateNumber
            );
          }
        }
      }

      // Байршил /аймаг, хот/
      const cityField = dynamicFields.find(
        (field) => field.name === "x_address_city_id"
      );
      if (cityField && propertyData.aimagCityName) {
        const cityValue = getSelectValue(cityField);
        if (cityValue) {
          onDynamicFieldChange("x_address_city_id", cityValue);
        }
      }

      // Байршил /сум, дүүрэг/
      const districtField = dynamicFields.find(
        (field) => field.name === "x_district"
      );
      if (districtField && propertyData.soumDistrictName) {
        const districtValue = getSelectValue(districtField);
        if (districtValue) {
          onDynamicFieldChange("x_district", districtValue);
        }
      }

      // Байршил /Баг, Хороо/
      const bagKhorooField = dynamicFields.find(
        (field) => field.name === "x_team_committee"
      );
      if (bagKhorooField && propertyData.bagKhorooName) {
        const bagKhorooValue = getSelectValue(bagKhorooField);
        if (bagKhorooValue) {
          onDynamicFieldChange("x_team_committee", bagKhorooValue);
        }
      }
    }
  }, [propertyData, dynamicFields, onDynamicFieldChange]);

  // Custom handler for react-select
  const handleSelectChange = (fieldName: string) => (selectedOption: any) => {
    const event = {
      target: {
        name: fieldName,
        value: selectedOption ? selectedOption.value : "",
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    handleInputChange(event);
    onDynamicFieldChange(fieldName, selectedOption ? selectedOption.value : "");
  };

  // Property data-аас утга авах туслах функц
  const getPropertyValue = (fieldName: string): string => {
    if (!propertyData) return "";

    switch (fieldName) {
      case "x_national_registration_number":
        return propertyData.propertyNumber || "";
      case "x_estimatetype":
        return propertyData.intent || "";
      case "x_build_plot_sq":
        return propertyData.square || "";
      case "x_address_street":
        return (
          propertyData.aimagCityName ||
          propertyData.soumDistrictName ||
          propertyData.bagKhorooName ||
          propertyData.addressDetail ||
          propertyData.addressStreetName ||
          propertyData.addressApartmentName ||
          propertyData.addressRegionName ||
          propertyData.addressTownName ||
          ""
        );
      case "x_address_city_id":
        return propertyData.aimagCityName || "";
      case "x_district":
        return propertyData.soumDistrictName || "";
      case "x_team_committee":
        return propertyData.bagKhorooName || "";

      default:
        return "";
    }
  };

  // Select талбаруудад id утга олох туслах функц
  const getSelectValue = (field: DynamicField): string => {
    if (
      !propertyData ||
      !field.selection_ids ||
      field.selection_ids.length === 0
    ) {
      return "";
    }

    let searchValue = "";

    // Field name-ээс property data-аас утга авах
    switch (field.name) {
      case "x_address_city_id":
        searchValue = propertyData.aimagCityName;
        break;
      case "x_district":
        searchValue = propertyData.soumDistrictName;
        break;
      case "x_team_committee":
        searchValue = propertyData.bagKhorooName;
        break;
      default:
        return "";
    }

    if (!searchValue) return "";

    // selection_ids дотор тохирох option олох
    const matchingOption = field.selection_ids.find(
      (option) =>
        option.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        searchValue.toLowerCase().includes(option.name.toLowerCase())
    );

    return matchingOption ? matchingOption.id.toString() : "";
  };

  return (
    <div className="relative bg-gray-200 p-[2px] rounded-2xl ">
      <div className="flex items-center gap-2 m-4">
        <FaRegIdCard className="text-[#000080]" size={18} />
        <h2 className="text-[20px] font-medium text-[#000080]">
          Дэлгэрэнгүй мэдээлэл
        </h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm">
        {/* Dynamic Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dynamicFields.map((field: DynamicField, index: number) => {
              // Property data-аас утга авах
              const propertyValue = getPropertyValue(field.name);
              const selectValue = getSelectValue(field);

              // Select талбаруудад selectValue, бусадт propertyValue ашиглах
              const displayValue =
                formData[field.name] ||
                (field.type === "many2one" || field.type === "selection"
                  ? selectValue
                  : propertyValue) ||
                "";

              return (
                <div key={`${field.name}-${index}`} className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {field.type === "selection" &&
                  field.selection_ids &&
                  field.selection_ids.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        name={field.name}
                        value={displayValue}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors[field.name]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400`}
                        required={field.required}
                      >
                        <option value="">
                          {propertyValue
                            ? `${propertyValue} сонгох`
                            : "Сонгоно уу"}
                        </option>
                        {field.selection_ids.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field.name]}
                        </p>
                      )}
                      {propertyValue && !displayValue && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                          💡 API-аас ирж буй утга:{" "}
                          <strong>{propertyValue}</strong>
                        </div>
                      )}
                    </div>
                  ) : field.type === "many2one" &&
                    field.selection_ids &&
                    field.selection_ids.length > 0 ? (
                    <div className="space-y-2">
                      <Select
                        name={field.name}
                        value={
                          displayValue
                            ? {
                                value: displayValue,
                                label:
                                  field.selection_ids.find(
                                    (option) => option.id === displayValue
                                  )?.name || "",
                              }
                            : null
                        }
                        onChange={handleSelectChange(field.name)}
                        options={field.selection_ids.map((option) => ({
                          value: option.id,
                          label: option.name,
                        }))}
                        placeholder={
                          propertyValue
                            ? `${propertyValue} сонгох`
                            : "Сонгоно уу"
                        }
                        isClearable
                        isSearchable
                        className="w-full"
                        classNamePrefix="react-select"
                        required={field.required}
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderColor: state.isFocused
                              ? "#3b82f6"
                              : "#d1d5db",
                            boxShadow: state.isFocused
                              ? "0 0 0 2px rgba(59, 130, 246, 0.2)"
                              : "none",
                            "&:hover": {
                              borderColor: "#9ca3af",
                            },
                          }),
                        }}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field.name]}
                        </p>
                      )}
                      {propertyValue && !displayValue && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                          💡 API-аас ирж буй утга:{" "}
                          <strong>{propertyValue}</strong>
                        </div>
                      )}
                    </div>
                  ) : field.type === "boolean" ? (
                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-200">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={
                          formData[field.name] === "true" ||
                          selectedDynamicValues[field.name] === "true"
                        }
                        onChange={(e) => {
                          const value = e.target.checked ? "true" : "false";
                          onDynamicFieldChange(field.name, value);
                          // Form data-г шууд өөрчлөх
                          if (onFormDataChange) {
                            onFormDataChange(field.name, value);
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        required={field.required}
                      />
                      <span className="text-sm text-gray-600">Тийм</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type={
                          field.type === "char"
                            ? "text"
                            : field.type === "text"
                            ? "textarea"
                            : field.type === "integer" || field.type === "float"
                            ? "number"
                            : "text"
                        }
                        name={field.name}
                        value={displayValue}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors[field.name]
                            ? "border-red-500"
                            : propertyValue
                            ? "border-green-300"
                            : "border-gray-300"
                        } rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 ${
                          propertyValue ? "bg-green-50" : ""
                        }`}
                        required={field.required}
                        placeholder={`${field.label} оруулна уу`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field.name]}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFields;
