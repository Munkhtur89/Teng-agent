import React, { useState } from "react";

import { Card } from "@/components/ui/card";
import Lottie from "lottie-react";
import PaySuccessLottie from "@/../../public/animation/DGpQSSwxyH.json";
import { MdArrowBackIosNew } from "react-icons/md";
import { useRouter } from "next/navigation";

interface BannerComponentProps {
  headline?: string;
  description?: string;
  qrCodeData?: string;
  showQrCode?: boolean;
  className?: string;
}

const BannerComponent: React.FC<BannerComponentProps> = ({
  headline = "",
  description = "",
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border-0 shadow-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="banner"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />

      <div className="relative z-10 px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
          {/* Left content */}
          <div className="flex-1 space-y-4 lg:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
              {headline}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-blue-100 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          <div className="relative">
            {/* Lottie animation */}
            <div
              className="rounded-lg flex items-center justify-center"
              style={{
                width: "250px",
                height: "250px",
                overflow: "hidden",
              }}
            >
              <Lottie
                animationData={PaySuccessLottie}
                loop={true}
                style={{
                  width: 300,
                  height: 300,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div
        className={`absolute inset-0 bg-white/5 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </Card>
  );
};

const BannerExample: React.FC = () => {
  const router = useRouter();

  return (
    <div className=" bg-background p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto  ">
        <button
          onClick={() => router.back()}
          className="bg-white text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group mb-4"
          type="button"
        >
          <div className="bg-[#000080] rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500">
            <MdArrowBackIosNew color="white" />
          </div>
          <p className="translate-x-2 text-[#000080] text-[18px]"> Буцах</p>
        </button>
        {/* Banner with custom QR data */}
        <BannerComponent
          headline="Таны даатгалын агент"
          description="Манай туршлагатай агентууд танд хамгийн тохиромжтой даатгалын үйлчилгээг санал болгож, бүх үйл явцыг хялбаршуулна"
          qrCodeData="https://tenger.mn/agent-contact"
        />
      </div>
    </div>
  );
};

export default BannerExample;
