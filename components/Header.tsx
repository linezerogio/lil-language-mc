"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";

const links = {
  linezeroStudio: "https://linezerostudio.webflow.io",
  buyMeACoffee: "https://buymeacoffee.com/linezerostudio",
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex justify-between w-full items-center relative">
      <div className="flex-col hidden md:flex">
        <div className="font-extrabold text-collection-1-light-gray text-[39px] tracking-[1.95px] leading-[normal] text-start">
          LLMC
        </div>
        <div className="font-semibold text-[#72e6cf] text-[18px] tracking-[0] leading-[normal] text-start">
          alpha
        </div>
      </div>

      <div className="flex-col md:hidden">
        <svg
          width="53"
          height="26"
          viewBox="0 0 53 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M46.3248 13.7807C42.3712 13.7807 39.4014 10.8676 39.4014 7.02757C39.4014 3.18754 42.3712 0.274414 46.3248 0.274414C49.7486 0.274414 52.4537 2.48763 53.0023 5.57101H49.5406C49.1055 4.28469 47.8381 3.41454 46.3248 3.41454C44.2818 3.41454 42.7307 4.96568 42.7307 7.02757C42.7307 9.08946 44.2818 10.6406 46.3248 10.6406C47.8381 10.6406 49.1055 9.77045 49.5406 8.48413H53.0023C52.4537 11.5675 49.7486 13.7807 46.3248 13.7807Z"
            fill="currentColor"
          />
          <path
            d="M21.9736 13.5538V0.501465H26.0028L29.3699 6.91413L32.756 0.501465H36.7284V13.5538H33.4748V5.3819L30.2779 11.4919H28.4241L25.2273 5.3819V13.5538H21.9736Z"
            fill="currentColor"
          />
          <path
            d="M11.2363 13.5538V0.501465H14.49V10.4893H19.5028V13.5538H11.2363Z"
            fill="currentColor"
          />
          <path
            d="M0.5 13.5538V0.501465H3.75362V10.4893H8.76647V13.5538H0.5Z"
            fill="currentColor"
          />
          <path
            d="M21.4562 24.1717C20.2164 24.1717 19.2822 23.1677 19.2822 21.8406C19.2822 20.5135 20.2164 19.5095 21.4562 19.5095C22.0498 19.5095 22.5475 19.7452 22.9054 20.1381V19.6143H24.0404V24.0669H22.9054V23.5431C22.5475 23.936 22.0498 24.1717 21.4562 24.1717ZM21.6744 23.0716C22.3816 23.0716 22.9054 22.5391 22.9054 21.8406C22.9054 21.1422 22.3816 20.6096 21.6744 20.6096C20.976 20.6096 20.4521 21.1422 20.4521 21.8406C20.4521 22.5391 20.976 23.0716 21.6744 23.0716Z"
            fill="#5CE2C7"
          />
          <path
            d="M14.1904 24.0668V17.7808H15.3254V20.138C15.6746 19.7277 16.1636 19.5094 16.7398 19.5094C17.7875 19.5094 18.4772 20.1904 18.4772 21.2381V24.0668H17.3422V21.6048C17.3422 21.0024 16.958 20.6095 16.3731 20.6095C15.7445 20.6095 15.3254 21.0111 15.3254 21.6222V24.0668H14.1904Z"
            fill="#5CE2C7"
          />
          <path
            d="M8.58887 25.7257V19.6143H9.72385V20.1381C10.0818 19.7452 10.5795 19.5095 11.1731 19.5095C12.4129 19.5095 13.3383 20.5135 13.3383 21.8406C13.3383 23.1677 12.4129 24.1717 11.1731 24.1717C10.5795 24.1717 10.0818 23.936 9.72385 23.5431V25.7257H8.58887ZM10.9461 23.0716C11.6533 23.0716 12.1684 22.5391 12.1684 21.8406C12.1684 21.1422 11.6533 20.6096 10.9461 20.6096C10.2477 20.6096 9.72385 21.1422 9.72385 21.8406C9.72385 22.5391 10.2477 23.0716 10.9461 23.0716Z"
            fill="#5CE2C7"
          />
          <path
            d="M6.35449 24.0668V17.7808H7.48948V24.0668H6.35449Z"
            fill="#5CE2C7"
          />
          <path
            d="M2.67393 24.1717C1.43418 24.1717 0.5 23.1677 0.5 21.8406C0.5 20.5135 1.43418 19.5095 2.67393 19.5095C3.26762 19.5095 3.76526 19.7452 4.12322 20.1381V19.6143H5.2582V24.0669H4.12322V23.5431C3.76526 23.936 3.26762 24.1717 2.67393 24.1717ZM2.8922 23.0716C3.59938 23.0716 4.12322 22.5391 4.12322 21.8406C4.12322 21.1422 3.59938 20.6096 2.8922 20.6096C2.19375 20.6096 1.66991 21.1422 1.66991 21.8406C1.66991 22.5391 2.19375 23.0716 2.8922 23.0716Z"
            fill="#5CE2C7"
          />
        </svg>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex gap-5">
        <a
          href={links.linezeroStudio}
          className="bg-white dark:bg-[#1b1c1d] text-[#1b1c1d] dark:text-white text-[16px] flex gap-2.5 items-center py-[9px] px-[19px] rounded-xl font-[neulis-sans] font-bold tracking-wider"
        >
          <Image
            src="/LineZeroLogo.svg"
            alt="Linezero Studio"
            width={27}
            height={41}
          />
          LineZero Studio
        </a>
        <a
          href={links.buyMeACoffee}
          className="bg-white dark:bg-[#1b1c1d] flex gap-3 rounded-xl px-[19px]"
        >
          <Image
            src="/BuyMeACoffeeLogo.svg"
            alt="Buy me a coffee"
            width={26.56}
            height={38.4}
            className="dark:hidden"
          />
          <Image
            src="/BuyMeACoffeeText.svg"
            alt="Buy me a coffee"
            width={136.94}
            height={25.24}
            className="dark:hidden"
          />
          <Image
            src="/BuyMeACoffeeLogoDark.svg"
            alt="Buy me a coffee"
            width={26.56}
            height={38.4}
            className="hidden dark:block"
          />
          <Image
            src="/BuyMeACoffeeTextDark.svg"
            alt="Buy me a coffee"
            width={136.94}
            height={25.24}
            className="hidden dark:block"
          />
        </a>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden text-[#1b1c1d] dark:text-white"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M3.12408 13.6471C2.61259 14.1586 1.78331 14.1586 1.27183 13.6471C0.760343 13.1356 0.760343 12.3063 1.27183 11.7948L5.9457 7.12095L1.27183 2.44708C0.760343 1.93559 0.760343 1.10631 1.27183 0.594827C1.78331 0.0833419 2.61259 0.0833415 3.12408 0.594826L7.79795 5.2687L12.4718 0.594826C12.9833 0.0833406 13.8126 0.0833413 14.3241 0.594826C14.8356 1.10631 14.8356 1.93559 14.3241 2.44708L9.6502 7.12095L14.3241 11.7948C14.8356 12.3063 14.8356 13.1356 14.3241 13.6471C13.8126 14.1586 12.9833 14.1586 12.4718 13.6471L7.79795 8.9732L3.12408 13.6471Z"
            />
          </svg>
        ) : (
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.16667 11.6667C1.24619 11.6667 0.5 10.9205 0.5 10C0.5 9.07952 1.24619 8.33333 2.16667 8.33333H18.8333C19.7538 8.33333 20.5 9.07952 20.5 10C20.5 10.9205 19.7538 11.6667 18.8333 11.6667H2.16667Z"
              fill="currentColor"
            />
            <path
              d="M8.97565 16.6667C8.05517 16.6667 7.30898 17.4129 7.30898 18.3333C7.30898 19.2538 8.05518 20 8.97565 20H18.8333C19.7538 20 20.5 19.2538 20.5 18.3333C20.5 17.4129 19.7538 16.6667 18.8333 16.6667H8.97565Z"
              fill="currentColor"
            />
            <path
              d="M8.97565 0C8.05517 0 7.30898 0.746192 7.30898 1.66667C7.30898 2.58714 8.05518 3.33333 8.97565 3.33333H18.8333C19.7538 3.33333 20.5 2.58714 20.5 1.66667C20.5 0.746192 19.7538 0 18.8333 0L8.97565 0Z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-full md:w-auto dark:bg-white bg-[#1b1c1d] rounded-xl shadow-lg z-50 flex flex-col gap-3 p-4 md:hidden">
          <a
            href={links.linezeroStudio}
            className="bg-white dark:bg-[#1b1c1d] text-[#1b1c1d] dark:text-white text-[16px] flex gap-2.5 items-center py-[9px] px-[19px] rounded-xl font-[neulis-sans] font-bold tracking-wider border border-gray-200 dark:border-gray-700"
          >
            <Image
              src="/LineZeroLogo.svg"
              alt="Linezero Studio"
              width={27}
              height={41}
            />
            LineZero Studio
          </a>
          <a
            href={links.buyMeACoffee}
            className="bg-white dark:bg-[#1b1c1d] flex gap-3 rounded-xl px-[19px] py-[9px] items-center border border-gray-200 dark:border-gray-700"
          >
            <Image
              src="/BuyMeACoffeeLogo.svg"
              alt="Buy me a coffee"
              width={26.56}
              height={38.4}
              className="dark:hidden"
            />
            <Image
              src="/BuyMeACoffeeText.svg"
              alt="Buy me a coffee"
              width={136.94}
              height={25.24}
              className="dark:hidden"
            />
            <Image
              src="/BuyMeACoffeeLogoDark.svg"
              alt="Buy me a coffee"
              width={26.56}
              height={38.4}
              className="hidden dark:block"
            />
            <Image
              src="/BuyMeACoffeeTextDark.svg"
              alt="Buy me a coffee"
              width={136.94}
              height={25.24}
              className="hidden dark:block"
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default Header;
