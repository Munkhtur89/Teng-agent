import React from "react";

interface InsuranceDetailsProps {
  insuranceName: string;
  branchCode: string;
  ownerLastname: string;
  ownerFirstname: string;
  ownerRegisterNo: string;
  packageName: string;
}

const InsuranceDetailsSection: React.FC<InsuranceDetailsProps> = ({
  insuranceName,
  branchCode,
  ownerLastname,
  ownerFirstname,
  ownerRegisterNo,
  packageName,
}) => {
  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Даатгуулагчийн мэдээлэл
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Даатгалын багц:
          </label>
          <h3 className="font-medium">{packageName}</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Даатгалын дугаар:
          </label>
          <h3 className="font-medium">{insuranceName}</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Овог
          </label>
          <h3 className="font-medium">{ownerLastname}</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Нэр
          </label>
          <h3 className="font-medium">{ownerFirstname}</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Регистрийн дугаар
          </label>
          <h3 className="font-medium">{ownerRegisterNo}</h3>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetailsSection;
