"use client";
import "./globals.css";

import React from "react";
import { AgentAuthProvider } from "@/providers/AgentAuthContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AgentAuthProvider>
          <Toaster position="top-center" />
          <main>{children}</main>
        </AgentAuthProvider>
      </body>
    </html>
  );
}
