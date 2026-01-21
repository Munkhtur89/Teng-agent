import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import Car from "@/../../public/animation/car2d.json";
import Baby from "@/../../public/animation/baby.json";
import Travel from "@/../../public/animation/travel.json";
import Lottie from "lottie-react";

// Banner-ийн дата массив
const banners = [
  {
    title: "Security",
    subtitle: "Invoices",
    desc1: "100% Safe",
    desc2: "Awesome",
    image: Car, // өөрийн зураг эсвэл icon path
    gradient: "from-blue-500 to-blue-700",
  },
  {
    title: "Fast",
    subtitle: "Transactions",
    desc1: "Lightning Speed",
    desc2: "No Delay",
    image: Baby,
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    title: "Fast",
    subtitle: "Transactions",
    desc1: "Lightning Speed",
    desc2: "No Delay",
    image: Travel,
    gradient: "from-purple-500 to-indigo-600",
  },
];
const Banner = () => {
  return (
    <div>
      <Swiper
        spaceBetween={24}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        modules={[Autoplay, Pagination]}
        className="w-full max-w-full"
      >
        {banners.map((b, idx) => (
          <SwiperSlide key={idx}>
            <div
              className={`w-full h-32 md:h-36 rounded-t-2xl shadow-lg flex items-center px-8 py-4 bg-gradient-to-r ${b.gradient} relative overflow-hidden`}
            >
              {/* Зүүн тал */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-white text-xl md:text-2xl font-semibold">
                  <span className="font-bold">{b.title}</span>{" "}
                  <span className="font-light">{b.subtitle}</span>
                </div>
                <div className="flex gap-6 mt-3">
                  <div className="flex items-center gap-1 text-white/90 text-xs">
                    <span className="material-icons text-base">
                      verified_user
                    </span>{" "}
                    {b.desc1}
                  </div>
                  <div className="flex items-center gap-1 text-white/90 text-xs">
                    <span className="material-icons text-base">star</span>{" "}
                    {b.desc2}
                  </div>
                </div>
              </div>
              {/* Баруун тал */}
              <div className="flex-shrink-0 w-20 h-20 md:w-40 md:h-40 flex items-center justify-center">
                <Lottie
                  animationData={b.image}
                  loop
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              {/* Од icon */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
