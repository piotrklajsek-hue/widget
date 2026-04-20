import { useState, useRef, useEffect } from 'react';
import svgPaths from "./svg-jorrrc2mql";
import imgImage54 from "figma:asset/64c15b1cf3b110e6801db2508c6b151105e182ac.png";
import imgLogoNanei from "figma:asset/9084835665e8be6cbb61b436529e8b3fa06d7631.png";
import DataView from '../components/DataView';

function Cien() {
  return <div className="absolute bg-gradient-to-b from-white bottom-0 left-[684px] shadow-[-20px_4px_200px_0px_#f2f2f8] to-[rgba(255,255,255,0)] top-[80px] w-[152px] hidden xl:block" data-name="cień" />;
}

function Grid() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Grid">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[48px]" data-name="BG">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" fill="var(--fill-0, white)" id="BG" r="24" />
        </svg>
      </div>
      <div className="col-1 ml-[12px] mt-[12px] overflow-clip relative row-1 size-[24px]" data-name="Icon/24px/Grid">
        <div className="absolute inset-[12.5%_58.33%_58.33%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-12.86%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.8 8.8">
              <path d={svgPaths.p2ee28d80} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[12.5%_12.5%_58.33%_58.33%]" data-name="Vector">
          <div className="absolute inset-[-12.86%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.8 8.8">
              <path d={svgPaths.p2ee28d80} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[58.33%_12.5%_12.5%_58.33%]" data-name="Vector">
          <div className="absolute inset-[-12.86%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.8 8.8">
              <path d={svgPaths.p2ee28d80} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[58.33%_58.33%_12.5%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-12.86%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.8 8.8">
              <path d={svgPaths.p2ee28d80} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Grid />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">{`Live `}</p>
    </div>
  );
}

function Inbox() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Inbox">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Inbox">
          <path d={svgPaths.p1e107380} fill="var(--fill-0, #1E232A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame52() {
  return (
    <div className="absolute bg-[#0b5cff] content-stretch flex flex-col items-center left-[28px] px-[4px] rounded-[100px] top-[7.5px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[10px] text-white">2</p>
    </div>
  );
}

