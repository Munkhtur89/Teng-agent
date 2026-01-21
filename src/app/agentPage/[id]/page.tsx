"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBackIosNew } from "react-icons/md";
import { IdSkeleton } from "./skeleton";

import {
  InsuranceResponse,
  QPayResponse,
  UploadedFile,
} from "@/types/insurance";

import InsuranceDetailsSection from "./components/InsuranceDetails";
import InsuranceConditions from "./components/InsuranceConditions";
import FileUpload from "./components/FileUpload";
import PaymentSection from "./components/PaymentSection";
import PaymentModal from "./components/PaymentModal";
import ImagePreviewModal from "./components/ImagePreviewModal";
import { insuranceApi, fileApi } from "@/lib/api";

const convertBase64ToImage = (base64String: string) => {
  return `data:image/png;base64,${base64String}`;
};

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();

  const [formData, setFormData] = useState({
    insuranceName: "",
    branchCode: "",
    startDate: "",
    endDate: "",
    totalEvaluation: 0,
    averageFeePercent: 0,
    totalFeeAmount: 0,
    state: "draft",
    contracts: [] as InsuranceResponse["contracts"],
    payments: [] as InsuranceResponse["payments"],
    product: "",
    option: "",
    warranty: "",
    bankContract: "",
    isAutoNumbered: false,
    isRepeatingPattern: false,
    modification: "",
    evaluation: 0,
    commission: 0,
    payment: 0,
    customerManager: "",
    ownerLastname: "",
    ownerFirstname: "",
    ownerRegisterNo: "",
    ownerAddress: "",
    ownerPhoneNumber: "",
    ownerEmail: "",
    plateNumber: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    paymentId: number;
    paymentAmount: number;
    paymentName: string;
  } | null>(null);

  const [selectedBank, setSelectedBank] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qpayInvoiceId, setQpayInvoiceId] = useState<string>("");

  const [qpayData, setQpayData] = useState<QPayResponse | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const maxFiles = 8;

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const router = useRouter();

  const handleImageClick = (preview: string) => {
    setSelectedImage(preview);
    setShowImagePreview(true);
  };

  const handleClosePreview = () => {
    setShowImagePreview(false);
    setSelectedImage("");
  };

  const fetchMaterialList = async () => {
    try {
      setLoading(true);
      const data = await fileApi.listImages({
        insuranceId: Number(id),
      });

      if (data && data[0] && data[0].photos) {
        const files: UploadedFile[] = data[0].photos.map(
          (photoUrl: string, index: number) => ({
            id: Date.now() + index,
            file: new File([], `photo_${index}.jpg`),
            preview: photoUrl,
          })
        );
        setUploadedFiles(files);
        setFileError("");
      } else {
        setUploadedFiles([]);
        setFileError("Зургийн жагсаалт хоосон байна");
      }
    } catch (error) {
      console.error("Error fetching material list:", error);
      setFileError("Зургийн жагсаалт авахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInsuranceDetails();
      fetchMaterialList();
    }
  }, [id]);

  const fetchInsuranceDetails = async () => {
    try {
      setLoading(true);
      const data: InsuranceResponse = await insuranceApi.getById({
        insuranceId: Number(id),
      });

      // Хэрэв өгөгдөл байхгүй эсвэл хоосон байвал
      if (!data) {
        router.push("/agentPage");
        return;
      }

      // Хэрэв contracts массив байхгүй эсвэл хоосон байвал
      if (
        !data.contracts ||
        !Array.isArray(data.contracts) ||
        data.contracts.length === 0
      ) {
        router.push("/agentPage");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        insuranceName: data.insuranceName || "",
        branchCode: data.branchCode || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        totalEvaluation: data.totalEvaluation || 0,
        averageFeePercent: data.averageFeePercent || 0,
        totalFeeAmount: data.totalFeeAmount || 0,
        state: data.state || "draft",
        contracts: data.contracts || [],
        payments: data.payments || [],
        ...(data.contracts[0] && {
          ownerLastname: data.contracts[0].ownerLastname,
          ownerFirstname: data.contracts[0].ownerFirstname,
          ownerRegisterNo: data.contracts[0].ownerRegisterNo,
        }),
      }));

      await fetchMaterialList();
    } catch (err: any) {
      console.error("Error fetching insurance details:", err);

      // Алдааны статус код эсвэл мессежийг шалгах
      const errorStatus = err?.response?.status || err?.status;
      const errorMessage =
        err?.response?.data?.message || err?.message || err?.toString() || "";
      const errorMessageLower = errorMessage.toLowerCase();

      // 404 алдаа эсвэл "not found", "устгасан" гэсэн үг байвал
      if (
        errorStatus === 404 ||
        errorMessageLower.includes("not found") ||
        errorMessageLower.includes("устгасан") ||
        errorMessageLower.includes("байхгүй") ||
        errorMessageLower.includes("олдсонгүй")
      ) {
        // Устгасан гэрээ олдсон тохиолдолд нүүр хуудас руу шилжих
        router.push("/agentPage");
      } else {
        setError(
          err instanceof Error ? err.message : "Мэдээлэл авахад алдаа гарлаа"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (formData.payments && formData.payments.length > 0) {
        setSelectedPayment({
          paymentId: formData.payments[0].paymentId,
          paymentAmount: formData.payments[0].paymentAmount,
          paymentName: formData.payments[0].paymentName,
        });
      }

      const data = await insuranceApi.getInvoice({
        insuranceId: Number(id),
        paymentId: formData?.payments[0]?.paymentId,
        golomtRedirectUrl:
          "https://test-merchant.payon.mn/api/mobile/callback/123",
        golomtReturnType: "GET",
      });

      setQpayData(data);
      // Base64 зургийг хөрвүүлж хадгалах
      setQpayInvoiceId(data.qpay_invoice.invoice_id);
      console.log("data.qpay_invoice.invoice_id", qpayInvoiceId);
      setQrCodeUrl(convertBase64ToImage(data.qpay_invoice.qr_image));

      // Төлбөрийн модал цонхыг харуулах
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Төлбөр үүсгэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await insuranceApi.payQPayCheck({ qpayInvoiceId });

      if (data.isPaid) {
        alert("Төлбөр амжилттай төлөгдлөө");
        setShowPaymentModal(false);
        // Refresh insurance details to update payment status
        fetchInsuranceDetails();
      } else {
        alert("Төлбөр төлөгдөөгүй байна. Та дахин оролдоно уу.");
      }
    } catch (error) {
      console.error("Payment check error:", error);
      alert("Төлбөр шалгахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  // Add file handling functions
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      setFileError(`Хамгийн ихдээ ${maxFiles} зураг оруулах боломжтой`);
      return;
    }

    try {
      setLoading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          const base64Data = base64String.split(",")[1];

          try {
            await fileApi.uploadBase64({
              insuranceId: Number(id),
              photo_base64: base64Data,
            });

            const newFile: UploadedFile = {
              id: Date.now() + i,
              file: file,
              preview: URL.createObjectURL(file),
            };

            setUploadedFiles((prev) => [...prev, newFile]);
            setFileError("");
          } catch (error) {
            console.error("Error uploading file:", error);
            setFileError("Зураг илгээхэд алдаа гарлаа");
          }
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      setFileError("Зураг боловсруулахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (id: number) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((file) => file.id !== id);
      return filtered;
    });
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [uploadedFiles]);

  // Add new function to fetch PDF contract
  const fetchPdfContract = async (contractId: number) => {
    try {
      setLoading(true);
      const blob = await insuranceApi.getContractPdfBlob(contractId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error fetching PDF contract:", error);
      alert("PDF файл нээхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#afbffd] via-white to-white">
      <div className="default-width p-4">
        <button
          onClick={() => router.push("/agentPage")}
          className="bg-white text-center w-48 mt-10 rounded-2xl h-14 relative text-black text-xl font-semibold group"
          type="button"
        >
          <div className="bg-[#000080] rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500">
            <MdArrowBackIosNew color="white" />
          </div>
          <p className="translate-x-2 text-[#000080] text-[18px]"> Буцах</p>
        </button>

        {loading ? (
          <IdSkeleton />
        ) : error ? (
          <div className="bg-white backdrop-blur-sm rounded-xl shadow-lg p-8 mt-20 mb-20">
            <div className="text-center text-red-600">
              <p className="text-xl font-semibold">{error}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-8 mt-10 mb-20 border border-[#ffffff]">
            <div className="flex justify-between items-center mb-8 border-b pb-6">
              <div className="flex justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#000080]">
                    {formData?.contracts[0]?.packageName || ""}
                  </h1>
                  <p className="text-gray-600">
                    Гэрээний дугаар: {formData?.insuranceName}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="col-span-2 space-y-6">
                <InsuranceDetailsSection
                  insuranceName={formData.insuranceName}
                  branchCode={formData.branchCode}
                  ownerLastname={formData.ownerLastname}
                  ownerFirstname={formData.ownerFirstname}
                  ownerRegisterNo={formData.ownerRegisterNo}
                  packageName={formData?.contracts[0]?.packageName || ""}
                />

                <InsuranceConditions contracts={formData.contracts} />

                <FileUpload
                  uploadedFiles={uploadedFiles}
                  maxFiles={maxFiles}
                  fileError={fileError}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={removeFile}
                  onImageClick={handleImageClick}
                />
              </div>

              <div className="col-span-1">
                <PaymentSection
                  payments={formData.payments}
                  onPaymentSubmit={(e, payment) => {
                    setSelectedPayment({
                      paymentId: payment.paymentId,
                      paymentAmount: payment.paymentAmount,
                      paymentName: payment.paymentName,
                    });
                    handlePaymentSubmit(e);
                  }}
                  insuranceId={Number(id)}
                  paymentId={formData?.payments[0]?.paymentId}
                  onFetchPdfContract={fetchPdfContract}
                  contractId={formData?.contracts[0]?.contractId}
                  packageIsBankTransfer={
                    formData?.contracts[0]?.packageIsBankTransfer
                  }
                />
              </div>
            </div>

            <PaymentModal
              show={showPaymentModal}
              selectedPayment={selectedPayment}
              qpayData={qpayData}
              qrCodeUrl={qrCodeUrl}
              onClose={() => {
                setShowPaymentModal(false);
                setSelectedPayment(null);
                setSelectedBank("");
              }}
              onPaymentCheck={handlePaymentCheck}
            />

            <ImagePreviewModal
              show={showImagePreview}
              selectedImage={selectedImage}
              onClose={handleClosePreview}
            />
          </div>
        )}
      </div>
    </div>
  );
}
