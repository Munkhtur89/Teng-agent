import React from "react";

interface PaymentModalProps {
  show: boolean;
  selectedPayment: {
    paymentId: number;
    paymentAmount: number;
    paymentName: string;
  } | null;
  qpayData: {
    qpay_invoice: {
      invoice_id: string;
      qr_image: string;
      qPay_shortUrl: string;
    };
  } | null;
  qrCodeUrl: string;
  onClose: () => void;
  onPaymentCheck: (e: React.FormEvent) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  show,
  selectedPayment,
  qpayData,
  qrCodeUrl,
  onClose,
  onPaymentCheck,
}) => {
  if (!show || !selectedPayment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex mt-20 items-center justify-center z-50 px-10 shadow-lg">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
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
        <h3 className="text-lg text-center font-medium mb-4">Төлбөр төлөх</h3>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Та гүйлгээ хийж дуустал энэ хуудсыг хаахгүй түр хүлээнэ үү.
                Гүйлгээ амжилттай төлсны дараа шалгах товч дээр дарна уу
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-start space-x-2 items-center">
            <p className="text-sm text-gray-500">Төлбөрийн нэр:</p>
            <p className="font-medium">{selectedPayment.paymentName}</p>
          </div>
          <div className="flex justify-start space-x-2 items-center">
            <p className="text-sm text-gray-500">Төлбөрийн дүн:</p>
            <p className="font-medium">{selectedPayment.paymentAmount}₮</p>
          </div>

          <div>
            {qpayData ? (
              <div className="mt-6">
                <div className="flex flex-col items-center bg-[#f8f9ff] rounded-2xl p-8">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 mb-4"
                  />
                </div>

                <div className="flex items-center bg-[#f8f9ff] rounded-lg  space-x-20 py-2 mt-4 px-2">
                  <span className="text-blue-900 break-all text-12">
                    {qpayData.qpay_invoice.qPay_shortUrl}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        qpayData.qpay_invoice.qPay_shortUrl
                      );
                      alert("Амжилттай хууллаа!");
                    }}
                    className="ml-3 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                    title="Хуулах"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <rect
                        x="3"
                        y="3"
                        width="13"
                        height="13"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                    Хуулах
                  </button>
                </div>

                <button
                  onClick={onPaymentCheck}
                  className="w-full mt-4 cursor-pointer bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0px_4px_32px_0_rgba(99,102,241,.70)] px-6 py-3 rounded-xl border-[1px] border-slate-500 text-white font-medium group"
                >
                  <div className="relative overflow-hidden flex justify-center">
                    <p className="group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                      Шалгах
                    </p>
                    <p className="absolute top-7 left-0 w-full text-center group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                      Шалгах
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-gray-500">Төлбөр төлөөгүй байна</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
