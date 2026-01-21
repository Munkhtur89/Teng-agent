import React from "react";

interface Contract {
  contractId: number;
  contractName: string;
  packageName: string;
  itemEvaluation: number;
  fee: number;
}

interface InsuranceConditionsProps {
  contracts: Contract[];
}

const InsuranceConditions: React.FC<InsuranceConditionsProps> = ({
  contracts,
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Даатгалын нөхцөл
        </h2>
      </div>

      <div className="space-y-6">
        {contracts.map((contract) => (
          <div key={contract.contractId} className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Гэрээний дугаар</p>
                <p className="font-medium">{contract.contractName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Багцын нэр</p>
                <p className="font-medium">{contract.packageName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Үнэлгээ</p>
                <p className="font-medium">
                  {contract.itemEvaluation.toLocaleString()}₮
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Хураамж</p>
                <p className="font-medium">{contract.fee.toLocaleString()}₮</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuranceConditions;
