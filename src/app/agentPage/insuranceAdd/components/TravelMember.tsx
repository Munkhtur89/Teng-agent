"use client";
import React, { useState, useRef } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { xypApi } from "@/lib/api";
import { Driver, RelatedPartner } from "../types";
import toast from "react-hot-toast";

const mongolianLetterRegex = /[А-Яа-яӨөҮүЁё]/;
const englishLetterRegex = /[A-Za-z]/;

const sanitizeRegisterNumber = (value: string) => {
  let result = "";
  let letterCount = 0;

  for (const char of value.replace(/\s+/g, "")) {
    if (letterCount < 2) {
      if (mongolianLetterRegex.test(char)) {
        result += char.toUpperCase();
        letterCount += 1;
      }
    } else if (/[0-9]/.test(char)) {
      result += char;
    }
  }

  return result;
};

const sanitizeMongolianText = (value: string) =>
  value.replace(/[^А-Яа-яӨөҮүЁё\s-]/g, "");

interface DriverInfoProps {
  formData: Record<string, any>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDriversChange: (drivers: Driver[]) => void;
  handleRelatedPartnersChange: (relatedPartners: RelatedPartner[]) => void;
  selectedProductCode: string;
}

const TravelMember: React.FC<DriverInfoProps> = ({
  formData,
  handleDriversChange,
  selectedProductCode,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentDriver, setCurrentDriver] = useState<Driver>({
    id: Date.now().toString(),
    driverLastname: "",
    driverFirstname: "",
    driverRegisterNo: "",
    driverPhoneNumber: "",
    driverEmail: "",
    driverLicense: "",
    driverAddress: "",
    ownerPassportNumber: "",
  });
  const lastToastTimeRef = useRef<{ [key: string]: number }>({});

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalValue = e.target.value;
    const sanitizedValue = sanitizeRegisterNumber(originalValue);

    // Check if English letters are present
    if (englishLetterRegex.test(originalValue)) {
      const now = Date.now();
      const fieldKey = "driverRegisterNo";
      const lastToast = lastToastTimeRef.current[fieldKey] || 0;

      // Show toast only once per 2 seconds to prevent spam
      if (now - lastToast > 2000) {
        toast.error(
          "Регистрийн дугаар монголоор бичнэ үү. Эхний 2 орон монгол үсэг, үлдсэн хэсэг тоо байна."
        );
        lastToastTimeRef.current[fieldKey] = now;
      }

      e.target.value = sanitizedValue;
    }

    const { name } = e.target;
    setCurrentDriver((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalValue = e.target.value;
    const sanitizedValue = sanitizeMongolianText(originalValue);

    // Check if there are English letters in the input
    const hasEnglish = englishLetterRegex.test(originalValue);

    // If value changed (either English removed or other invalid chars removed)
    if (originalValue !== sanitizedValue) {
      // Show toast only if English letters were present
      if (hasEnglish) {
        const now = Date.now();
        const fieldKey = e.target.name;
        const lastToast = lastToastTimeRef.current[fieldKey] || 0;

        // Show toast only once per 2 seconds to prevent spam
        if (now - lastToast > 2000) {
          const fieldName =
            fieldKey === "driverLastname"
              ? "Овог"
              : fieldKey === "driverFirstname"
              ? "Нэр"
              : "";
          toast.error(`${fieldName} монголоор бичнэ үү.`);
          lastToastTimeRef.current[fieldKey] = now;
        }
      }
    }

    // Update the input element's value directly
    e.target.value = sanitizedValue;

    const { name } = e.target;
    setCurrentDriver((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const handleCurrentDriverChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCurrentDriver((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchCustomerInfo = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await xypApi.getInformations({ vat: keyword });
      if (!data || Object.keys(data).length === 0) {
        setSearchResults([]);
        alert("Даатгуулагчийн мэдээлэл олдсонгүй");
        return;
      }

      const results = Array.isArray(data) ? data : [data];
      setSearchResults(results);
    } catch (error) {
      console.error("Хайлтын алдаа:", error);
      setSearchResults([]);
      alert("Даатгуулагчийн мэдээлэл олдсонгүй. Гараар бөглөнө үү.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    searchCustomerInfo(searchKeyword);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
    }
  };

  const addDriver = async () => {
    const isRequiredFieldsValid =
      selectedProductCode === "1401"
        ? currentDriver.driverLastname &&
          currentDriver.driverFirstname &&
          currentDriver.driverRegisterNo
        : currentDriver.driverLastname && currentDriver.driverFirstname;

    if (isRequiredFieldsValid) {
      const existingDriver = (formData.drivers || []).find(
        (driver: Driver) =>
          driver.driverRegisterNo &&
          driver.driverRegisterNo === currentDriver.driverRegisterNo
      );

      if (existingDriver) {
        alert("Энэ регистрийн дугаартай хүн аль хэдийн нэмэгдсэн байна!");
        return;
      }

      const updatedDrivers = [
        ...(formData.drivers || []),
        { ...currentDriver },
      ];
      await handleDriversChange(updatedDrivers);

      setCurrentDriver({
        id: Date.now().toString(),
        driverLastname: "",
        driverFirstname: "",
        driverRegisterNo: "",
        driverPhoneNumber: "",
        driverEmail: "",
        driverLicense: "",
        driverAddress: "",
        ownerPassportNumber: "",
      });
    } else {
      alert(
        selectedProductCode === "1401"
          ? "Жолоочийн овог, нэр, регистрийн дугаар заавал оруулна уу"
          : "Зорчигчийн овог, нэр заавал оруулна уу"
      );
    }
  };

  const removeDriver = async (id: string) => {
    const updatedDrivers = (formData.drivers || []).filter(
      (driver: Driver) => driver.id !== id
    );
    await handleDriversChange(updatedDrivers);
  };

  const autoFillFromSearchResult = (result: any) => {
    setCurrentDriver({
      id: Date.now().toString(),
      driverLastname: result.lastname || result.surname || "",
      driverFirstname: result.firstname || "",
      driverRegisterNo: result.regnum || result.regnum || "",
      driverPhoneNumber: result.phone || "",
      driverLicense: result.passport || "",
      driverAddress: result.passportAddress || "",
      ownerPassportNumber: result.ownerPassportNumber || "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Хайлтын хэсэг - VehicleInfo style */}
      <div className="bg-[#0057C2] rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Гарчиг */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-[#0066D9] p-1 rounded-2xl border border-[#3388e0]">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 bg-white text-[#0057C2] shadow-lg"
              >
                Регистрийн дугаараар хайх
              </button>
            </div>
          </div>

          {/* Хайлтын input */}
          <div className="flex items-center gap-0 bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0] max-w-xl">
            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearchInputChange}
              placeholder="Регистрийн дугаар  хайх..."
              className="flex-1 bg-transparent text-white px-6 py-3 focus:outline-none placeholder-white border-none"
              style={{ height: "48px" }}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !searchKeyword.trim()}
              className="bg-[#FF7A1A] hover:bg-[#ff8c3a] text-white px-5 h-full flex items-center justify-center border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: "48px" }}
              title="Хайх"
            >
              {isSearching ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <IoSearch size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Хайлтын үр дүн */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <IoSearch className="text-blue-600" />
            Хайлтын үр дүн
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => autoFillFromSearchResult(result)}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl cursor-pointer hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg"
              >
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900 text-lg">
                    {result.lastname || result.surname || ""}{" "}
                    {result.firstname || ""}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">РД:</span>{" "}
                    {result.civilId || result.regnum || ""}
                  </div>
                  {result.passportAddress && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Хаяг:</span>{" "}
                      {result.passportAddress}
                    </div>
                  )}
                  {result.birthDateAsText && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Төрсөн огноо:</span>{" "}
                      {result.birthDateAsText.split(" ")[0]}
                    </div>
                  )}
                  {result.gender && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Хүйс:</span> {result.gender}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Мэдээлэл оруулах хэсэг */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Овог
            </label>
            <input
              type="text"
              name="driverLastname"
              value={currentDriver.driverLastname || ""}
              onChange={handleNameChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
              placeholder="Овог оруулна уу"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Нэр
            </label>
            <input
              type="text"
              name="driverFirstname"
              value={currentDriver.driverFirstname || ""}
              onChange={handleNameChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
              placeholder="Нэр оруулна уу"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Регистрийн дугаар
            </label>
            <input
              type="text"
              name="driverRegisterNo"
              value={currentDriver.driverRegisterNo || ""}
              onChange={handleRegisterChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
              placeholder="Регистрийн дугаар"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Утасны дугаар
            </label>
            <input
              type="tel"
              name="driverPhoneNumber"
              value={currentDriver.driverPhoneNumber || ""}
              onChange={handleCurrentDriverChange}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
              placeholder="Утасны дугаар"
            />
          </div>

          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Паспортын дугаар
              </label>
              <input
                type="text"
                name="ownerPassportNumber"
                value={currentDriver.ownerPassportNumber || ""}
                onChange={handleCurrentDriverChange}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                placeholder="PE123123"
              />
            </div>
          </>

          <div className="flex items-end">
            <button
              type="button"
              onClick={addDriver}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <FaPlus size={18} />
              {selectedProductCode === "1401" && <span>Жолооч нэмэх</span>}
              {(selectedProductCode === "1210" ||
                selectedProductCode === "1212" ||
                selectedProductCode === "1206" ||
                selectedProductCode === "1203") && <span>Зорчигч нэмэх</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Жолоочийн мэдээллийн хүснэгт */}
      {(formData.drivers || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Овог
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Нэр
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Регистрийн дугаар
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Утасны дугаар
                  </th>
                  {formData.product === "425" || formData.product === "426" ? (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Гадаад паспортын дугаар
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Эзэмшигчийн паспортын дугаар
                      </th>
                    </>
                  ) : (
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Хаяг
                    </th>
                  )}
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {(formData.drivers || []).map(
                  (driver: Driver, index: number) => (
                    <tr
                      key={driver.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50"
                      } hover:bg-blue-100 transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.driverLastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.driverFirstname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {driver.driverRegisterNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {driver.driverPhoneNumber}
                      </td>
                      {formData.product === "425" ||
                      formData.product === "426" ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {driver.driverLicense}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {driver.ownerPassportNumber}
                          </td>
                        </>
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driver.driverAddress}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => removeDriver(driver.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow hover:shadow-lg font-medium"
                        >
                          <FaTrash size={14} />
                          Устгах
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelMember;
