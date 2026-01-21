import React, { useState, useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { CustomerInfoProps } from "../types";
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

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  formData,
  handleInputChange,
  onSearch,
  isSearching,
  searchType: externalSearchType,
  onSearchTypeChange,
  errors = {},
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [internalSearchType, setInternalSearchType] = useState<
    "individual" | "organization"
  >("individual");
  const searchType = externalSearchType || internalSearchType;
  const lastToastTimeRef = useRef<{ [key: string]: number }>({});

  const handleSearchTypeChange = (type: "individual" | "organization") => {
    if (onSearchTypeChange) {
      onSearchTypeChange(type);
    } else {
      setInternalSearchType(type);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert("Регистрийн дугаар оруулна уу");
      return;
    }
    try {
      await onSearch(searchKeyword, searchType);
    } catch (e) {
      console.error("Хайлт амжилтгүй:", e);
    }
  };

  const handleSanitizedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    sanitizer: (value: string) => string
  ) => {
    const originalValue = e.target.value;
    const sanitizedValue = sanitizer(originalValue);
    if (sanitizedValue !== originalValue) {
      e.target.value = sanitizedValue;
    }
    handleInputChange(e);
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalValue = e.target.value;
    const sanitizedValue = sanitizeRegisterNumber(originalValue);

    // Check if English letters are present
    if (englishLetterRegex.test(originalValue)) {
      const now = Date.now();
      const fieldKey = "registerNo";
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

    handleInputChange(e);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalValue = e.target.value;
    const sanitizedValue = sanitizeMongolianText(originalValue);

    // Check if there are English letters in the input
    const hasEnglish = englishLetterRegex.test(originalValue);

    // Map component field names to formData field names
    const nameMapping: { [key: string]: string } = {
      ownerLastName: "ownerLastname",
      ownerFirstName: "ownerFirstname",
    };

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
            fieldKey === "ownerLastName"
              ? "Овог"
              : fieldKey === "ownerFirstName"
              ? "Нэр"
              : "Байгуулгын нэр";
          toast.error(`${fieldName} монголоор бичнэ үү.`);
          lastToastTimeRef.current[fieldKey] = now;
        }
      }
    }

    // Update the input element's value directly
    e.target.value = sanitizedValue;

    // Map the name to formData field name and update form state
    const formDataFieldName = nameMapping[e.target.name] || e.target.name;
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: formDataFieldName,
        value: sanitizedValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);
  };

  return (
    <div className="relative bg-gray-200 p-[2px] rounded-2xl">
      {/* Даатгуулагчийн мэдээлэл */}
      <div className="bg-white rounded-xl border border-gray-100">
        {/* Хайх хэсэг */}
        <div className="bg-[#0057C2] rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Хайлтын төрөл сонгох товчлуур */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2 bg-[#0066D9] p-1 rounded-2xl border border-[#3388e0]">
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange("individual")}
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 ${
                    searchType === "individual"
                      ? "bg-white text-[#0057C2] shadow-lg"
                      : "text-white hover:bg-[#0066D9]"
                  }`}
                >
                  Иргэний мэдээлэл
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchTypeChange("organization")}
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 ${
                    searchType === "organization"
                      ? "bg-white text-[#0057C2] shadow-lg"
                      : "text-white hover:bg-[#0066D9]"
                  }`}
                >
                  Байгуулгын мэдээлэл
                </button>
              </div>
            </div>

            {/* Хайлтын input */}
            <div className="flex items-center gap-0  bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0] max-w-xl">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={
                  searchType === "organization"
                    ? "Байгуулгын регистрийн дугаар"
                    : "Регистрийн дугаар (УБ00000000)"
                }
                className="flex-1 bg-transparent text-white px-6 py-3 focus:outline-none placeholder-white border-none"
                style={{ height: "48px" }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4">
          {searchType === "individual" ? (
            <>
              <div className="w-full h-12 relative flex rounded-xl">
                <input
                  className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                    errors.ownerLastName ? "border-red-500" : "border-[#4070f4]"
                  } focus:shadow-md`}
                  id="ownerLastName"
                  name="ownerLastName"
                  type="text"
                  placeholder="Овог"
                  value={formData.ownerLastName}
                  onChange={handleNameChange}
                />
                <label
                  className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                    errors.ownerLastName ? "text-red-500" : "text-gray-500"
                  }`}
                  htmlFor="ownerLastName"
                >
                  Овог <span className="text-red-500">*</span>
                </label>
                {errors.ownerLastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ownerLastName}
                  </p>
                )}
              </div>

              <div className="w-full h-12 relative flex rounded-xl">
                <input
                  className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                    errors.ownerFirstName
                      ? "border-red-500"
                      : "border-[#4070f4]"
                  } focus:shadow-md`}
                  id="ownerFirstName"
                  name="ownerFirstName"
                  type="text"
                  placeholder="Нэр"
                  value={formData.ownerFirstName}
                  onChange={handleNameChange}
                />
                <label
                  className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                    errors.ownerFirstName ? "text-red-500" : "text-gray-500"
                  }`}
                  htmlFor="ownerFirstName"
                >
                  Нэр <span className="text-red-500">*</span>
                </label>
                {errors.ownerFirstName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.ownerFirstName}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-12 relative flex rounded-xl md:col-span-2">
              <input
                className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                  errors.ownerFirstName ? "border-red-500" : "border-[#4070f4]"
                } focus:shadow-md`}
                id="ownerFirstName"
                name="ownerFirstName"
                type="text"
                placeholder="Байгуулгын нэр"
                value={formData.ownerFirstName}
                onChange={handleNameChange}
              />
              <label
                className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                  errors.ownerFirstName ? "text-red-500" : "text-gray-500"
                }`}
                htmlFor="ownerFirstName"
              >
                Байгуулгын нэр <span className="text-red-500">*</span>
              </label>
              {errors.ownerFirstName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.ownerFirstName}
                </p>
              )}
            </div>
          )}

          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.ownerRegisterNo ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="ownerRegisterNo"
              name="ownerRegisterNo"
              placeholder={
                searchType === "organization"
                  ? "Байгуулгын регистрийн дугаар"
                  : "УБ00000000"
              }
              type="text"
              value={formData.ownerRegisterNo}
              onChange={handleRegisterChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.ownerRegisterNo ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="ownerRegisterNo"
            >
              {searchType === "organization"
                ? "Байгуулгын регистрийн дугаар"
                : "Регистрийн дугаар"}{" "}
              <span className="text-red-500">*</span>
            </label>

            {errors.ownerRegisterNo && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.ownerRegisterNo}
              </p>
            )}
          </div>

          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.ownerPhoneNumber ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="ownerPhoneNumber"
              name="ownerPhoneNumber"
              type="tel"
              value={formData.ownerPhoneNumber}
              placeholder="099999999"
              onChange={handleInputChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.ownerPhoneNumber ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="ownerPhoneNumber"
            >
              {searchType === "organization"
                ? "Байгуулгын утас"
                : "Утасны дугаар"}{" "}
              <span className="text-red-500">*</span>
            </label>

            {errors.ownerPhoneNumber && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.ownerPhoneNumber}
              </p>
            )}
          </div>

          {searchType === "individual" && (
            <div className="w-full h-12 relative flex rounded-xl">
              <input
                className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                  errors.ownerAddress ? "border-red-500" : "border-[#4070f4]"
                } focus:shadow-md`}
                id="ownerAddress"
                name="ownerAddress"
                type="text"
                placeholder="Хаяг"
                value={formData.ownerAddress}
                onChange={handleInputChange}
              />

              <label
                className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                  errors.ownerAddress ? "text-red-500" : "text-gray-500"
                }`}
                htmlFor="ownerAddress"
              >
                Оршин суугчийн хаяг <span className="text-red-500">*</span>
              </label>
              {errors.ownerAddress && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.ownerAddress}
                </p>
              )}
            </div>
          )}

          {searchType === "organization" && (
            <div className="w-full h-12 relative flex rounded-xl">
              <input
                className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                  errors.ownerEmail ? "border-red-500" : "border-[#4070f4]"
                } focus:shadow-md`}
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                placeholder="example@gmail.com"
                value={formData.ownerEmail}
                onChange={handleInputChange}
              />
              <label
                className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                  errors.ownerEmail ? "text-red-500" : "text-gray-500"
                }`}
                htmlFor="ownerEmail"
              >
                Байгуулгын и-мэйл <span className="text-red-500">*</span>
              </label>
              {errors.ownerEmail && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.ownerEmail}
                </p>
              )}
            </div>
          )}
          {/* 
          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.partnerEmail ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="partnerEmail"
              name="partnerEmail"
              type="email"
              placeholder="example@gmail.com"
              value={formData.partnerEmail}
              onChange={handleInputChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.partnerEmail ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="partnerEmail"
            >
              И-мэйл хаяг <span className="text-red-500">*</span>
            </label>
            {errors.partnerEmail && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.partnerEmail}
              </p>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
