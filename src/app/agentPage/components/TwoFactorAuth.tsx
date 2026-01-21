"use client";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { agentApi } from "@/lib/api";
import { useAgentAuth } from "@/providers/AgentAuthContext";
import { useRouter } from "next/navigation";
import Lock from "../../../../public/animation/lock.json";
import LockOut from "../../../../public/reset-password.png";
import Image from "next/image";

import Lottie from "lottie-react";
interface QRCodeData {
  secret: string;
  secret_raw: string;
  qr_code: string;
  qr_code_url: string;
  provisioning_uri: string;
  issuer: string;
}

const TwoFactorAuth: React.FC = () => {
  const router = useRouter();
  const { logoutAgent } = useAgentAuth();
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean | null>(
    null
  );
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [shouldLogoutOnSuccess, setShouldLogoutOnSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  // Эхлэхэд серверээс 2FA статусыг уншиж авна

  // Success modal автоматаар хаах / шаардлагатай бол logout хийх
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessMessage("");

        if (shouldLogoutOnSuccess) {
          setShouldLogoutOnSuccess(false);
          // Амжилттай 2FA тохируулсны дараа хэрэглэгчийг системээс гаргаж,
          // дахин нэвтрэхийг шаардана
          logoutAgent();
          router.push("/");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, shouldLogoutOnSuccess, logoutAgent, router]);

  // OTP digits-ийг нэгтгээд otpCode болгож ашиглах
  useEffect(() => {
    setOtpCode(otpDigits.join(""));
  }, [otpDigits]);

  const handleEnableTwoFactor = async () => {
    // Хэрэв идвэхгүй бол QR код татах
    // Хэрэв идвэхгүй бол QR код татах
    setIsEnabling2FA(true);
    try {
      const response = await agentApi.setupTwoFactor();
      // Response format: { status: "success", data: {...}, message: "" }
      if (response?.status === "success" && response?.data) {
        setQrCodeData(response.data);
        setShowQRModal(true);
        setOtpCode(""); // Reset OTP code
        setOtpDigits(Array(6).fill(""));
        setError(null);
      } else if (response?.data) {
        // Fallback: if response structure is different
        setQrCodeData(response.data);
        setShowQRModal(true);
        setOtpCode(""); // Reset OTP code
        setOtpDigits(Array(6).fill(""));
        setError(null);
      }
    } catch (err: any) {
      console.error("2FA setup үед алдаа:", err);
      setError("QR код татахад алдаа гарлаа");
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!qrCodeData || !otpCode || otpCode.length !== 6) {
      setError("6 оронтой OTP код оруулна уу");
      return;
    }

    setIsVerifyingOTP(true);
    const token = Cookies.get("authToken");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_API_URL}/api/v1/app/2fa/verify-and-enable`,
        {
          method: "POST",
          headers: {
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify({
            secret: qrCodeData.secret_raw,
            totp_code: otpCode,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setShowQRModal(false);
        setQrCodeData(null);
        setOtpCode("");
        setOtpDigits(Array(6).fill(""));
        setError(null);
        setIsTwoFactorEnabled(true);
        setSuccessMessage(
          "2FA амжилттай идэвхжлээ. Та одооноос хоёр хүчин зүйлтэй нэвтрэхийг ашиглана. Шинэ тохиргоо идэвхжихийн тулд дахин нэвтрэн орно уу."
        );
        setShouldLogoutOnSuccess(true);
        setShowSuccessModal(true);
      } else {
        setError(result.message || "OTP код буруу байна. Дахин оролдоно уу.");
      }
    } catch (err: any) {
      console.error("OTP баталгаажуулах үед алдаа:", err);
      setError(err?.message || "OTP код буруу байна. Дахин оролдоно уу.");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = clean;
    setOtpDigits(nextDigits);

    if (clean && index < otpInputsRef.current.length - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleDisableTwoFactor = async () => {
    setIsDisabling2FA(true);
    const token = Cookies.get("authToken");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_API_URL}/api/v1/app/2fa/disable`,
        {
          method: "POST",
          headers: {
            Authorization: `${token || ""}`,
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setShowDisableModal(false);
        setError(null);
        setSuccessMessage(result.message || "2FA disabled successfully");
        setShowSuccessModal(true);
        setIsTwoFactorEnabled(false);
        setShouldLogoutOnSuccess(false);
      } else {
        setError(result.message || "OTP код буруу байна. Дахин оролдоно уу.");
      }
    } catch (err: any) {
      console.error("2FA унтраах үед алдаа:", err);
      setError(
        err?.message || "2FA унтраахдаа алдаа гарлаа. Дахин оролдоно уу."
      );
    } finally {
      setIsDisabling2FA(false);
    }
  };

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await agentApi.getTwoFactorStatus();
      // { status: "success", data: { totp_enabled: boolean, ... }, message: "" }
      if (response?.status === "success" && response?.data) {
        setIsTwoFactorEnabled(!!response.data.totp_enabled);
      }
      console.log("2FA status:", response);
    } catch (err) {
      console.error("2FA статус шалгах үед алдаа:", err);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* 2FA Enable Товч - зөвхөн идэвхгүй үед */}
        {isTwoFactorEnabled === false && (
          <button
            onClick={handleEnableTwoFactor}
            disabled={isEnabling2FA}
            className={`flex items-center shadow-xs gap-2 px-4 py-1 rounded-full border border-blue-300 shadow-sm  hover:border-blue-500 transition bg-white text-black hover:bg-white-700 ${
              isEnabling2FA ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="w-12 h-12 justify-center items-center">
              <Lottie animationData={Lock} loop={true} height={20} width={20} />
            </div>
            {isEnabling2FA ? (
              <>
                <div className="w-4 h-4 text-black border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Түр хүлээгээд...</span>
              </>
            ) : (
              <>
                <span className="text-[#000080] font-medium pr-4">
                  2FA идвэхжүүлэх
                </span>
              </>
            )}
          </button>
        )}

        {/* 2FA Disable Товч - зөвхөн идэвхтэй үед */}
        {isTwoFactorEnabled === true && (
          <button
            onClick={() => {
              setShowDisableModal(true);
              setError(null);
            }}
            className="flex items-center justify-center shadow-xs py-3  cursor-pointer gap-2 px-6  rounded-full transition bg-red-600 text-white hover:bg-red-700"
          >
            <Image src={LockOut} alt="Lock Out" width={20} height={20} />
            <span className="text-white font-medium ">2FA унтраах</span>
          </button>
        )}
      </div>

      {/* QR Code Modal for 2FA Setup */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-xl mx-4 rounded-3xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => {
                setShowQRModal(false);
                setQrCodeData(null);
                setOtpCode("");
                setOtpDigits(Array(6).fill(""));
                setError(null);
              }}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col items-center space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="w-6 h-6 text-[#000080]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11zM6 20v-1c0-2.21 2.239-4 5-4s5 1.79 5 4v1"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Set up two factor auth (2FA)
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-md">
                  To authorize actions, scan the QR code below with Google
                  Authenticator эсвэл бусад 2FA апп, дараа нь доорх
                  баталгаажуулах кодыг оруулна уу.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <img
                      src={qrCodeData.qr_code_url}
                      alt="QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <p className="text-sm font-medium text-gray-700 text-center">
                    Verification code (6 орон)
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el: HTMLInputElement | null) => {
                          otpInputsRef.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpDigitChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-12 w-10 rounded-xl border border-gray-300 text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-center text-red-600">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex w-full gap-3">
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      setQrCodeData(null);
                      setOtpCode("");
                      setOtpDigits(Array(6).fill(""));
                      setError(null);
                    }}
                    disabled={isVerifyingOTP}
                    className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Буцах
                  </button>
                  <button
                    onClick={handleVerifyAndEnable}
                    disabled={isVerifyingOTP || otpCode.length !== 6}
                    className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#000080] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifyingOTP ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Баталгаажуулж байна...</span>
                      </>
                    ) : (
                      "Идвэхжүүлэх"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                2FA-г унтраах уу?
              </h3>
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-center">
              Та хоёр хүчин зүйлт нэвтрэлтийг унтраахдаа итгэлтэй байна уу? Энэ
              нь таны аккаунтын аюулгүй байдлыг бууруулна.
            </p>

            {error && (
              <p className="mb-3 text-sm text-center text-red-600">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setError(null);
                }}
                disabled={isDisabling2FA}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Үгүй, цуцлах
              </button>
              <button
                onClick={handleDisableTwoFactor}
                disabled={isDisabling2FA}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDisabling2FA ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Унтрааж байна...</span>
                  </>
                ) : (
                  "Тийм, унтраах"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
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
              <h3 className="text-xl font-semibold text-gray-900">Амжилттай</h3>
              <p className="text-gray-600 text-center">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TwoFactorAuth;
