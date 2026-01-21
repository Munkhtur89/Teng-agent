import React, { useEffect } from "react";
import { BsFillPassportFill } from "react-icons/bs";
import { AiTwotoneQuestionCircle } from "react-icons/ai";
import { BasicInfoProps } from "../types";
const BasicInfo: React.FC<BasicInfoProps> = ({
  formData,
  loading,
  products,
  selectedProduct,
  filteredPackages,
  selectedPercentage,
  handleInputChange,
  setSelectedProduct,
  isDivide,
  paymentDivide,
  errors = {},
}) => {
  useEffect(() => {
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];

    let endDate = new Date(today);

    if (filteredPackages.length > 0) {
      const selectedPackage = filteredPackages.find(
        (pkg) => pkg.packageId.toString() === formData.product
      );
      const termMonth =
        selectedPackage?.termMonth || filteredPackages[0]?.termMonth || "12";

      const monthsToAdd = parseInt(termMonth);
      endDate.setMonth(endDate.getMonth() + monthsToAdd);
    } else {
      // Default to 1 year if no packages available      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const formattedEndDate = endDate.toISOString().split("T")[0];

    handleInputChange({
      target: {
        name: "startDate",
        value: startDate,
      },
    } as React.ChangeEvent<HTMLInputElement>);

    // Set end date
    handleInputChange({
      target: {
        name: "endDate",
        value: formattedEndDate,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [filteredPackages, formData.product]); // Add dependencies

  // Update dates when package selection changes
  useEffect(() => {
    if (formData.product && filteredPackages.length > 0) {
      const selectedPackage = filteredPackages.find(
        (pkg) => pkg.packageId.toString() === formData.product
      );

      if (selectedPackage && selectedPackage.termMonth) {
        const startDate = new Date();
        const endDate = new Date(startDate);

        // Add months based on termMonth
        const monthsToAdd = parseInt(selectedPackage.termMonth);
        endDate.setMonth(endDate.getMonth() + monthsToAdd);

        // Use helper function for consistency
        const calculatedEndDate = calculateEndDate(
          startDate.toISOString().split("T")[0],
          selectedPackage.termMonth
        );

        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        // Update start date
        handleInputChange({
          target: {
            name: "startDate",
            value: formattedStartDate,
          },
        } as React.ChangeEvent<HTMLInputElement>);

        // Update end date
        handleInputChange({
          target: {
            name: "endDate",
            value: formattedEndDate,
          },
        } as React.ChangeEvent<HTMLInputElement>);

        console.log(
          `Package selected: ${selectedPackage.packageName}, Term: ${selectedPackage.termMonth} months`
        );
        console.log(
          `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`
        );
        console.log(`Calculated end date: ${calculatedEndDate}`);
      }
    }
  }, [formData.product, filteredPackages]);

  // Helper function to format termMonth display
  const formatTermMonth = (termMonth: string | undefined | null) => {
    const months = parseInt(String(termMonth ?? ""));
    if (isNaN(months) || months <= 0) {
      return "";
    }
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} жил`;
      } else {
        return `${years} жил ${remainingMonths} сар`;
      }
    } else {
      return `${months} сар`;
    }
  };

  // Helper function to calculate end date based on termMonth
  const calculateEndDate = (startDate: string, termMonth: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    const monthsToAdd = parseInt(termMonth);
    end.setMonth(end.getMonth() + monthsToAdd);
    return end.toISOString().split("T")[0];
  };

  // Helper function to validate end date is after start date
  const validateEndDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  };

  // Helper function to get selected package info
  const getSelectedPackageInfo = () => {
    if (!formData.product || filteredPackages.length === 0) return null;
    return filteredPackages.find(
      (pkg) => pkg.packageId.toString() === formData.product
    );
  };

  // Helper function to get package display info
  const getPackageDisplayInfo = (pkg: any) => {
    const termDisplay = formatTermMonth(pkg.termMonth);
    const termMonths = pkg.termMonth;
    return {
      termDisplay,
      termMonths,
      packageName: pkg.packageName,
      percentage: pkg.percentage,
    };
  };

  return (
    <div className="relative bg-gray-200 p-[2px] rounded-2xl">
      <div className="flex items-center gap-2 m-4">
        <BsFillPassportFill className="text-[#000080]" size={18} />
        <h2 className="text-[20px] font-medium text-[#000080]">
          Үндсэн мэдээлэл
        </h2>
      </div>

      <div className="bg-white p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Даатгалын бүтээгдэхүүн <span className="text-red-500">*</span>
            </label>

            {loading ? (
              <div className="flex items-center justify-center p-2.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <select
                name="productType"
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                }}
                className={`w-full border ${
                  errors.productType || !selectedProduct
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Сонгоно уу</option>
                {products.map((product) => (
                  <option
                    key={`product-${product.productId}`}
                    value={product.productCode}
                  >
                    {product.productName}
                  </option>
                ))}
              </select>
            )}

            {(errors.productType || !selectedProduct) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.productType || "Даатгалын бүтээгдэхүүн сонгоно уу"}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Даатгалын багц <span className="text-red-500">*</span>
              </label>

              <div className="relative group">
                <p className=" font-mono font-bold cursor-pointer">
                  <AiTwotoneQuestionCircle
                    className="text-blue-500"
                    scale={1.5}
                    strokeWidth={1}
                    size={20}
                    color="#000080"
                    stroke="#000080"
                  />
                </p>

                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition duration-100 transform group-hover:translate-y-0 translate-y-2">
                  <div className="w-max max-w-xs text-white rounded-lg px-4 py-4">
                    {formData.product && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg w-[200px]">
                        {(() => {
                          const selectedPackage = getSelectedPackageInfo();
                          if (!selectedPackage) return null;

                          return (
                            <>
                              <p className="text-sm text-blue-700">
                                Сонгосон багц: {selectedPackage.packageName}
                              </p>
                              <p className="text-sm text-blue-600">
                                Хугацаа:{" "}
                                {formatTermMonth(selectedPackage.termMonth)}
                                {(() => {
                                  const months = parseInt(
                                    String(selectedPackage.termMonth ?? "")
                                  );
                                  return !isNaN(months) && months > 0
                                    ? ` (${months} сар)`
                                    : "";
                                })()}
                              </p>
                              <p className="text-sm text-blue-600">
                                Хүү: {selectedPackage.percentage}%
                              </p>
                              <p className="text-sm text-blue-600">
                                Эхлэх огноо: {formData.startDate}
                              </p>
                              <p className="text-sm text-blue-600">
                                Дуусах огноо: {formData.endDate}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <select
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              className={`w-full border ${
                errors.product || !formData.product
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500`}
              disabled={!selectedProduct}
            >
              <option value="">Сонгоно уу</option>
              {filteredPackages.map((pkg) => {
                const displayInfo = getPackageDisplayInfo(pkg);
                return (
                  <option
                    key={`package-${pkg.packageId}`}
                    value={pkg.packageId}
                  >
                    {displayInfo.packageName} ({displayInfo.percentage}%)
                    {displayInfo.termDisplay
                      ? ` - ${displayInfo.termDisplay}`
                      : ""}
                  </option>
                );
              })}
            </select>
            {(errors.product || !formData.product) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.product || "Даатгалын багц сонгоно уу"}
              </p>
            )}
          </div>

          {selectedProduct === "2801" || selectedProduct === "1210" ? (
            " "
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Үнэлгээ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  name="evaluation"
                  value={
                    formData.evaluation
                      ? Number(formData.evaluation).toLocaleString("mn-MN")
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange({
                      target: {
                        name: "evaluation",
                        value: value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className={`w-full pl-8 pr-4 py-2.5 border ${
                    errors.evaluation || !formData.evaluation
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₮
                </span>
              </div>
              {errors.evaluation && (
                <p className="text-red-500 text-xs mt-1">{errors.evaluation}</p>
              )}
              {formData.evaluation && !errors.evaluation && (
                <p className="text-sm text-gray-600 mt-1">
                  Оруулсан үнэ:{" "}
                  {Number(formData.evaluation).toLocaleString("mn-MN")} ₮
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Эхлэх огноо <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => {
                handleInputChange(e);
                // Хэрэв эхлэх огноо өөрчлөгдвөл дуусах огноог автоматаар тооцоолох
                if (
                  e.target.value &&
                  formData.product &&
                  filteredPackages.length > 0
                ) {
                  const selectedPackage = filteredPackages.find(
                    (pkg) => pkg.packageId.toString() === formData.product
                  );
                  if (selectedPackage?.termMonth) {
                    const calculatedEndDate = calculateEndDate(
                      e.target.value,
                      selectedPackage.termMonth
                    );
                    handleInputChange({
                      target: {
                        name: "endDate",
                        value: calculatedEndDate,
                      },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }
              }}
              className={`w-full border ${
                errors.startDate || !formData.startDate
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500`}
            />
            {(errors.startDate || !formData.startDate) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.startDate || "Эхлэх огноо сонгоно уу"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дуусах огноо <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={(e) => {
                handleInputChange(e);
                // Хэрэв дуусах огноо эхлэх огнооноос өмнө байвал анхааруулга харуулах
                if (e.target.value && formData.startDate) {
                  if (!validateEndDate(formData.startDate, e.target.value)) {
                    console.warn(
                      "Дуусах огноо эхлэх огнооноос өмнө байж болохгүй"
                    );
                  }
                }
              }}
              min={formData.startDate} // Эхлэх огнооноос хойшх огноо л сонгох боломжтой
              className={`w-full border ${
                errors.endDate || !formData.endDate
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500`}
            />
            {(errors.endDate || !formData.endDate) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.endDate || "Дуусах огноо сонгоно уу"}
              </p>
            )}
          </div>

          {selectedProduct === "1210" ? (
            " "
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хураамж <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fee"
                placeholder={"Хураамж"}
                value={
                  formData.evaluation && selectedPercentage
                    ? Number(
                        (formData.evaluation * selectedPercentage) / 100
                      ).toLocaleString("mn-MN")
                    : ""
                }
                readOnly
                className={`w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-gray-50`}
              />
            </div>
          )}

        
          {isDivide && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Төлбөрийг хувааж төлөх <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentDivide"
                value={paymentDivide || 1}
                onChange={handleInputChange}
                className={`w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500`}
              >
                <option value={1}>1 хуваах</option>
                <option value={2}>2 хуваах</option>
                <option value={3}>3 хуваах</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
