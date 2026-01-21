import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";

interface DynamicField {
  label: string;
  name: string;
  type: string;
  required: boolean;
  selection_ids: Array<{ id: string; name: string }>;
  relation: string;
}

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

interface ApartmentSearchProps {
  onSearch: (
    propertyNumber: string,
    ownerRegnum: string
  ) => Promise<PropertyData | null>;
  isApartmentSearchLoading: boolean;
  errors?: {};
  dynamicFields?: DynamicField[];
  onDynamicFieldChange?: (name: string, value: string) => void;
  formData?: Record<string, any>;
  onPropertyDataFound?: (propertyData: PropertyData) => void;
}

const ApartmentSearch: React.FC<ApartmentSearchProps> = ({
  onSearch,
  isApartmentSearchLoading,
  onPropertyDataFound,
}) => {
  const [propertyNumber, setPropertyNumber] = useState("");
  const [ownerRegnum, setOwnerRegnum] = useState("");
  const [foundUser, setFoundUser] = useState<boolean | null>(null);
  const [searchType, setSearchType] = useState<"property" | "owner" | "both">(
    "both"
  );
  const [searchResult, setSearchResult] = useState<PropertyData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSearch = async () => {
    if (!propertyNumber.trim() && !ownerRegnum.trim()) {
      alert("Хайх утга оруулна уу");
      return;
    }

    // Хэрэв loading байвал хайлт хийхгүй
    if (isApartmentSearchLoading) {
      return;
    }

    setFoundUser(null);
    setSearchResult(null);
    setShowSuccess(false);

    try {
      const result = await onSearch(propertyNumber, ownerRegnum);
      if (result) {
        setFoundUser(true);
        setSearchResult(result);
        setShowSuccess(true);

        // Property data-г parent компонентэд дамжуулах
        if (onPropertyDataFound) {
          onPropertyDataFound(result);
        }

        // 3 секундын дараа амжилттай мэдээллийг арилгах
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        setFoundUser(false);
        setSearchResult(null);
      }
    } catch (e) {
      setFoundUser(false);
      setSearchResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Main Container */}
      <div className="bg-[#0057C2] rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Хайлтын төрөл сонгох хэвтээ товчлуур */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-[#0066D9] p-1 rounded-2xl border border-[#3388e0]">
              <button
                type="button"
                onClick={() => {
                  setSearchType("both");
                  setPropertyNumber("");
                  setOwnerRegnum("");
                }}
                className="px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 bg-white text-[#0057C2] shadow-lg"
              >
                Орон сууцны дугаар - Эзэмшигчийн дугаар
              </button>
            </div>
          </div>

          {/* Input талбар */}
          <div className="flex items-center gap-2 max-w-4xl">
            {/* Эхний input - Орон сууцны дугаар */}
            {(searchType === "property" || searchType === "both") && (
              <div className="flex-1 flex items-center gap-0 bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0]">
                <input
                  type="text"
                  value={propertyNumber}
                  onChange={(e) => setPropertyNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isApartmentSearchLoading}
                  placeholder="Орон сууцны дугаар оруулна уу"
                  className="flex-1 bg-transparent text-white px-6 py-3 focus:outline-none placeholder-white border-none"
                  style={{ height: "48px" }}
                />
              </div>
            )}

            {/* Хоёр дахь input - Эзэмшигчийн дугаар */}
            {(searchType === "owner" || searchType === "both") && (
              <div className="flex-1 flex items-center gap-0 bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0]">
                <input
                  type="text"
                  value={ownerRegnum}
                  onChange={(e) => setOwnerRegnum(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isApartmentSearchLoading}
                  placeholder="Эзэмшигчийн дугаар оруулна уу"
                  className="flex-1 bg-transparent text-white px-6 py-3 focus:outline-none placeholder-white border-none"
                  style={{ height: "48px" }}
                />
              </div>
            )}

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              disabled={isApartmentSearchLoading}
              className="bg-[#FF7A1A] hover:bg-[#ff8c3a] text-white px-5 flex items-center justify-center border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
              style={{ height: "48px" }}
              title="Хайх"
            >
              {isApartmentSearchLoading ? (
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

      {/* Error Message */}
      {foundUser === false && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-800">
              Мэдээлэл олдсонгүй
            </span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Оруулсан мэдээллийг шалгаад дахин оролдоно уу
          </p>
        </div>
      )}
    </div>
  );
};

export default ApartmentSearch;