function Frame17({ isActive, onClick }: { isActive?: boolean; onClick?: () => void }) {
  return (
    <div 
      className={`content-stretch flex gap-[16px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}
      onClick={onClick}
    >
      <Inbox />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Inbox</p>
      <Frame52 />
    </div>
  );
}

function Calendar() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[10px] relative rounded-[10px] shrink-0 size-[48px]" data-name="Calendar">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icon/24px/Calendar">
        <div className="absolute inset-[16.67%_12.5%_8.33%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-5.56%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path d={svgPaths.p371e6400} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[66.67%] right-[33.33%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-25%_-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 6">
              <path d="M1 1V5" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3/4 left-[33.33%] right-[66.67%] top-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-25%_-1px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 6">
              <path d="M1 1V5" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[41.67%_12.5%_58.33%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-1px_-5.56%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 2">
              <path d="M1 1H19" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Calendar />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Calendar</p>
    </div>
  );
}

function Profile() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Profile">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[48px]" data-name="BG">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="BG" />
        </svg>
      </div>
      <div className="col-1 ml-[12px] mt-[12px] overflow-clip relative row-1 size-[24px]" data-name="Icon/24px/User">
        <div className="absolute inset-[62.5%_16.67%_12.5%_16.67%]" data-name="Vector">
          <div className="absolute inset-[-16.67%_-6.25%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 8">
              <path d={svgPaths.p17060240} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[12.5%_33.33%_54.17%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
              <path d={svgPaths.pb08b100} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Profile />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Clients</p>
    </div>
  );
}

function Files() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Files">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[48px]" data-name="BG">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="BG" />
        </svg>
      </div>
      <div className="col-1 ml-[12px] mt-[12px] overflow-clip relative row-1 size-[24px]" data-name="Icon/24px/Files">
        <div className="absolute inset-[8.33%_16.67%]" data-name="Vector">
          <div className="absolute inset-[-5%_-6.25%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 22">
              <path d={svgPaths.p33716500} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[8.33%_16.67%_66.67%_58.33%]" data-name="Vector">
          <div className="absolute inset-[-16.67%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
              <path d="M1 1V7H7" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[54.17%_33.33%_45.83%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-1px_-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 2">
              <path d="M9 1H1" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[70.83%_33.33%_29.17%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-1px_-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 2">
              <path d="M9 1H1" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[37.5%_58.33%_62.5%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-1px_-50%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 2">
              <path d="M3 1H2H1" id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame20({ isActive, onClick }: { isActive?: boolean; onClick?: () => void }) {
  return (
    <div 
      className={`content-stretch flex gap-[16px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}
      onClick={onClick}
    >
      <Files />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Data</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Settings">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[48px]" data-name="BG">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="BG" />
        </svg>
      </div>
      <div className="col-1 ml-[12px] mt-[12px] overflow-clip relative row-1 size-[24px]" data-name="Icon/24px/Settings">
        <div className="absolute inset-[37.5%]" data-name="Vector">
          <div className="absolute inset-[-16.67%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
              <path d={svgPaths.p1e531d00} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <div className="absolute inset-[-4.55%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.pdd91970} id="Vector" stroke="var(--stroke-0, #1E232A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Settings />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Settings</p>
    </div>
  );
}

function Omnichannel() {
  return (
    <div className="relative shrink-0 size-[30px]" data-name="Omnichannel">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Omnichannel">
          <path d={svgPaths.p251b13f0} fill="var(--fill-0, #0B5CFF)" id="Vector" stroke="var(--stroke-0, #0B5CFF)" strokeWidth="0.2" />
        </g>
      </svg>
    </div>
  );
}

function Calendar1() {
  return (
    <div className="bg-[#e0eaff] content-stretch flex flex-col items-center justify-center p-[10px] relative rounded-[10px] shrink-0 size-[48px]" data-name="Calendar">
      <Omnichannel />
    </div>
  );
}

function Frame27({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <div 
      className="content-stretch flex gap-[16px] items-center relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      <Calendar1 />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0b5cff] text-[14px]">Omnichannel</p>
      <div className="overflow-clip relative shrink-0 size-[24px] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} data-name="leading-icon">
        <div className="absolute inset-[36.28%_26.72%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.175 6.585">
            <path d={svgPaths.pc951b80} fill="var(--fill-0, #1E232A)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame28() {
  return (
    <div className="opacity-60 relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[64px] relative w-full">
          <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Overview</p>
        </div>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[64px] relative w-full">
          <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Web chat</p>
        </div>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="opacity-60 relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[64px] relative w-full">
          <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">E-mail</p>
        </div>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="opacity-60 relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[64px] relative w-full">
          <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Phone</p>
        </div>
      </div>
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-full">
      <Frame28 />
      <Frame29 />
      <Frame31 />
      <Frame32 />
    </div>
  );
}

function Frame21() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0">
      <Frame27 isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out w-full"
        style={{ 
          maxHeight: isOpen ? '500px' : '0px',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="pt-[16px]">
          <Frame30 />
        </div>
      </div>
    </div>
  );
}

function Frame2({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) {
  return (
    <div className="relative rounded-[10px] shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[8px] items-start pb-[24px] pl-[20px] relative w-full">
        <Frame25 />
        <Frame17 isActive={activeSection === 'inbox'} onClick={() => onSectionChange('inbox')} />
        <Frame26 />
        <Frame18 />
        <Frame20 isActive={activeSection === 'data'} onClick={() => onSectionChange('data')} />
        <Frame19 />
        <Frame21 />
      </div>
    </div>
  );
}

function LogOut() {
  return (
    null
  );
}

function Frame1({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative">
      <div className="content-stretch flex flex-col items-start justify-between pb-[16px] pt-[40px] relative size-full">
        <div className="w-full flex flex-col gap-[24px]">
          <div className="pl-[20px]">
            <img src={imgLogoNanei} alt="nanei logo" className="w-[80px] h-auto" />
          </div>
          <Frame2 activeSection={activeSection} onSectionChange={onSectionChange} />
        </div>
        <LogOut />
      </div>
    </div>
  );
}

function Frame6({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) {
  return (
    <div className="content-stretch flex h-full items-start relative shrink-0 w-[220px] lg:w-[220px] min-w-[200px]">
      <Frame1 activeSection={activeSection} onSectionChange={onSectionChange} />
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-[#e9e9e9] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[10px] shrink-0">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(30,35,42,0.6)]">Not installed</p>
    </div>
  );
}

function Frame34({ isActive, onClick, tabRef }: { isActive: boolean; onClick: () => void; tabRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div 
      ref={tabRef}
      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-all duration-200"
      onClick={onClick}
    >
      <p className={`font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] ${
        isActive ? 'text-[#0b5cff]' : 'text-[#777]'
      }`}>{`Web `}</p>
      <Frame9 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="bg-[#e9e9e9] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[10px] shrink-0">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(30,35,42,0.6)]">Not installed</p>
    </div>
  );
}

function Frame35({ isActive, onClick, tabRef }: { isActive: boolean; onClick: () => void; tabRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div 
      ref={tabRef}
      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-all duration-200"
      onClick={onClick}
    >
      <p className={`font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] ${
        isActive ? 'text-[#0b5cff]' : 'text-[#777]'
      }`}>{`iOS `}</p>
      <Frame10 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="bg-[#e9e9e9] content-stretch flex items-center justify-center px-[8px] py-[2px] relative rounded-[10px] shrink-0">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(30,35,42,0.6)]">Not installed</p>
    </div>
  );
}

function Frame36({ isActive, onClick, tabRef }: { isActive: boolean; onClick: () => void; tabRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div 
      ref={tabRef}
      className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer hover:opacity-70 transition-all duration-200"
      onClick={onClick}
    >
      <p className={`font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] ${
        isActive ? 'text-[#0b5cff]' : 'text-[#777]'
      }`}>Android</p>
      <Frame11 />
    </div>
  );
}

function Frame8({ activeTab, onTabChange, tabRefs }: { activeTab: string; onTabChange: (tab: string) => void; tabRefs: { web: React.RefObject<HTMLDivElement>; ios: React.RefObject<HTMLDivElement>; android: React.RefObject<HTMLDivElement> } }) {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <Frame34 isActive={activeTab === 'web'} onClick={() => onTabChange('web')} tabRef={tabRefs.web} />
      <Frame35 isActive={activeTab === 'ios'} onClick={() => onTabChange('ios')} tabRef={tabRefs.ios} />
      <Frame36 isActive={activeTab === 'android'} onClick={() => onTabChange('android')} tabRef={tabRefs.android} />
    </div>
  );
}

function UngroupObjects() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Ungroup Objects">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Ungroup Objects">
          <path d={svgPaths.p2b3d1700} fill="var(--fill-0, #1E232A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Calendar2() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Customize chat</p>
        </div>
      </div>
    </div>
  );
}

function CustomizeButton() {
  return (
    null
  );
}

function Frame5({ activeTab, onTabChange, tabRefs }: { activeTab: string; onTabChange: (tab: string) => void; tabRefs: { web: React.RefObject<HTMLDivElement>; ios: React.RefObject<HTMLDivElement>; android: React.RefObject<HTMLDivElement> } }) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame8 activeTab={activeTab} onTabChange={onTabChange} tabRefs={tabRefs} />
      <CustomizeButton />
    </div>
  );
}

