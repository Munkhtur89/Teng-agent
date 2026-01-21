"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentAuth } from "@/providers/AgentAuthContext";
import { FlipText } from "@/components/flipText";
import { AnimatedBeamDemo } from "@/components/beam";
import Logo from "../../public/images/logo-white2.png";
import { authApi } from "@/lib/api";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 ",
        className
      )}
      {...props}
    />
  );
}

const AgentPage = () => {
  const router = useRouter();
  const { loginAgent } = useAgentAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  // 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const payload: { login: string; password: string; totp_code?: string } = {
        login,
        password,
      };

      // Хэрэв 2FA шаардлагатай бол totp_code код нэмэх
      if (requires2FA && totpCode.length === 6) {
        payload.totp_code = totpCode;
      }

      const data = await authApi.authenticate(payload);

      // 2FA шаардлагатай эсэхийг шалгах
      if (data?.result?.requires_2fa === true) {
        setRequires2FA(true);
        // Алдааны мессеж байвал харуулах (OTP код буруу байх үед)
        if (data.result.error) {
          setErrorMessage(data.result.error);
          // OTP код буруу байвал талбаруудыг цэвэрлэх
          if (
            data.result.error.includes("Invalid TOTP") ||
            data.result.error.includes("Invalid")
          ) {
            setTotpCode("");
          }
        } else {
          setErrorMessage("2FA is enabled. Please provide totp_code");
        }
        setIsLoading(false);
        return;
      }

      // Алдаа шалгах - data.result.error эсвэл data.error
      if (data?.result?.error) {
        setErrorMessage(data.result.error);
        setIsLoading(false);
        return;
      }

      if (data.error) {
        setErrorMessage(data.error.data?.message || data.error);
        setIsLoading(false);
        return;
      }

      // Амжилттай нэвтэрсэн
      if (data.result?.user_id) {
        loginAgent(
          data.result.user_id.toString(),
          data.result.token,
          data.result.refreshToken
        );
        router.push("/agentPage");
      }
    } catch (error: any) {
      console.error("Нэвтрэх үед алдаа гарлаа:", error);
      setErrorMessage(error?.message || "Нэвтрэх үед алдаа гарлаа");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-[#000080] relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effect */}

      <div className="w-[2000px] px-auto">
        <div className="absolute top-35 left-1/2 transform -translate-x-1/2 mt-10">
          <FlipText className="text-4xl font-bold -tracking-widest text-black text-white md:text-4xl md:leading-[5rem]">
            Тэнгэр агент
          </FlipText>
        </div>

        <div className="w-full h-full items-center justify-center flex pt-10 ">
          <AnimatedBeamDemo />
        </div>

        {/* <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-800/50 to-black" /> */}

        {/* Top radial glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-400/20 blur-[80px]" />
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-blue-300/20 blur-[60px]"
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-blue-400/20 blur-[60px]"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 1,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-sm relative z-10 mx-auto"
          style={{ perspective: 1500 }}
        >
          <motion.div
            className="relative"
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ z: 10 }}
          >
            <div className="relative group">
              {/* Card border glow */}
              <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
              {/* Glass card background */}
              <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.3] shadow-2xl overflow-hidden">
                {/* Logo and header */}
                <div className="text-center space-y-1 mb-5">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="mx-auto rounded-full  flex items-center justify-center relative overflow-hidden"
                  >
                    <img src={Logo.src} alt="logo" width={120} height={120} />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/60 text-xs py-2"
                  >
                    Тэнгэр агент руу нэвтрэх
                  </motion.p>
                </div>
                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div className="space-y-3">
                    {/* Login input */}
                    <motion.div
                      className={`relative ${
                        focusedInput === "login" ? "z-10" : ""
                      }`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Mail
                          className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "login"
                              ? "text-white"
                              : "text-white/40"
                          }`}
                        />
                        <Input
                          type="text"
                          placeholder="Нэвтрэх нэр"
                          value={login}
                          onChange={(e) => {
                            setLogin(e.target.value);
                            setErrorMessage("");
                          }}
                          onFocus={() => setFocusedInput("login")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                          required
                        />
                        {focusedInput === "login" && (
                          <motion.div
                            layoutId="input-highlight"
                            className="absolute inset-0 bg-white/5 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </div>
                    </motion.div>
                    {/* Password input */}
                    <motion.div
                      className={`relative ${
                        focusedInput === "password" ? "z-10" : ""
                      }`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Lock
                          className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "password"
                              ? "text-white"
                              : "text-white/40"
                          }`}
                        />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Нууц үг"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMessage("");
                          }}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                          required
                        />
                        <div
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 cursor-pointer"
                        >
                          {showPassword ? (
                            <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                          ) : (
                            <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                          )}
                        </div>
                        {focusedInput === "password" && (
                          <motion.div
                            layoutId="input-highlight"
                            className="absolute inset-0 bg-white/5 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </div>
                    </motion.div>

                    {/* OTP код оруулах талбар - 2FA идэвхтэй үед */}
                    {requires2FA && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`relative ${
                          focusedInput === "totp" ? "z-10" : ""
                        }`}
                        whileFocus={{ scale: 1.02 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <div className="relative flex items-center overflow-hidden rounded-lg">
                          <Lock
                            className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                              focusedInput === "totp"
                                ? "text-white"
                                : "text-white/40"
                            }`}
                          />
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="OTP код (6 орон)"
                            value={totpCode}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);
                              setTotpCode(value);
                              setErrorMessage("");
                            }}
                            onFocus={() => setFocusedInput("totp")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10 text-center text-lg font-mono tracking-widest"
                            maxLength={6}
                            required={requires2FA}
                          />
                          {focusedInput === "totp" && (
                            <motion.div
                              layoutId="input-highlight-totp"
                              className="absolute inset-0 bg-white/5 -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Алдааны мессеж */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2"></div>
                    <div className="text-xs relative group/link">
                      <a
                        href="#"
                        className="text-white/60 hover:text-white transition-colors duration-200"
                      >
                        Нууц үг мартсан?
                      </a>
                    </div>
                  </div>
                  {/* Sign in button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group/button mt-5"
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                    <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                        style={{
                          opacity: isLoading ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center"
                          >
                            <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.span
                            key="button-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-1 text-sm font-medium"
                          >
                            Нэвтрэх
                            <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                  {/* Divider */}
                  <div className="relative mt-2 mb-5 flex items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <motion.span
                      className="mx-3 text-xs text-white/40"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: [0.7, 0.9, 0.7] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      эсвэл
                    </motion.span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>
                  {/* Google Sign In */}
                  {/* <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full relative group/google"
                  >
                    <div className="absolute inset-0 bg-white/5 rounded-lg blur opacity-0 group-hover/google:opacity-70 transition-opacity duration-300" />
                    <div className="relative overflow-hidden bg-white/5 text-white font-medium h-10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center text-white/80 group-hover/google:text-white transition-colors duration-300">
                        G
                      </div>
                      <span className="text-white/80 group-hover/google:text-white transition-colors text-xs">
                        Google-ээр нэвтрэх
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{
                          duration: 1,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  </motion.button> */}
                  {/* Sign up link */}
                  <motion.p
                    className="text-center text-xs text-white/60 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Бүртгэлгүй юу?{" "}
                    <a href="#" className="relative inline-block group/signup">
                      <span className="relative z-10 text-white group-hover/signup:text-white/70 transition-colors duration-300 font-medium">
                        Бүртгүүлэх
                      </span>
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signup:w-full transition-all duration-300" />
                    </a>
                  </motion.p>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentPage;
