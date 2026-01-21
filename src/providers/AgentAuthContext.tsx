"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { authApi } from "@/lib/api";

interface AgentAuthContextType {
  isAgentAuthenticated: boolean;
  agentId: string | number | null;
  token: string | null;
  setToken: (token: string | null) => void;
  refreshToken: () => Promise<boolean>;
  loginAgent: (id: string, token: string, refreshToken?: string) => void;
  logoutAgent: () => void;
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(
  undefined
);

const AGENT_AUTH_COOKIE = "agent_auth";
const AGENT_ID_COOKIE = "agent_id";
const AGENT_TOKEN_COOKIE = "authToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

export function AgentAuthProvider({ children }: { children: ReactNode }) {
  const [isAgentAuthenticated, setIsAgentAuthenticated] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    null
  );

  useEffect(() => {
    const authCookie = Cookies.get(AGENT_AUTH_COOKIE);
    const savedAgentId = Cookies.get(AGENT_ID_COOKIE);
    const savedToken = Cookies.get(AGENT_TOKEN_COOKIE);
    const savedRefreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

    if (authCookie === "true" && savedAgentId && savedToken) {
      setIsAgentAuthenticated(true);
      setAgentId(savedAgentId);
      setToken(savedToken);
      setRefreshTokenValue(savedRefreshToken || null);
    }
  }, []);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("agent_token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
            logoutAgent();
          }
        } catch (error) {
          console.error("Token шалгах үед алдаа гарлаа:", error);
          logoutAgent();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const loginAgent = (id: string, token: string, refreshToken?: string) => {
    Cookies.set(AGENT_AUTH_COOKIE, "true", { expires: 7 });
    Cookies.set(AGENT_ID_COOKIE, id, { expires: 7 });
    Cookies.set(AGENT_TOKEN_COOKIE, token, { expires: 7 });
    if (refreshToken) {
      Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { expires: 7 });
      setRefreshTokenValue(refreshToken);
    }

    setIsAgentAuthenticated(true);
    setAgentId(id);
    setToken(token);
  };

  const logoutAgent = useCallback(() => {
    Cookies.remove(AGENT_AUTH_COOKIE);
    Cookies.remove(AGENT_ID_COOKIE);
    Cookies.remove(AGENT_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    setIsAgentAuthenticated(false);
    setAgentId(null);
    setToken(null);
    setRefreshTokenValue(null);
  }, []);

  const refreshToken = async () => {
    try {
      const currentRefreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

      if (!currentRefreshToken) {
        throw new Error("Refresh token not found");
      }

      const data = await authApi.refreshToken({
        jsonFormat: 1,
        refreshToken: currentRefreshToken,
      });

      if (data.result) {
        const {
          token: newToken,
          refreshToken: newRefreshToken,
          user_id,
        } = data.result;

        loginAgent(user_id.toString(), newToken, newRefreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token шинэчлэх үед алдаа гарлаа:", error);
      logoutAgent();
      return false;
    }
  };

  return (
    <AgentAuthContext.Provider
      value={{
        isAgentAuthenticated,
        agentId,
        token,
        setToken,
        refreshToken,
        loginAgent,
        logoutAgent,
      }}
    >
      {children}
    </AgentAuthContext.Provider>
  );
}

export function useAgentAuth() {
  const context = useContext(AgentAuthContext);
  if (context === undefined) {
    throw new Error("useAgentAuth must be used within an AgentAuthProvider");
  }
  return context;
}