function Slider({ activeTab, tabRefs }: { activeTab: string; tabRefs: { web: React.RefObject<HTMLDivElement>; ios: React.RefObject<HTMLDivElement>; android: React.RefObject<HTMLDivElement> } }) {
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateSlider = () => {
      let targetRef: React.RefObject<HTMLDivElement> | null = null;
      
      switch (activeTab) {
        case 'web':
          targetRef = tabRefs.web;
          break;
        case 'ios':
          targetRef = tabRefs.ios;
          break;
        case 'android':
          targetRef = tabRefs.android;
          break;
      }
      
      if (targetRef?.current && containerRef.current) {
        const tabRect = targetRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        setSliderStyle({
          width: tabRect.width,
          left: tabRect.left - containerRect.left
        });
      }
    };
    
    updateSlider();
    
    // Update on window resize
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [activeTab, tabRefs]);
  
  return (
    <div ref={containerRef} className="content-stretch flex flex-col gap-[6px] h-[14px] items-start relative shrink-0 w-full" data-name="Slider">
      <div className="bg-[rgba(0,0,0,0.06)] h-[2px] rounded-[10px] shrink-0 w-full" data-name="Rectangle" />
      <div 
        className="absolute bg-[#0b5cff] h-[2px] rounded-[10px] top-0 transition-all duration-300 ease-in-out" 
        style={{ width: `${sliderStyle.width}px`, left: `${sliderStyle.left}px` }}
        data-name="Rectangle" 
      />
    </div>
  );
}

