import React from 'react';
import Image from 'next/image';

const links = {
  linezeroStudio: 'https://linezerostudio.webflow.io',
  buyMeACoffee: 'https://buymeacoffee.com/linezerostudio',
}

const Header: React.FC = () => {
    return (
        
        <div className='flex justify-between w-full items-center'>
            <div className='flex flex-col'>
              <div className="font-extrabold text-collection-1-light-gray text-[39px] tracking-[1.95px] leading-[normal] text-start">
                  LLMC
              </div>
              <div className="font-semibold text-[#72e6cf] text-[18px] tracking-[0] leading-[normal] text-start">
                  alpha
              </div>
            </div>
            <div className='flex gap-5'>
              <a href={links.linezeroStudio} className='bg-white dark:bg-[#1b1c1d] text-[#1b1c1d] dark:text-white text-[16px] flex gap-2.5 items-center py-[9px] px-[19px] rounded-xl font-[neulis-sans] font-bold tracking-wider'>
                <Image src='/LineZeroLogo.svg' alt='Linezero Studio' width={27} height={41} />
                LineZero Studio
              </a>
              <a href={links.buyMeACoffee} className='bg-white dark:bg-[#1b1c1d] flex gap-3 rounded-xl px-[19px]'>
                <Image src='/BuyMeACoffeeLogo.svg' alt='Buy me a coffee' width={26.56} height={38.4} className='dark:hidden' />
                <Image src='/BuyMeACoffeeText.svg' alt='Buy me a coffee' width={136.94} height={25.24} className='dark:hidden' />
                <Image src='/BuyMeACoffeeLogoDark.svg' alt='Buy me a coffee' width={26.56} height={38.4} className='hidden dark:block' />
                <Image src='/BuyMeACoffeeTextDark.svg' alt='Buy me a coffee' width={136.94} height={25.24} className='hidden dark:block' />
              </a>
            </div>
        </div>
    );
};

export default Header;