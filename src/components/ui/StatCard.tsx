import React from "react";
import Lottie from "lottie-react";
import { Badge } from "./badge";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  status: string;
  statusColor?: string;
  animationData?: object;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  status,
  statusColor = "text-green-600",
  animationData,
}) => {
  return (
    <div className="relative bg-white rounded-xl  p-6">
      {/* Gradient шугам */}
      <div
        className="absolute left-6 top-12 bottom-4 w-[2px] rounded-full h-[85px] z-10"
        style={{
          background: "linear-gradient(180deg, #2196F3 0%, #21CBF3 100%)",
          // boxShadow: "0 0 8px 2px #2196F3",
        }}
      />
      {/* Card-ийн агуулга */}
      <div className="rounded-2xl   shadow-sm border border-[#e5e7eb] p-4 relative flex  hover:shadow-md items-center space-x-2 ">
        {animationData && (
          <div className="w-[100px] h-[100px]">
            <Lottie
              animationData={animationData}
              loop
              height={200}
              width={200}
            />
          </div>
        )}

        <div>
          <div
            className="text-lg font-bold text-blue-600 drop-shadow-md mb-1 tracking-wide uppercase"
            style={{
              fontFamily:
                'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            {title}
          </div>
          <div className="text-3xl font-semibold text-gray-900 mt-1">
            {value}
          </div>
          <Badge
            variant={
              statusColor === "text-green-600"
                ? "success"
                : statusColor === "text-orange-500"
                ? "warning"
                : "default"
            }
            className="mt-2 shadow-sm"
          >
            {status}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