function Frame7({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const webRef = useRef<HTMLDivElement>(null);
  const iosRef = useRef<HTMLDivElement>(null);
  const androidRef = useRef<HTMLDivElement>(null);
  
  const tabRefs = { web: webRef, ios: iosRef, android: androidRef };
  
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0 w-full">
      <Frame5 activeTab={activeTab} onTabChange={onTabChange} tabRefs={tabRefs} />
      <Slider activeTab={activeTab} tabRefs={tabRefs} />
    </div>
  );
}

function Frame4() {
  const [activeTab, setActiveTab] = useState('web');
  
  return (
    <div className="sticky top-0 bg-white z-20 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start justify-center pl-[16px] sm:pl-[24px] lg:pl-[40px] pr-[16px] sm:pr-[24px] pt-[40px] pb-[16px] relative w-full">
          <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[28px]">Omnichannel settings</p>
          <Frame7 activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[8px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #ECECEC)" id="Ellipse 13" r="4" />
        </svg>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Instalacja</p>
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <Frame33 />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#777] text-[14px] w-[min-content] whitespace-pre-wrap">{`Skopiuj poniższy kod i wklej go na stronę WWW pomiędzy <body>, a <head>.`}</p>
    </div>
  );
}

function Calendar3() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">NodeJS</p>
        </div>
      </div>
    </div>
  );
}

function Frame12({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div 
      className={`content-stretch flex h-[35px] items-center justify-center px-[8px] relative rounded-[100px] shrink-0 cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-[#1e232a]' 
          : 'bg-[#e9e9e9] hover:bg-[#d9d9d9]'
      }`}
      onClick={onClick}
    >
      <div className="h-full relative shrink-0">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
            <p className={`font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] ${
              isActive ? 'text-white' : 'text-[#1e232a]'
            }`}>NodeJS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar4() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">JavaScript</p>
        </div>
      </div>
    </div>
  );
}

function Frame13({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div 
      className={`content-stretch flex h-[35px] items-center justify-center px-[8px] relative rounded-[100px] shrink-0 cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-[#1e232a]' 
          : 'bg-[#e9e9e9] hover:bg-[#d9d9d9]'
      }`}
      onClick={onClick}
    >
      <div className="h-full relative shrink-0">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
            <p className={`font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] ${
              isActive ? 'text-white' : 'text-[#1e232a]'
            }`}>JavaScript</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar5() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">PHP</p>
        </div>
      </div>
    </div>
  );
}

