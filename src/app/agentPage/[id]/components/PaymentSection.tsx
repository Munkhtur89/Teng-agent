"use client";
import React, { useState } from "react";
import { PiQrCodeFill } from "react-icons/pi";
import { FaFilePdf } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa";
import BgImage from "@/../public/BlueRays.png";
import Image from "next/image";
import { insuranceApi } from "@/lib/api";

interface Payment {
  paymentId: number;
  paymentName: string;
  paymentAmount: number;
  paymentDate: string;
  isPaid: boolean;
}

interface PaymentSectionProps {
  payments: Payment[];
  onPaymentSubmit: (e: React.FormEvent, payment: Payment) => void;
  onFetchPdfContract: (contractId: number) => void;
  contractId?: number;
  insuranceId: number;
  paymentId: number;
  packageIsBankTransfer?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  payments,
  onPaymentSubmit,
  onFetchPdfContract,
  contractId,
  insuranceId,
  paymentId,
  packageIsBankTransfer = false,
}) => {
  const totalAmount = payments.reduce(
    (total, payment) => total + payment.paymentAmount,
    0
  );
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  console.log("insuranceId", insuranceId);
  console.log("paymentId", paymentId);

  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await insuranceApi.payGolomtInit({
        insuranceId,
        paymentId,
      });
      setIsPaid(Boolean(data));
      window.location.reload();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Төлбөр үүсгэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-4 sticky top-6 text-white shadow-xl relative overflow-hidden">
      <Image
        src={BgImage.src}
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="relative z-10">
        <div className="mb-4">
          <p className="text-gray-200 mb-2 text-shadow-2xs">Нийт дүн</p>
          <h2 className="text-4xl font-bold text-shadow-2xs">
            {totalAmount.toLocaleString()}₮
          </h2>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.paymentId}
              className="bg-white/20 mb-2 backdrop-blur-lg rounded-xl p-4 hover:bg-white/20 transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium">{payment.paymentName}</p>
                  <p className="text-sm text-gray-300">{payment.paymentDate}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm text-white font-bold">Төлөв</h3>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    payment.isPaid || isPaid
                      ? "bg-green-500/20 text-green-200"
                      : "bg-red-500/20 text-red-100"
                  }`}
                >
                  {payment.isPaid || isPaid ? "Төлсөн" : "Төлөөгүй"}
                </span>
              </div>
              <div>
                {payment.isPaid || isPaid ? (
                  <button
                    onClick={() => contractId && onFetchPdfContract(contractId)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg"
                  >
                    <FaFilePdf size={20} />
                    Гэрээ татах
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={(e) => onPaymentSubmit(e, payment)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg"
                    >
                      <PiQrCodeFill size={20} />
                      Qpay төлөх
                    </button>

                    {packageIsBankTransfer && (
                      <button
                        onClick={handleBankTransfer}
                        className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-lg"
                      >
                        <FaCreditCard size={20} />
                        Дараа төлөх
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
