"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "./AnimatedBeam";
import Tenger from "../../../public/logo.png";
import Mandal from "@/../../public/mandal.png";
import Odoo from "@/../../public/odoo.png";
import Qpay from "@/../../public/qpay.jpg";
import Golomt from "@/../../public/golomt.png";
import Operator from "@/../../public/customer-services.png";
import Image from "next/image";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex  w-[80%]  h-[300px] items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full    flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between ">
          <Circle ref={div1Ref} className="size-14">
            <Icons.googleDrive />
          </Circle>
          <Circle ref={div5Ref} className="size-14">
            <Icons.googleDocs />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between ">
          <Circle ref={div2Ref} className="size-14">
            <Icons.notion />
          </Circle>
          <Circle ref={div4Ref} className="size-16 ">
            <Icons.openai />
          </Circle>
          <Circle ref={div6Ref} className="size-14">
            <Icons.zapier />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between ">
          <Circle ref={div3Ref} className="size-14">
            <Icons.whatsapp />
          </Circle>
          <Circle ref={div7Ref} className="size-14">
            <Icons.messenger />
          </Circle>
        </div>
      </div>
      <div className="absolute top-0  w-full h-full ">
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div4Ref}
          curvature={-75}
          endYOffset={-10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div2Ref}
          toRef={div4Ref}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div4Ref}
          curvature={75}
          endYOffset={10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div5Ref}
          toRef={div4Ref}
          curvature={-75}
          endYOffset={-10}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div6Ref}
          toRef={div4Ref}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div7Ref}
          toRef={div4Ref}
          curvature={75}
          endYOffset={10}
          reverse
        />
      </div>
    </div>
  );
}

const Icons = {
  notion: () => (
    <Image
      src={Golomt.src}
      alt="Golomt Bank Logo"
      height={50}
      width={50}
      className="rounded-[20px]"
    />
  ),

  openai: () => (
    <Image
      src={Operator.src}
      alt="Golomt Bank Logo"
      height={50}
      width={50}
      className="rounded-[20px]"
    />
  ),

  googleDrive: () => (
    <Image src={Mandal.src} alt="Golomt Bank Logo" height={60} width={60} />
  ),
  whatsapp: () => (
    <Image
      src={Qpay.src}
      alt="Golomt Bank Logo"
      height={60}
      width={60}
      className="rounded-[20px]"
    />
  ),
  googleDocs: () => (
    <Image src={Tenger.src} alt="Golomt Bank Logo" height={50} width={50} />
  ),
  zapier: () => (
    <Image
      src={Odoo.src}
      alt="Golomt Bank Logo"
      height={50}
      width={50}
      className="rounded-[10px]"
    />
  ),
  messenger: () => (
    <Image
      src={"https://miis.ami.mn/logo/logo.svg"}
      alt="Golomt Bank Logo"
      height={50}
      width={50}
    />
  ),
};
