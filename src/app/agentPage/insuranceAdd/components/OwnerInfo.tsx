import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { motion } from "framer-motion";
import { OwnerInfoProps } from "../types";

const OwnerInfo: React.FC<OwnerInfoProps> = ({
  formData,
  handleInputChange,
  onSearch,
  isSearching,
  errors = {},
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [foundUser, setFoundUser] = useState<boolean | null>(null);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert("Регистрийн дугаар оруулна уу");
      return;
    }
    try {
      await onSearch(searchKeyword);
      setFoundUser(true);
    } catch (e) {
      setFoundUser(false);
    }
  };

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

  return (
    <motion.div
      className="relative bg-gray-200 p-[2px] rounded-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Хайх хэсэг */}
      <div className="bg-white p-4 rounded-xl ">
        <div className="bg-[#0057C2] rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Гарчиг */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2 bg-[#0066D9] p-1 rounded-2xl border border-[#3388e0]">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 bg-white text-[#0057C2] shadow-lg"
                >
                  Байгуулгын регистр хайх
                </button>
              </div>
            </div>

            {/* Хайлтын input */}
            <div className="flex items-center gap-0 bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0] max-w-xl">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="УБ00000000"
                className="flex-1 bg-transparent text-white px-6 py-3 focus:outline-none placeholder-white border-none"
                style={{ height: "48px" }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#FF7A1A] hover:bg-[#ff8c3a] text-white px-5 h-full flex items-center justify-center border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: "48px" }}
                title="Хайх"
              >
                {isSearching ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  <IoSearch size={24} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Өмчлөгчийн мэдээлэл */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white  rounded-xl mb-6 pt-8">
          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.ownerFirstName ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="ownerFirstName"
              name="ownerFirstName"
              type="text"
              value={formData.ownerFirstName}
              onChange={handleInputChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.ownerFirstName ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="ownerFirstName"
            >
              Байгуулгын нэр <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.ownerFirstName && (
            <p className="mt-1 text-sm text-red-500">{errors.ownerFirstName}</p>
          )}

          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.ownerRegisterNo ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="ownerRegisterNo"
              name="ownerRegisterNo"
              type="text"
              value={formData.ownerRegisterNo}
              onChange={handleInputChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.ownerRegisterNo ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="ownerRegisterNo"
            >
              Байгуулгын регистрийн дугаар{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>

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

          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.ownerPhoneNumber ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="ownerPhoneNumber"
              name="ownerPhoneNumber"
              type="text"
              value={formData.ownerPhoneNumber}
              onChange={handleInputChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.ownerPhoneNumber ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="ownerPhoneNumber"
            >
              Байгуулгын утас <span className="text-red-500">*</span>
            </label>
          </div>

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

          <div className="w-full h-12 relative flex rounded-xl">
            <input
              className={`peer w-full bg-transparent outline-none px-4 text-base rounded-xl bg-white border ${
                errors.ownerEmail ? "border-red-500" : "border-[#4070f4]"
              } focus:shadow-md`}
              id="ownerEmail"
              name="ownerEmail"
              type="text"
              value={formData.ownerEmail}
              onChange={handleInputChange}
            />
            <label
              className={`absolute top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-3 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150 ${
                errors.ownerEmail ? "text-red-500" : "text-gray-500"
              }`}
              htmlFor="ownerEmail"
            >
              Байгуулгын и-мэйл <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.ownerEmail && (
            <motion.p
              className="mt-1 text-sm text-red-500"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {errors.ownerEmail}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OwnerInfo;