function Frame14({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  return (
    <div 
      className={`content-stretch flex h-[35px] items-center justify-center px-[8px] relative rounded-[100px] shrink-0 cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-[#1e232a]' 
          : 'bg-[#e9e9e9] hover:bg-[#d9d9d9]'
      }`}
      onClick={onClick}
    >
      <div className="h-full relative shrink-0">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
            <p className={`font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] ${
              isActive ? 'text-white' : 'text-[#1e232a]'
            }`}>PHP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame51({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame12 isActive={activeTab === 'nodejs'} onClick={() => onTabChange('nodejs')} />
      <Frame13 isActive={activeTab === 'javascript'} onClick={() => onTabChange('javascript')} />
      <Frame14 isActive={activeTab === 'php'} onClick={() => onTabChange('php')} />
    </div>
  );
}

function Frame49({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#777] text-[14px]">Kod dla</p>
      <Frame51 activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function Frame22({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[940px]">
      <Frame48 />
      <Frame49 activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 text-[#777]">
      <p className="leading-[normal] relative shrink-0 w-[8px] whitespace-pre-wrap">1</p>
      <p className="leading-[0] relative shrink-0">
        <span className="leading-[normal] text-[#1e232a]">.</span>
        <span className="leading-[normal] text-[#6947ba]">background</span>
        <span className="leading-[normal]">{` `}</span>
        <span className="leading-[normal] text-[#1e232a]">{`{`}</span>
      </p>
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex gap-[40px] items-start relative shrink-0">
      <p className="leading-[normal] relative shrink-0 text-[#777]">2</p>
      <p className="leading-[0] relative shrink-0 text-[#0b5cff]">
        <span className="leading-[normal]">background-image</span>
        <span className="leading-[normal] text-[#1e232a]">:</span>
        <span className="leading-[normal]">{` url`}</span>
        <span className="leading-[normal] text-[#1e232a]">(</span>
        <span className="leading-[normal] text-[#d3692b]">{`https://source.unsplash.com/Q7PclNhVRI0`}</span>
        <span className="leading-[normal] text-[#1e232a]">);</span>
      </p>
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex gap-[40px] items-start relative shrink-0">
      <p className="leading-[normal] relative shrink-0 text-[#777]">3</p>
      <p className="leading-[0] relative shrink-0 text-[#0b5cff]">
        <span className="leading-[normal]">background-position</span>
        <span className="leading-[normal] text-[#1e232a]">:</span>
        <span className="leading-[normal]">{` bottom`}</span>
        <span className="leading-[normal] text-[#1e232a]">;</span>
      </p>
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex gap-[40px] items-start relative shrink-0">
      <p className="leading-[normal] relative shrink-0 text-[#777]">4</p>
      <p className="leading-[0] relative shrink-0 text-[#0b5cff]">
        <span className="leading-[normal]">background-repeat</span>
        <span className="leading-[normal] text-[#1e232a]">:</span>
        <span className="leading-[normal]">{` no-repeat`}</span>
        <span className="leading-[normal] text-[#1e232a]">;</span>
      </p>
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex gap-[40px] items-start relative shrink-0">
      <p className="leading-[normal] relative shrink-0 text-[#777]">5</p>
      <p className="leading-[0] relative shrink-0 text-[#0b5cff]">
        <span className="leading-[normal]">background-size</span>
        <span className="leading-[normal] text-[#1e232a]">:</span>
        <span className="leading-[normal]">{` cover`}</span>
        <span className="leading-[normal] text-[#1e232a]">;</span>
      </p>
    </div>
  );
}

function Frame42() {
  return (
    <div className="content-stretch flex gap-[40px] items-start relative shrink-0">
      <p className="leading-[normal] relative shrink-0 text-[#777]">6</p>
      <p className="leading-[0] relative shrink-0 text-[#0b5cff]">
        <span className="leading-[normal]">height</span>
        <span className="leading-[normal] text-[#1e232a]">:</span>
        <span className="leading-[normal]">{` 100`}</span>
        <span className="leading-[normal] text-[#d3692b]">vh</span>
        <span className="leading-[normal] text-[#1e232a]">;</span>
      </p>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex gap-[40px] items-start relative shrink-0">
      <p className="leading-[normal] relative shrink-0 text-[#777]">7</p>
      <p className="leading-[0] relative shrink-0 text-[#0b5cff]">
        <span className="leading-[normal]">width</span>
        <span className="leading-[normal] text-[#1e232a]">:</span>
        <span className="leading-[normal]">{` 100`}</span>
        <span className="leading-[normal] text-[#d3692b]">%</span>
        <span className="leading-[normal] text-[#1e232a]">;</span>
      </p>
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex gap-[24px] items-start leading-[normal] relative shrink-0">
      <p className="relative shrink-0 text-[#777]">8</p>
      <p className="relative shrink-0 text-[#1e232a]">{`}`}</p>
    </div>
  );
}

function Frame24({ activeTab }: { activeTab: string }) {
  const [showNotification, setShowNotification] = useState(false);
  
  const getCode = () => {
    if (activeTab === 'javascript') {
      return `<script src="https://cdn.nanei.ai/chat-widget.js"></script>
<script>
window.naneiChat.init({
  apiKey: 'YOUR_API_KEY_HERE',
  position: 'bottom-right',
  theme: { primaryColor: '#0B5CFF' }
});
</script>`;
    } else if (activeTab === 'php') {
      return `<?php
$apiKey = 'YOUR_API_KEY_HERE';
?>
<script src="https://cdn.nanei.ai/chat-widget.js"></script>
<script>
window.naneiChat.init({
  apiKey: '<?php echo $apiKey; ?>',
  language: 'pl',
  theme: { primaryColor: '#0B5CFF' }
});
</script>`;
    }
    return `const naneiChat = require('@nanei/chat-widget');

naneiChat.init({
  apiKey: 'YOUR_API_KEY_HERE',
  element: document.getElementById('nanei-chat'),
  theme: { primaryColor: '#0B5CFF' }
});`;
  };
  
  const handleCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = getCode();
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };
  
  return (
    <>
      <div className="relative rounded-[10px] shrink-0 w-full group">
        <div aria-hidden="true" className="absolute border border-[#ddd] border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="content-stretch flex flex-col font-['Poppins:Medium',sans-serif] gap-[6px] items-start not-italic px-[16px] py-[8px] relative text-[12px] w-full max-h-[200px] overflow-auto">
          <button
            onClick={handleCopy}
            className="absolute right-[16px] top-[8px] bg-[#1e232a] hover:bg-[#999999] text-white rounded-full px-[12px] py-[6px] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer font-['Poppins:Medium',sans-serif] text-[12px] z-10"
          >
            Kopiuj
          </button>
          <pre className="leading-[1.6] text-[#1e232a] whitespace-pre-wrap break-words max-w-full overflow-x-auto">
            <code>{getCode()}</code>
          </pre>
        </div>
      </div>
      
      {showNotification && (
        <div className="fixed bottom-[40px] left-1/2 bg-[#1e232a] text-white px-[24px] py-[12px] rounded-[8px] font-['Poppins:Medium',sans-serif] text-[14px] animate-fade-in-up z-50" style={{ transform: 'translateX(-50%)' }}>
          Skopiowano do schowka
        </div>
      )}
    </>
  );
}

function Frame45({ activeTab }: { activeTab: string }) {
  return (
    <div className="content-stretch flex flex-col items-start relative rounded-[10px] shrink-0 w-full">
      <Frame24 activeTab={activeTab} />
    </div>
  );
}

function Frame47() {
  const [activeTab, setActiveTab] = useState('nodejs');
  
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <Frame22 activeTab={activeTab} onTabChange={setActiveTab} />
      <Frame45 activeTab={activeTab} />
    </div>
  );
}

function Frame50() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <Frame47 />
    </div>
  );
}

function Frame54() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[8px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #ECECEC)" id="Ellipse 13" r="4" />
        </svg>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Test</p>
    </div>
  );
}

function LoadingSign() {
  return (
    <div className="relative shrink-0 size-[20px] animate-spin" data-name="Loading Sign">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Loading Sign">
          <path d={svgPaths.p3abea300} fill="var(--fill-0, #0B5CFF)" id="Vector" stroke="var(--stroke-0, #0B5CFF)" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Success Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10" fill="#10B981" />
        <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Frame60({ status }: { status: 'idle' | 'loading' | 'success' }) {
  if (status === 'idle') {
    return null;
  }
  
  if (status === 'loading') {
    return (
      <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0">
        <LoadingSign />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#777] text-[14px]">Czeka na odpowiedź ze strony</p>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0">
        <SuccessIcon />
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#10B981] text-[14px]">Poprawnie zainstalowano</p>
      </div>
    );
  }
  
  return null;
}

function Frame46({ status }: { status: 'idle' | 'loading' | 'success' }) {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
      <Frame54 />
      <Frame60 status={status} />
      {status === 'idle' && (
        <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#777] text-[14px]">{`Sprawdź czy Twój kod jest poprawnie osadzony. `}</p>
      )}
    </div>
  );
}

function Calendar6() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Check</p>
        </div>
      </div>
    </div>
  );
}

