"use client";
import React, { useEffect } from "react";

import { motion } from "framer-motion";
import { CarInfoProps } from "../types";
import { BsFillPassportFill } from "react-icons/bs";
import { FaUser, FaPhone, FaIdCard, FaCalendarAlt } from "react-icons/fa";

const CarInfo: React.FC<CarInfoProps> = ({
  formData,
  handleInputChange,

  errors = {},
  vehicleInfo,
}) => {
  useEffect(() => {
    if (vehicleInfo) {
      // Эзэмшигчийн мэдээллийг автоматаар бөглүүлэх
      const ownerFields = [
        { name: "ownerLastname", value: vehicleInfo.ownerLastname || "" },
        { name: "ownerFirstname", value: vehicleInfo.ownerFirstname || "" },
        { name: "ownerRegisterNo", value: vehicleInfo.ownerRegnum || "" },
        {
          name: "ownerPhoneNumber",
          value: vehicleInfo.ownerHandphone || vehicleInfo.ownerHomephone || "",
        },
      ];

      // Хоосон биш утгуудыг л шинэчлэх
      ownerFields.forEach(({ name, value }) => {
        if (value && value.trim() !== "") {
          const event = {
            target: {
              name,
              value,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          handleInputChange(event);
        }
      });
    }
  }, [vehicleInfo, handleInputChange]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <motion.div
      className="relative bg-gray-200 rounded-3xl border-2 border-slate-200/50  "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center gap-3 mb-2  rounded-2xl"
        variants={headerVariants}
      >
        <div className="flex items-center gap-2 m-4">
          <BsFillPassportFill className="text-[#000080]" size={18} />
          <h2 className="text-[20px] font-medium text-[#000080]">
            Өмчлөгчийн мэдээлэл
          </h2>
        </div>
      </motion.div>

      {/* Өмчлөгчийн мэдээлэл - Card хэлбэрээр */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
        variants={formVariants}
        whileHover={{
          scale: 1.01,
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Овог */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <FaUser className="text-gray-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Овог
              </label>
              <input
                className={`w-full bg-transparent outline-none text-base font-semibold text-gray-900 ${
                  errors.ownerLastname
                    ? "border-b border-red-500"
                    : "border-b border-gray-200 focus:border-[#4070f4]"
                } pb-1 transition-colors`}
                id="ownerLastname"
                name="ownerLastname"
                type="text"
                value={formData.ownerLastname}
                onChange={handleInputChange}
                placeholder="Овог оруулна уу"
              />
              {errors.ownerLastname && (
                <motion.p
                  className="mt-1 text-sm text-red-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.ownerLastname}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Нэр */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <FaUser className="text-gray-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Нэр <span className="text-red-500">*</span>
              </label>
              <input
                required
                className={`w-full bg-transparent outline-none text-base font-semibold text-gray-900 ${
                  errors.ownerFirstname
                    ? "border-b border-red-500"
                    : "border-b border-gray-200 focus:border-[#4070f4]"
                } pb-1 transition-colors`}
                id="ownerFirstname"
                name="ownerFirstname"
                type="text"
                value={formData.ownerFirstname}
                onChange={handleInputChange}
                placeholder="Нэр оруулна уу"
              />
              {errors.ownerFirstname && (
                <motion.p
                  className="mt-1 text-sm text-red-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.ownerFirstname}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Регистрийн дугаар */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <FaIdCard className="text-gray-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Регистрийн дугаар <span className="text-red-500">*</span>
              </label>
              <input
                required
                className={`w-full bg-transparent outline-none text-base font-semibold text-gray-900 ${
                  errors.ownerRegisterNo
                    ? "border-b border-red-500"
                    : "border-b border-gray-200 focus:border-[#4070f4]"
                } pb-1 transition-colors`}
                id="ownerRegisterNo"
                name="ownerRegisterNo"
                type="text"
                value={formData.ownerRegisterNo}
                onChange={handleInputChange}
                placeholder="Регистрийн дугаар оруулна уу"
              />
              {errors.ownerRegisterNo && (
                <motion.p
                  className="mt-1 text-sm text-red-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.ownerRegisterNo}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Утасны дугаар */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <FaPhone className="text-gray-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Утасны дугаар
              </label>
              <input
                className={`w-full bg-transparent outline-none text-base font-semibold text-gray-900 ${
                  errors.ownerPhoneNumber
                    ? "border-b border-red-500"
                    : "border-b border-gray-200 focus:border-[#4070f4]"
                } pb-1 transition-colors`}
                id="ownerPhoneNumber"
                name="ownerPhoneNumber"
                type="tel"
                value={formData.ownerPhoneNumber}
                onChange={handleInputChange}
                placeholder="Утасны дугаар оруулна уу"
              />
              {errors.ownerPhoneNumber && (
                <motion.p
                  className="mt-1 text-sm text-red-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.ownerPhoneNumber}
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CarInfo;
