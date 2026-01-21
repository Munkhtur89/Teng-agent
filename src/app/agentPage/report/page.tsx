"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { reportsApi } from "@/lib/api";

const ReportPage = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Амжилттай
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Тайлангийн мэдээлэл амжилттай татлаа
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full px-4 py-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000A0] transition-colors"
          >
            Ойлголоо
          </button>
        </div>
      </div>
    </div>
  );

  const fetchInsuranceReport = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const blob: Blob = await reportsApi.getInsuranceReport(
        startDate,
        endDate
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setError(null);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Тайлангийн API алдааны мэдээлэл:", err);
      setError("Тайлангийн мэдээлэл авахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (startDate && endDate) {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];
      fetchInsuranceReport(formattedStartDate, formattedEndDate);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {showSuccessModal && <SuccessModal />}
      <div className="max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Даатгалын тайлан
              </h1>
              <p className="text-gray-600 mt-2">
                Даатгалын гэрээний тайлангийн мэдээлэл
              </p>
            </div>
            <button
              onClick={() => router.push("/agentPage")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Буцах
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Тайлангийн огноо
              </h3>

              <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Эхлэх огноо
                  </label>
                  <input
                    type="date"
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) =>
                      setStartDate(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="border rounded-lg p-2 w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    Дуусах огноо
                  </label>
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="border rounded-lg p-2 w-full"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleDownload}
                    disabled={loading || !startDate || !endDate}
                    className="px-6 py-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000A0] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Татаж байна..." : "Татах"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