function Frame15({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <div 
      className={`content-stretch flex gap-[16px] items-center justify-center px-[10px] relative rounded-[10px] shrink-0 transition-all duration-200 ${
        disabled 
          ? 'bg-[#e9e9e9] cursor-not-allowed opacity-50' 
          : 'bg-[#e9e9e9] cursor-pointer hover:bg-[#d9d9d9]'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-row items-center self-stretch">
        <Calendar6 />
      </div>
    </div>
  );
}

function Frame23() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const handleCheck = () => {
    if (status !== 'idle') return;
    
    setStatus('loading');
    
    setTimeout(() => {
      setStatus('success');
    }, 3000);
  };
  
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[736px]">
      <Frame46 status={status} />
      <Frame15 onClick={handleCheck} disabled={status !== 'idle'} />
    </div>
  );
}

function Frame53() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start relative shrink-0 w-[940px]">
      <Frame50 />
      <Frame23 />
    </div>
  );
}

function Close() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Close">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Close">
          <path d={svgPaths.p1d7b0480} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame61() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Customize your chat</p>
      <Close />
    </div>
  );
}

function Frame56() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center relative shrink-0 w-full">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] min-w-full not-italic relative shrink-0 text-[#777] text-[14px] w-[min-content] whitespace-pre-wrap">Dostosuj swoją kolorystykę brandową i wiadomości startowe jakiś tam tekst.</p>
    </div>
  );
}

function UngroupObjects1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Ungroup Objects">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Ungroup Objects">
          <path d={svgPaths.p2b3d1700} fill="var(--fill-0, #1E232A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Calendar7() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Customize chat</p>
        </div>
      </div>
    </div>
  );
}

function CustomizeButton1() {
  return (
    <div className="bg-white content-stretch flex gap-[4px] items-center justify-center px-[10px] relative rounded-[10px] shrink-0" data-name="customize button">
      <div aria-hidden="true" className="absolute border border-[#d0d4da] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)]" />
      <UngroupObjects1 />
      <div className="flex flex-row items-center self-stretch">
        <Calendar7 />
      </div>
    </div>
  );
}

function Frame55() {
  return (
    <div className="bg-[#f5f5f7] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        
      </div>
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame55 />
    </div>
  );
}

function Frame63() {
  return (
    <div className="content-stretch flex flex-col font-['Poppins:Medium',sans-serif] gap-[6px] items-start justify-center not-italic relative shrink-0 text-[14px] w-full">
      <p className="leading-[1.5] relative shrink-0 text-[#1e232a]">Need help?</p>
      <p className="leading-[normal] min-w-full relative shrink-0 text-[#777] w-[min-content] whitespace-pre-wrap">Jeśli potrzebujesz pomocy zapytaj AI jak zainstalować widget na swojej stronie WWW lub co w ogóle on Ci da?</p>
    </div>
  );
}

function Calendar8() {
  return (
    <div className="h-full relative shrink-0" data-name="Calendar">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex h-full items-center justify-center p-[8px] relative">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e232a] text-[14px]">Ask AI</p>
        </div>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="bg-white content-stretch flex gap-[16px] items-center justify-center px-[10px] relative rounded-[10px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[#d0d4da] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="flex flex-row items-center self-stretch">
        <Calendar8 />
      </div>
    </div>
  );
}

function Frame64() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Frame16 />
    </div>
  );
}

function Frame62() {
  return (
    <div className="bg-[#f5f5f7] relative rounded-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start justify-center pb-[16px] pt-[24px] px-[16px] relative w-full">
          <Frame63 />
          <Frame64 />
        </div>
      </div>
    </div>
  );
}

function Frame58() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame62 />
    </div>
  );
}

function Frame59() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative">
      <Frame57 />
      <Frame58 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full bg-white overflow-x-hidden">
      <div className="content-stretch flex flex-col lg:flex-row gap-[24px] lg:gap-[64px] items-start pl-[16px] sm:pl-[24px] lg:pl-[40px] pr-[16px] sm:pr-[24px] pt-[24px] pb-[40px] relative w-full">
        <Frame53 />
        <Frame59 />
      </div>
    </div>
  );
}

function Frame({ activeSection }: { activeSection: string }) {
  return (
    <div className="bg-white flex-[1_0_0] h-full min-h-px min-w-px relative flex flex-col overflow-x-hidden">
      {activeSection === 'inbox' && (
        <>
          <Frame4 />
          <div className="flex-1 overflow-y-auto overflow-x-hidden h-full">
            <Frame3 />
          </div>
        </>
      )}
      {activeSection === 'data' && <DataView />}
    </div>
  );
}

function Content({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) {
  return (
    <div className="absolute flex h-screen left-0 sm:left-[200px] md:left-[300px] lg:left-[439px] top-0 right-0" data-name="content">
      <div className="fixed left-0 sm:left-[200px] md:left-[300px] lg:left-[439px] top-0 h-screen z-10 hidden md:block">
        <Frame6 activeSection={activeSection} onSectionChange={onSectionChange} />
      </div>
      <div className="md:ml-[220px] flex-1 h-screen overflow-hidden w-full overflow-x-hidden">
        <Frame activeSection={activeSection} />
      </div>
    </div>
  );
}

export default function OmnichannelWebChat() {
  const [activeSection, setActiveSection] = useState('inbox');
  
  return (
    <div className="bg-white relative size-full" data-name="omnichannel web chat 2">
      <Cien />
      <Content activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}