import Image from "next/image";
import Link from "next/link";
import React from "react";

// Тогтмол утгуудыг дээр зарлах
const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/tengerinsurance/",
    icon: "/icons/facebook.svg",
    alt: "fb",
  },
  {
    href: "https://www.instagram.com/tengerdaatgal.official/",
    icon: "/icons/instagram.svg",
    alt: "instagram",
  },
  {
    href: "https://www.twitter.com/tenger_daatgal/",
    icon: "/icons/twitter.svg",
    alt: "twitter",
  },
  {
    href: "https://www.linkedin.com/company/tengerinsurance/mycompany/",
    icon: "/icons/linked-in.svg",
    alt: "linkedin",
  },
];

const CONTACT_INFO = [
  {
    icon: "/icons/phoneB.svg",
    content: <Link href="tel:18001889">1800-1889</Link>,
  },
  {
    icon: "/icons/mailB.svg",
    content: (
      <Link href="mailto:insurance@tengerinsurance.mn">
        insurance@tengerinsurance.mn
      </Link>
    ),
  },
  {
    icon: "/icons/clockB.svg",
    content: (
      <p>
        Даваа-Баасан: 08:30-19:00 <br /> Бямба,Ням: Амарна
      </p>
    ),
  },
  {
    icon: "/icons/locationB.svg",
    content: (
      <p>CITY CENTER, 10 давхар СБД, 8-р хороо, Улаанбаатар, Монгол улс</p>
    ),
  },
];

// Жижиг компонент үүсгэх
const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href} className="hover:text-gray-300 transition-colors">
    {children}
  </Link>
);

const ContactItem = ({
  icon,
  content,
}: {
  icon: string;
  content: React.ReactNode;
}) => (
  <div className="flex gap-5 items-center">
    <Image
      src={icon}
      width={48}
      height={48}
      loading="lazy"
      alt="icon"
      className="w-8 h-8"
    />
    {content}
  </div>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-8 sm:pt-14 bg-[#000080] text-white font-light">
      <div className="default-width mdl:flex">
        {/* Logo section */}
        <div className="min-w-[120px] sm:min-w-[200px] px-4 w-400:px-10 sm:px-20 mdl:px-0 mt-1">
          <Image
            src="/images/whitelogo.png"
            width={150}
            height={38}
            loading="lazy"
            alt="white logo"
            className="w-[130px] h-auto mx-auto mdl:mx-0"
          />
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-3 gap-2 my-10 mdl:my-0">
          {/* About Us Links */}
          <div className="footerLinks pl-3 w-500:pl-6 sm:pl-10 md:pl-20 mdl:pl-0">
            <h3 className="footer-heading">Бидний тухай</h3>
            <FooterLink href="/about">Компанийн танилцуулга</FooterLink>
            <FooterLink href="/about#ourHistory">Түүхэн замнал</FooterLink>
            <FooterLink href="/about#leaders">Удирдлагын баг</FooterLink>
            <FooterLink href="/about#responsible">
              Нийгмийн хариуцлага
            </FooterLink>
            <FooterLink href="/about#companyCodex">Тайлан</FooterLink>
            <FooterLink href="/posts">Мэдээ</FooterLink>
          </div>

          {/* Products Links */}
          <div className="footerLinks pl-3 w-500:pl-6 sm:pl-10 md:pl-20 mdl:pl-0">
            <h3 className="footer-heading">Бүтээгдэхүүн</h3>
            <FooterLink href="/retail/12">Машины даатгал</FooterLink>
            <FooterLink href="/retail/4">Гадаад аяллын даатгал</FooterLink>
            <FooterLink href="/retail/9">Дотоод аяллын даатгал</FooterLink>
            <FooterLink href="/retail/3">Гэнэтийн ослын даатгал</FooterLink>
            <FooterLink href="/retail/1">Хүүхдийн даатгал</FooterLink>
            <FooterLink href="/retail/25">Орон сууцны даатгал</FooterLink>
            <FooterLink href={"/retail/23"}>
              Жолоочийн албан журмын даатгал
            </FooterLink>
            <FooterLink href="/financial-adjustment">
              СЗХ-нд бүртгэлтэй даатгалын бүтээгдэхүүнүүд
            </FooterLink>
          </div>

          {/* Services Links */}
          <div className="footerLinks pl-3 w-500:pl-6 sm:pl-10 md:pl-20 mdl:pl-0">
            <h3 className="footer-heading">Үйлчилгээ</h3>
            <FooterLink href="/retail">Иргэд</FooterLink>
            <FooterLink href="/corporate">Байгууллага</FooterLink>
            <FooterLink href="/info/indemnity">Нөхөн төлбөр</FooterLink>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mdl:w-[300px] border-t mdl:border-t-0 pt-10 mdl:pt-0 border-[#d9d9d9]/10 px-4 w-400:px-10 sm:px-20 mdl:px-0">
          <h3 className="underline underline-offset-4 font-bold text-sm mb-6">
            Холбоо барих
          </h3>
          <div className="grid gap-5 text-xs">
            {CONTACT_INFO.map((item, index) => (
              <ContactItem key={index} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-[#3d3f82] mt-10 pt-3 sm:pt-6 pb-6 default-width sm:flex gap-6 justify-between sm:items-center">
        <div className="text-center sm:text-start mb-4 sm:mb-1">
          <p className="text-xs sm:text-sm">
            © Copyright {currentYear}, Tenger Insurance
          </p>
          <FooterLink href="https://ubisol.mn">
            <span className="text-[11px] sm:text-xs">
              Developed by Tenger Daatgal.LLC
            </span>
          </FooterLink>
        </div>

        {/* Social Links */}
        <div className="flex gap-5 sm:gap-8 items-center justify-center sm:justify-end">
          {SOCIAL_LINKS.map((social, index) => (
            <FooterLink key={index} href={social.href}>
              <Image
                src={social.icon}
                width={20}
                height={20}
                loading="lazy"
                className="w-4 h-4 sm:w-5 sm:h-5"
                alt={social.alt}
              />
            </FooterLink>
          ))}
        </div>
      </div>
    </footer>
  );
};
