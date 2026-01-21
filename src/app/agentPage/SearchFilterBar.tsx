import React, { useState, useEffect } from "react";
import { IoIosRefresh } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

interface SearchFilterBarProps {
  filterState: string;
  setFilterState: (v: string) => void;
  filterProduct: string;
  setFilterProduct: (v: string) => void;
  filterStartDate: string;
  setFilterStartDate: (v: string) => void;
  filterEndDate: string;
  setFilterEndDate: (v: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  registerNumber: string;
  setRegisterNumber: (v: string) => void;
  plateNumber: string;
  setPlateNumber: (v: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  productList: string[];
  loading: boolean;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filterState,
  setFilterState,
  filterProduct,
  setFilterProduct,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  searchTerm,
  setSearchTerm,
  registerNumber,
  setRegisterNumber,
  plateNumber,
  setPlateNumber,
  onSearch,
  onRefresh,
  productList,
  loading,
}) => {
  return (
    <div className="bg-[#0057C2] rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className=" font-bold text-white text-[24px]">Гэрээний Хайлт</h1>

        <button
          onClick={onRefresh}
          className="border border-white text-white rounded-2xl px-6 py-3 flex items-center transition hover:bg-[#0066D9] min-w-[48px] justify-center ml-20"
          title="Шинэчлэх"
          style={{ height: "48px" }}
          disabled={loading}
        >
          {loading ? (
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
            <IoIosRefresh className="text-white" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap grid grid-cols-4  gap-3 md:gap-4 pb-4 items-center">
        <input
          type="text"
          placeholder="Гэрээний дугаар"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#0066D9] text-white rounded-2xl px-6 py-3 focus:outline-none placeholder-white min-w-[150px] border border-[#3388e0]"
          style={{ height: "48px" }}
        />
        <input
          type="text"
          placeholder="Регистрийн дугаар"
          value={registerNumber}
          onChange={(e) => setRegisterNumber(e.target.value)}
          className="bg-[#0066D9] text-white rounded-2xl px-6 py-3 focus:outline-none placeholder-white min-w-[150px] border border-[#3388e0]"
          style={{ height: "48px" }}
        />

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="bg-[#0066D9] text-white rounded-2xl px-6 py-3 focus:outline-none appearance-none min-w-[120px] border border-[#3388e0]"
          style={{ height: "48px" }}
        >
          <option value="all">Төлөв</option>
          <option value="paid">Төлсөн</option>
          <option value="unpaid">Төлөөгүй</option>
        </select>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="bg-[#0066D9] text-white rounded-2xl px-6 py-3 focus:outline-none appearance-none min-w-[150px] border border-[#3388e0]"
          style={{ height: "48px" }}
        >
          <option value="">Бүтээгдэхүүн</option>
          {productList.map((product) => (
            <option key={product} value={product}>
              {product}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Улсын дугаар"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          className="bg-[#0066D9] text-white rounded-2xl px-6 py-3 focus:outline-none placeholder-white min-w-[150px] border border-[#3388e0]"
          style={{ height: "48px" }}
        />

        <div className="flex flex-row items-center gap-0 bg-[#0066D9] rounded-2xl overflow-hidden border border-[#3388e0] w-[380px]">
          <input
            type="date"
            placeholder="Эхлэх огноо"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="bg-transparent text-white px-4 py-3 focus:outline-none placeholder-white border-none min-w-[20px]"
            style={{ height: "48px" }}
          />
          <input
            type="date"
            placeholder="Дуусах огноо"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="bg-transparent text-white px-4 py-3 focus:outline-none placeholder-white border-none min-w-[20px]"
            style={{ height: "48px" }}
          />
          <button
            onClick={onSearch}
            className="bg-[#FF7A1A] hover:bg-[#ff8c3a] text-white px-5 h-full flex items-center justify-center border-none focus:outline-none"
            title="Хайх"
            style={{ height: "48px" }}
            disabled={loading}
          >
            {loading ? (
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
  );
};

export default SearchFilterBar;
