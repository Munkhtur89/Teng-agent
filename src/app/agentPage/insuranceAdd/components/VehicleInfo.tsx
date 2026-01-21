import React from "react";
import { IoSearch } from "react-icons/io5";
import { VehicleInfoProps } from "../types";

const VehicleInfo: React.FC<VehicleInfoProps> = ({
  formData,
  isVehicleInfoLoading,
  handleInputChange,
  fetchVehicleInfo,
  errors = {},
}) => {
  return (
    <div className="bg-[#0057C2] rounded-2xl p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Хайлтын төрөл сонгох хэвтээ товчлуур */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-[#0066D9] p-1 rounded-2xl border border-[#3388e0]">
            <button
              type="button"
              onClick={() =>
                handleInputChange({
                  target: { name: "searchType", value: "plateNumber" },
                } as any)
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                formData.searchType === "plateNumber"
                  ? "bg-white text-[#0057C2] shadow-lg font-semibold"
                  : "text-white hover:bg-[#0066D9]"
              }`}
            >
              Улсын дугаар
            </button>
            <button
              type="button"
              onClick={() =>
                handleInputChange({
                  target: { name: "searchType", value: "archiveNumber" },
                } as any)
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                formData.searchType === "archiveNumber"
                  ? "bg-white text-[#0057C2] shadow-lg font-semibold"
                  : "text-white hover:bg-[#0066D9]"
              }`}
            >
              Арлын дугаараар
            </button>
          </div>
        </div>

        {/* Input талбар */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0] max-w-xl">
            <input
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleInputChange}
              placeholder={
                formData.searchType === "archiveNumber"
                  ? "Арлын дугаар оруулна уу"
                  : "Улсын дугаар оруулна уу (жишээ: 0000AAA)"
              }
              className="flex-1 bg-transparent text-white px-6 py-3 focus:outline-none placeholder:text-white/70 border-none"
              style={{ height: "48px" }}
              onKeyPress={(e) => e.key === "Enter" && fetchVehicleInfo()}
            />
            <button
              type="button"
              onClick={fetchVehicleInfo}
              disabled={isVehicleInfoLoading}
              className="bg-[#FF7A1A] hover:bg-[#ff8c3a] text-white px-5 h-full flex items-center justify-center border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ height: "48px" }}
              title="Хайх"
            >
              {isVehicleInfoLoading ? (
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
          {errors.plateNumber && (
            <div className="text-red-200 text-sm bg-red-500/20 px-4 py-2 rounded-lg max-w-xl">
              {errors.plateNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;
