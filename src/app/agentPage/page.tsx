"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FiLogOut } from "react-icons/fi";
import { InsuranceListResponse } from "@/types/insurance";
import SearchFilterBar from "./SearchFilterBar";
import TwoFactorAuth from "./components/TwoFactorAuth";

import Counter from "@/components/Counter";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Plus, Eye, Download, Pencil } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import AppleActivityCard from "../../components/charts/AppleActivityCard";
import ContractLineChart from "../../components/charts/ContractLineChart";
import PlateNumberBarChart from "../../components/charts/PlateNumberBarChart";
import Logo from "@/../../public/images/logo_blue.png";
import Image from "next/image";
import StatCard from "@/components/ui/StatCard";

import AirplaneLottie from "@/../../public/animation/contract2.json";
import PaySuccessLottie from "@/../../public/animation/paySuccess.json";
import WaitLottie from "@/../../public/animation/MIPy8tfr6N.json";
import Barcode from "@/../../public/barcode.png";
import DateClock from "@/../../public/clock.png";
import People from "@/../../public/people.png";
import { useAgentAuth } from "@/providers/AgentAuthContext";
import { agentApi, insuranceApi } from "@/lib/api";

const AgentList = () => {
  const router = useRouter();
  const [insuranceData, setInsuranceData] = useState<InsuranceListResponse>({
    total: 0,
    offset: 0,
    limit: 0,
    insurances: [],
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Нэг хуудсанд харуулах мэдээллийн тоо
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Хайлт хийж байгаа эсэхийг тэмдэглэх
  console.log("isnavigarion ", isNavigating);
  const { logoutAgent } = useAgentAuth();

  // Шинэ filter state-ууд
  const [filterState, setFilterState] = useState("all"); // all | paid | unpaid
  const [filterProduct, setFilterProduct] = useState("");
  // Default: энэ сарын 1-нээс сүүлийн өдөр хүртэл
  const getMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().slice(0, 10),
      end: lastDay.toISOString().slice(0, 10),
    };
  };
  const monthRange = getMonthRange();
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  // Бүтээгдэхүүний жагсаалт state
  const [productList, setProductList] = useState<string[]>([]);

  const [profile, setProfile] = useState({
    login: "",
    name: "",
    lastname: "",
    phone: "",
    email: "",
    vat: "",
    image_base64: "",
  });

  // insuranceData өөрчлөгдөхөд productName-уудыг цуглуулах
  useEffect(() => {
    const products = Array.from(
      new Set(
        insuranceData.insurances
          .map((i) => i.productName)
          .filter((p): p is string => typeof p === "string" && !!p)
      )
    );
    setProductList(products);
  }, [insuranceData]);

  const fetchInsurances = async (
    customStartDate?: string,
    customEndDate?: string,
    searchAllPages: boolean = false
  ) => {
    try {
      const requestBody: any = {
        name: searchTerm,
        registerNumber,
        plateNumber,
      };

      // Хайлт хийхэд бүх хуудаснаас хайх, эсвэл одоогийн хуудсыг харуулах
      if (searchAllPages) {
        // Бүх хуудаснаас хайх - маш том limit ашиглах
        requestBody.offset = 0;
        requestBody.limit = 10000;
      } else {
        // Энгийн хуудаслалт
        requestBody.offset = (currentPage - 1) * itemsPerPage;
        requestBody.limit = 20;
      }

      const start =
        customStartDate !== undefined ? customStartDate : filterStartDate;
      const end = customEndDate !== undefined ? customEndDate : filterEndDate;
      if (start) requestBody.startDate = start;
      if (end) requestBody.endDate = end;

      const data: InsuranceListResponse = await insuranceApi.getList(
        requestBody
      );

      setInsuranceData(data);
      setLoading(false);
    } catch (err: any) {
      console.error("API алдааны мэдээлэл:", err);
      logoutAgent();
      router.push("/");
      setError("Мэдээлэл авахад алдаа гарлаа");
      setLoading(false);
    }
  };

  const Profile = async () => {
    try {
      const data = await agentApi.getProfile();
      setProfile(data);
      setLoading(false);
    } catch (err: any) {
      console.error("API алдааны мэдээлэл:", err);
      logoutAgent();
      router.push("/");
      setError("Мэдээлэл авахад алдаа гарлаа");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Хайлт хийж байгаа үед хуудас солих хэрэггүй, учир нь бүх үр дүнг аль хэдийн татсан
    if (!isSearching) {
      fetchInsurances();
    }
  }, [currentPage]);

  useEffect(() => {
    Profile();
  }, []);

  const handleInsuranceClick = async (insuranceId: string) => {
    setIsNavigating(true);
    try {
      await router.push(`/agentPage/${insuranceId}`);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const userId = Cookies.get("userId");
      await agentApi.revokeToken(userId);
      Cookies.remove("authToken");
      Cookies.remove("userId");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      logoutAgent();
      router.push("/");
      setError("Системээс гарах үед алдаа гарлаа");
    }
  };

  // Хуудас сонгох функц
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const Loading = () => {
    return (
      <div className="flex-col gap-4 w-full flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-transparent text-[#000080] text-4xl animate-spin flex items-center justify-center border-t-[#000080] rounded-full">
          <div className="w-3 h-3 border-4 border-transparent text-[#000080] text-2xl animate-spin flex items-center justify-center border-t-[#000080] rounded-full"></div>
        </div>
      </div>
    );
  };

  // Регистрийн дугаарыг хэсэг хэсгээр нь хайх helper функц
  const matchesRegisterNumber = (
    registerNumber: string,
    searchTerm: string
  ): boolean => {
    if (!registerNumber || !searchTerm) return false;

    const register = registerNumber.trim();
    const search = searchTerm.trim();

    // Бүтэн регистрийн дугаарыг хайх
    if (register.toLowerCase().includes(search.toLowerCase())) {
      return true;
    }

    // Регистрийн дугаар нь үсэг + тоо хэлбэртэй эсэхийг шалгах
    // Жишээ: "ЧЛ85092371", "XH86092916"
    const registerMatch = register.match(/^([А-ЯЁA-Z]+)(\d+)$/i);
    if (registerMatch) {
      const letters = registerMatch[1]; // Үсгийн хэсэг
      const numbers = registerMatch[2]; // Тооны хэсэг

      // Зөвхөн үсгийн хэсгийг хайх
      if (letters.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }

      // Зөвхөн тооны хэсгийг хайх
      if (numbers.includes(search)) {
        return true;
      }

      // Тооны хэсгийн аль нэг хэсгийг хайх
      if (numbers.includes(search)) {
        return true;
      }
    }

    // Зөвхөн тооноос бүрдсэн регистрийн дугаар (жишээ: "2843293")
    if (/^\d+$/.test(register) && register.includes(search)) {
      return true;
    }

    return false;
  };

  // Filter logic
  const filteredInsurances = insuranceData.insurances.filter((item) => {
    // searchTerm - бүх талбараар хайх
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchTermTrimmed = searchTerm.trim();
      let matchesSearch = false;

      // Гэрээний дугаар
      if (
        item.insuranceName &&
        item.insuranceName.toLowerCase().includes(searchLower)
      ) {
        matchesSearch = true;
      }

      // Бүтээгдэхүүний нэр
      if (
        item.productName &&
        item.productName.toLowerCase().includes(searchLower)
      ) {
        matchesSearch = true;
      }

      // Contracts доторх бүх талбарууд
      if (item.contracts && item.contracts.length > 0) {
        for (const contract of item.contracts) {
          // Регистрийн дугаар - сайжруулсан хайлт
          if (typeof contract.partner_register === "string") {
            if (
              matchesRegisterNumber(
                contract.partner_register,
                searchTermTrimmed
              )
            ) {
              matchesSearch = true;
              break;
            }
          }

          // Улсын дугаар
          if (
            typeof contract.plate_number === "string" &&
            contract.plate_number.toLowerCase().includes(searchLower)
          ) {
            matchesSearch = true;
            break;
          }

          // Бусад талбарууд
          const contractStr = JSON.stringify(contract).toLowerCase();
          if (contractStr.includes(searchLower)) {
            matchesSearch = true;
            break;
          }
        }
      }

      if (!matchesSearch) return false;
    }

    // Төлөв filter
    if (filterState === "paid" && item.state !== "done") return false;
    if (filterState === "unpaid" && item.state === "done") return false;

    // Бүтээгдэхүүн filter
    if (filterProduct && item.productName !== filterProduct) return false;

    // Эхлэх огноо filter
    if (filterStartDate && new Date(item.startDate) < new Date(filterStartDate))
      return false;

    // Дуусах огноо filter
    if (filterEndDate && new Date(item.endDate) > new Date(filterEndDate))
      return false;

    // Регистрийн дугаар filter - сайжруулсан хайлт
    if (registerNumber) {
      const registerNumberTrimmed = registerNumber.trim();
      if (
        !item.contracts ||
        !item.contracts.some(
          (c) =>
            typeof c.partner_register === "string" &&
            matchesRegisterNumber(c.partner_register, registerNumberTrimmed)
        )
      )
        return false;
    }

    // Улсын дугаар filter
    if (
      plateNumber &&
      (!item.contracts ||
        !item.contracts.some(
          (c) =>
            typeof c.plate_number === "string" &&
            c.plate_number.toLowerCase().includes(plateNumber.toLowerCase())
        ))
    )
      return false;

    return true;
  });

  // Хайлтын үр дүн өөрчлөгдөхөд тухайн үр дүн байгаа хуудас руу автоматаар очих
  useEffect(() => {
    if (isSearching && insuranceData.insurances.length > 0 && filteredInsurances.length > 0) {
      // Хайлтын үр дүн байгаа эсэхийг шалгах
      const firstResultIndex = insuranceData.insurances.findIndex((item) => {
        // Ижил шүүлтийн логик
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const searchTermTrimmed = searchTerm.trim();
          let matchesSearch = false;

          if (
            item.insuranceName &&
            item.insuranceName.toLowerCase().includes(searchLower)
          ) {
            matchesSearch = true;
          }

          if (
            item.productName &&
            item.productName.toLowerCase().includes(searchLower)
          ) {
            matchesSearch = true;
          }

          if (item.contracts && item.contracts.length > 0) {
            for (const contract of item.contracts) {
              if (typeof contract.partner_register === "string") {
                if (
                  matchesRegisterNumber(
                    contract.partner_register,
                    searchTermTrimmed
                  )
                ) {
                  matchesSearch = true;
                  break;
                }
              }

              if (
                typeof contract.plate_number === "string" &&
                contract.plate_number.toLowerCase().includes(searchLower)
              ) {
                matchesSearch = true;
                break;
              }

              const contractStr = JSON.stringify(contract).toLowerCase();
              if (contractStr.includes(searchLower)) {
                matchesSearch = true;
                break;
              }
            }
          }

          if (!matchesSearch) return false;
        }

        if (filterState === "paid" && item.state !== "done") return false;
        if (filterState === "unpaid" && item.state === "done") return false;
        if (filterProduct && item.productName !== filterProduct) return false;
        if (filterStartDate && new Date(item.startDate) < new Date(filterStartDate))
          return false;
        if (filterEndDate && new Date(item.endDate) > new Date(filterEndDate))
          return false;
        if (registerNumber) {
          const registerNumberTrimmed = registerNumber.trim();
          if (
            !item.contracts ||
            !item.contracts.some(
              (c) =>
                typeof c.partner_register === "string" &&
                matchesRegisterNumber(c.partner_register, registerNumberTrimmed)
            )
          )
            return false;
        }
        if (
          plateNumber &&
          (!item.contracts ||
            !item.contracts.some(
              (c) =>
                typeof c.plate_number === "string" &&
                c.plate_number.toLowerCase().includes(plateNumber.toLowerCase())
            ))
        )
          return false;

        return true;
      });

      if (firstResultIndex !== -1) {
        // Тухайн үр дүн байгаа хуудасыг тооцоолох
        const targetPage = Math.floor(firstResultIndex / itemsPerPage) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      } else {
        // Хэрэв үр дүн олдохгүй бол 1-р хуудас руу очих
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
      }
    }
  }, [isSearching, insuranceData.insurances.length, filteredInsurances.length]);

  const handleRefresh = async () => {
    setFilterState("all");
    setFilterProduct("");
    setFilterStartDate("");
    setFilterEndDate("");
    setSearchTerm("");
    setRegisterNumber("");
    setPlateNumber("");
    setCurrentPage(1);
    setIsSearching(false); // Хайлтын state-ийг арилгах
    setLoading(true);
    await fetchInsurances();
    setLoading(false);
  };

  // SearchFilterBar-ийн хайлт хийх товч дарахад ажиллах функц
  // Бүх хуудас болон бүх талбараар хайх
  const handleSearch = async () => {
    setIsSearching(true); // Хайлт хийж байгааг тэмдэглэх
    setCurrentPage(1); // Хайлт хийхэд 1-р хуудас руу автоматаар шилжүүлэх
    setLoading(true);
    // searchAllPages: true гэж дамжуулах нь бүх хуудаснаас хайх
    await fetchInsurances(filterStartDate, filterEndDate, true);
    setLoading(false);
  };

  // Responsive chart size
  const [windowWidth, setWindowWidth] = useState(1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`p-10 bg-[#eee] min-h-screen${
        isNavigating ? " cursor-progress" : ""
      }`}
    >
      <div className="max-w-[1900px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 mt-8">
          <div>
            <Image
              src={Logo.src}
              width={150}
              height={150}
              objectFit="contain"
              alt="logo"
            />
          </div>
          <div className="flex items-center gap-4">
            <TwoFactorAuth />

            <div className="flex items-center gap-4 bg-white px-2 py-2 rounded-full shadow">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg select-none">
                  {(() => {
                    const displayName = (
                      profile.name ||
                      profile.login ||
                      "-"
                    ).trim();
                    const words = displayName.split(/\s+/);
                    if (words.length >= 2) {
                      return (words[0][0] + words[1][0]).toUpperCase();
                    } else {
                      return displayName.slice(0, 2).toUpperCase();
                    }
                  })()}
                </div>

                <div>
                  <div className="font-semibold text-gray-800">
                    {profile.name || profile.login || "-"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                <FiLogOut size={20} />
                Гарах
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl flex w-full  ">
          <Card className="p-8">
            <CardHeader className="pb-10">
              <div className="flex justify-end gap-4 mb-4">
                <Button
                  onClick={async () => {
                    setIsNavigating(true);
                    await router.push("/agentPage/insuranceAdd");
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-full text-[18px]"
                  disabled={isNavigating}
                >
                  <Plus size={18} />
                  Шинэ гэрээ
                </Button>

                <Button
                  onClick={() => router.push("/agentPage/report")}
                  variant="outline"
                  className="flex items-center gap-2 text-green-700 border-green-700 hover:bg-green-50 rounded-full text-[18px]"
                >
                  <Download size={18} />
                  Тайлан
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
                <StatCard
                  title="Нийт гэрээ"
                  value={<Counter targetNumber={insuranceData.total} />}
                  status=""
                  statusColor=""
                  animationData={AirplaneLottie}
                />
                <StatCard
                  title="Төлбөр төлсөн"
                  value={
                    <Counter
                      targetNumber={
                        insuranceData.insurances.filter(
                          (i) => i.state === "done"
                        ).length
                      }
                    />
                  }
                  status="Төлөв: Төлсөн"
                  statusColor="text-green-600"
                  animationData={PaySuccessLottie}
                />
                <StatCard
                  title="Хүлээгдэж байгаа"
                  value={
                    <Counter
                      targetNumber={
                        insuranceData.insurances.filter(
                          (i) => i.state !== "done"
                        ).length
                      }
                    />
                  }
                  status="Төлөв: Ноорог"
                  statusColor="text-orange-500"
                  animationData={WaitLottie}
                />
              </div>

              {/* AppleActivityCard бодит датаар */}
              <div className="flex  items-center gap-8 w-full    rounded-2xl pb-8 ">
                <AppleActivityCard
                  title="Гэрээний тойм"
                  activities={[
                    {
                      label: "Төлсөн",
                      value:
                        insuranceData.insurances.length > 0
                          ? Math.round(
                              (insuranceData.insurances.filter(
                                (i) => i.state === "done"
                              ).length /
                                insuranceData.insurances.length) *
                                100
                            )
                          : 0,
                      color: "#000080",
                      size:
                        windowWidth < 1280
                          ? windowWidth < 1024
                            ? 90
                            : 120
                          : 200,
                      current: insuranceData.insurances.filter(
                        (i) => i.state === "done"
                      ).length,
                      target: insuranceData.insurances.length,
                      unit: "ширхэг",
                    },
                    {
                      label: "Ноорог",
                      value:
                        insuranceData.insurances.length > 0
                          ? Math.round(
                              (insuranceData.insurances.filter(
                                (i) => i.state !== "done"
                              ).length /
                                insuranceData.insurances.length) *
                                100
                            )
                          : 0,
                      color: "#000080",
                      size:
                        windowWidth < 1280
                          ? windowWidth < 1024
                            ? 70
                            : 100
                          : 160,
                      current: insuranceData.insurances.filter(
                        (i) => i.state !== "done"
                      ).length,
                      target: insuranceData.insurances.length,
                      unit: "ширхэг",
                    },
                  ]}
                />
                <div
                  className={
                    windowWidth < 1280
                      ? windowWidth < 1024
                        ? "w-full max-w-xs"
                        : "w-full max-w-md"
                      : "w-full max-w-2xl"
                  }
                >
                  <ContractLineChart insurances={insuranceData.insurances} />
                </div>
                <div
                  className={
                    windowWidth < 1280
                      ? windowWidth < 1024
                        ? "w-full max-w-xs"
                        : "w-full max-w-md"
                      : "w-full max-w-2xl"
                  }
                >
                  <PlateNumberBarChart insurances={insuranceData.insurances} />
                </div>
              </div>

              <SearchFilterBar
                filterState={filterState}
                setFilterState={setFilterState}
                filterProduct={filterProduct}
                setFilterProduct={setFilterProduct}
                filterStartDate={filterStartDate}
                setFilterStartDate={setFilterStartDate}
                filterEndDate={filterEndDate}
                setFilterEndDate={setFilterEndDate}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                registerNumber={registerNumber}
                setRegisterNumber={setRegisterNumber}
                plateNumber={plateNumber}
                setPlateNumber={setPlateNumber}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                productList={productList}
                loading={loading}
              />
            </CardHeader>

            <CardContent className="pt-12">
              {loading ? (
                <Loading />
              ) : error ? (
                <div className="text-destructive text-center py-8 bg-destructive/10 rounded-lg">
                  {error}
                </div>
              ) : (
                <div className="rounded-lg  shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-medium text-muted-foreground w-[60px]">
                          №
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Гэрээний дугаар
                        </TableHead>

                        <TableHead className="font-medium text-muted-foreground">
                          Эхлэх огноо
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Дуусах огноо
                        </TableHead>

                        <TableHead className="font-medium text-muted-foreground">
                          Регистрийн дугаар
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Улсын дугаар
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground">
                          Төлөв
                        </TableHead>
                        <TableHead className="font-medium text-muted-foreground ">
                          Үйлдэл
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {(() => {
                        // Хайлт хийж байгаа үед хуудаслалт хийх
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedInsurances = isSearching
                          ? filteredInsurances.slice(startIndex, endIndex)
                          : filteredInsurances;

                        return paginatedInsurances.map((insurance, index) => {
                          const displayIndex = isSearching
                            ? startIndex + index + 1
                            : index + 1;
                          
                          return (
                        <TableRow
                          key={insurance?.insuranceId}
                          className={`group cursor-pointer transition-all duration-200 hover:bg-muted hover:scale-[1.03] hover:shadow-lg${
                            isNavigating ? " cursor-progress" : ""
                          }`}
                        >
                          <TableCell className="font-medium w-[80px]">
                            {displayIndex}
                          </TableCell>

                          <TableCell className="font-medium">
                            <div className=" flex items-center justify-center  ">
                              <Image
                                src={Barcode}
                                alt="barcode"
                                height={25}
                                width={25}
                                className="pr-2"
                              />
                              {insurance?.insuranceName}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className=" flex items-center  justify-center ">
                              <Image
                                src={DateClock}
                                alt="barcode"
                                height={25}
                                width={25}
                                className="pr-2"
                              />
                              {insurance?.startDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className=" flex items-center justify-center  ">
                              <Image
                                src={DateClock}
                                alt="barcode"
                                height={25}
                                width={25}
                                className="pr-2"
                              />
                              {insurance?.endDate}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center ">
                              <Image
                                src={People}
                                alt="barcode"
                                height={25}
                                width={25}
                                className="pr-2"
                              />
                              <div className="flex flex-col gap-1">
                                {insurance?.contracts &&
                                insurance.contracts.length > 0 ? (
                                  insurance.contracts.map((c, idx) =>
                                    c.partner_register ? (
                                      <span key={idx}>
                                        {c.partner_register}
                                      </span>
                                    ) : null
                                  )
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="items-center justify-center">
                              {insurance?.contracts &&
                              insurance.contracts.length > 0 ? (
                                insurance.contracts.map((c, idx) =>
                                  typeof c.plate_number === "string" &&
                                  c.plate_number ? (
                                    <span
                                      key={idx}
                                      className="bg-white border border-gray-300 rounded-md px-3 py-1 font-bold text-gray-700 text-sm tracking-widest shadow-sm flex items-center gap-1"
                                      style={{
                                        minWidth: 70,
                                        display: "inline-flex",
                                        textAlign: "center",
                                        boxShadow:
                                          "0 1px 4px 0 rgba(0,0,0,0.06)",
                                      }}
                                    >
                                      <span className="text-gray-400 text-[6px]">
                                        ●
                                      </span>
                                      <span>{c.plate_number}</span>
                                      <span className="text-gray-400 text-[6px]">
                                        ●
                                      </span>
                                    </span>
                                  ) : (
                                    "-"
                                  )
                                )
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                insurance?.state === "done"
                                  ? "success"
                                  : "warning"
                              }
                              className={`
                                ${
                                  insurance?.state === "done"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900"
                                }
                              `}
                            >
                              <span
                                className={`mr-1 w-2 h-2 rounded-full inline-block ${
                                  insurance?.state === "done"
                                    ? "bg-green-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              {insurance?.state === "done"
                                ? "Төлсөн"
                                : "Ноорог"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {insurance?.state !== "done" && (
                                <Button
                                  onClick={() => {
                                    setIsNavigating(true);
                                    router.push(
                                      `/agentPage/insuranceAdd?editId=${insurance?.insuranceId}`
                                    );
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className={`text-orange-600 hover:text-orange-700 hover:bg-orange-50 group-hover:bg-orange-50/50 transition-all duration-200${
                                    isNavigating ? " cursor-progress" : ""
                                  }`}
                                  disabled={isNavigating}
                                >
                                  <div className="flex items-center gap-2">
                                    <Pencil size={16} />
                                    <span>Засварлах</span>
                                  </div>
                                </Button>
                              )}
                              <Button
                                onClick={() =>
                                  handleInsuranceClick(
                                    insurance?.insuranceId.toString() || ""
                                  )
                                }
                                variant="ghost"
                                size="sm"
                                className={`text-primary hover:text-primary/80 hover:bg-primary/10 group-hover:bg-primary/5 transition-all duration-200${
                                  isNavigating ? " cursor-progress" : ""
                                }`}
                                disabled={isNavigating}
                              >
                                {isNavigating ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span>Уншиж байна...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Eye size={16} />
                                    <span>Дэлгэрэнгүй</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                          );
                        });
                      })() as React.ReactNode}
                    </TableBody>
                  </Table>
                </div>
              )}
              {/* Хуудаслалтын товчлуурууд */}
              <div className="mt-6 flex justify-center gap-2 mx-auto">
                {(() => {
                  // Хайлт хийж байгаа үед хайлтын үр дүнгээр хуудаслалтыг тооцох
                  const totalItems = isSearching
                    ? filteredInsurances.length
                    : insuranceData.total;
                  const totalPages = Math.ceil(totalItems / itemsPerPage);
                  const pageNumbers: (number | string)[] = [];
                  const showPages = 2;
                  // 1-р хуудсыг нэмэх
                  if (totalPages > 0) pageNumbers.push(1);
                  // ... нэмэх эсэх
                  if (currentPage - showPages > 2) pageNumbers.push("...");
                  // Дунд хэсгийн хуудсууд
                  for (
                    let i = Math.max(2, currentPage - showPages);
                    i <= Math.min(totalPages - 1, currentPage + showPages);
                    i++
                  ) {
                    if (i !== 1 && i !== totalPages) pageNumbers.push(i);
                  }
                  // ... нэмэх эсэх
                  if (currentPage + showPages < totalPages - 1)
                    pageNumbers.push("...");
                  // Сүүлийн хуудсыг нэмэх
                  if (totalPages > 1) pageNumbers.push(totalPages);
                  // Давхардал арилгах
                  const uniquePages = pageNumbers.filter(
                    (v, i, arr) => arr.indexOf(v) === i
                  );
                  return uniquePages.map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={"ellipsis-" + idx}
                        className="px-4 py-2 text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(Number(page))}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`rounded-md ${
                          currentPage === page
                            ? "bg-black text-white"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Keep existing logout modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Системээс гарах</h3>
            <p className="mb-4">Та системээс гарахдаа итгэлтэй байна уу?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Үгүй
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Тийм
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;
