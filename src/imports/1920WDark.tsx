import svgPaths from "./svg-v8j2rme2rb";
import imgImage89 from "figma:asset/a4bed7a682b3361ca701bf737c44a6cef4b6b8e0.png";
import imgImage92 from "figma:asset/8643eb13d37acdefb8d73e1b7ee183b677c50d57.png";
import imgImage76 from "figma:asset/c2cf669877775905ece57dbed774b1847592a81c.png";
import imgImage19 from "figma:asset/116370868db3a3ecc2e0962792089f20d4e8c8a6.png";
import imgImage87 from "figma:asset/713b7e80bcc6941f1824a413aae8ad6bce5a5a10.png";
import imgImage86 from "figma:asset/f3ebe01adc5e009c5e26621a93d372403b3b8684.png";
import imgImage83 from "figma:asset/1ee14c05002819ebdb45888486cf76e5d631b680.png";
import imgImage79 from "figma:asset/48ec2f1c426b7e7b5af662cb71bd7ead300b0dab.png";

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-white whitespace-nowrap">
        <p className="leading-[16.8px] text-[14px]">Start</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[34px]" data-name="Container">
      <Container3 />
    </div>
  );
}

function LinkActive() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip pb-[8px] pt-[7px] px-[8px] relative shrink-0" data-name="Link - Active">
      <Container2 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <LinkActive />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] whitespace-nowrap">
        <p className="leading-[16.8px]">O mnie</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[48px]" data-name="Container">
      <Container6 />
    </div>
  );
}

function LinkDefault() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip pb-[8px] pt-[7px] px-[8px] relative shrink-0" data-name="Link - Default">
      <Container5 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <LinkDefault />
    </div>
  );
}

function Menu() {
  return (
    <div className="backdrop-blur-[4px] bg-[rgba(18,18,18,0.5)] content-stretch flex gap-[7px] h-[38px] items-center justify-center pl-[13px] pr-[12px] py-[19px] relative rounded-[40px] shrink-0" data-name="Menu">
      <Container1 />
      <Container4 />
      <div className="absolute inset-0 rounded-[40px]" data-name="Border">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.03)] border-solid inset-0 pointer-events-none rounded-[40px]" />
      </div>
    </div>
  );
}

function LogoMenu() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[20px] items-center justify-center left-[75px] pl-[20px] pr-[10px] py-[10px] rounded-[40px] top-1/2" data-name="Logo & Menu">
      <Menu />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] whitespace-nowrap">
        <p className="leading-[16.8px]">Resume</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[55px]" data-name="Container">
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col h-[17px] items-start justify-center relative shrink-0 w-[15px]" data-name="Container">
      <div className="h-[17px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[31.62%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 7.5">
              <path d="M0.625 6.875L6.875 0.625" id="Vector" stroke="var(--stroke-0, #B0B0B0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[31.62%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 7.5">
              <path d="M0.625 0.625H6.875V6.875" id="Vector" stroke="var(--stroke-0, #B0B0B0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkDefault1() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center overflow-clip pb-[8px] pt-[7.09px] px-[8px] relative shrink-0" data-name="Link - Default">
      <Container8 />
      <Container10 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <LinkDefault1 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] whitespace-nowrap">
        <p className="leading-[16.8px]">LinkedIn</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[58px]" data-name="Container">
      <Container13 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col h-[17px] items-start justify-center relative shrink-0 w-[15px]" data-name="Container">
      <div className="h-[17px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[31.62%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 7.5">
              <path d="M0.625 6.875L6.875 0.625" id="Vector" stroke="var(--stroke-0, #B0B0B0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[31.62%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.5 7.5">
              <path d="M0.625 0.625H6.875V6.875" id="Vector" stroke="var(--stroke-0, #B0B0B0)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkDefault2() {
  return (
    <div className="content-stretch flex gap-[5px] items-center justify-center overflow-clip pb-[8px] pt-[7.09px] px-[8px] relative shrink-0" data-name="Link - Default">
      <Container12 />
      <Container14 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <LinkDefault2 />
    </div>
  );
}

function Menu1() {
  return (
    <div className="backdrop-blur-[4px] bg-[rgba(18,18,18,0.5)] content-stretch flex gap-[5px] h-[38px] items-center justify-center pl-[10px] pr-[2px] py-[19px] relative rounded-[40px] shrink-0" data-name="Menu">
      <Container7 />
      <Container11 />
      <div className="absolute inset-0 rounded-[40px]" data-name="Border">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.03)] border-solid inset-0 pointer-events-none rounded-[40px]" />
      </div>
    </div>
  );
}

function Resume() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col h-[50.5px] items-center justify-center left-[1681px] opacity-0 pb-[12.5px] top-[calc(50%-6.25px)] w-[114px]" data-name="Resume">
      <Menu1 />
    </div>
  );
}

function HideLinkedIn() {
  return (
    <div className="h-[105px] overflow-clip relative shrink-0 w-full" data-name="Hide LinkedIn">
      <LogoMenu />
      <Resume />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <HideLinkedIn />
    </div>
  );
}

function HobbyIconsCssTransform() {
  return <div className="content-stretch flex flex-col items-start justify-center mb-[-0.207px] pr-[875.87px] shrink-0 w-[1094.6px]" data-name="Hobby Icons:css-transform" />;
}

function HeadingHeading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading → Heading 1">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[80.4px] not-italic relative shrink-0 text-[64px] text-white tracking-[-1.44px] w-[1157px] whitespace-pre-wrap">
        <p className="mb-0">{`Cześć, jestem Piotr `}</p>
        <p>Lead UX/UI Designer</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#858585] text-[19px] whitespace-nowrap">
        <p className="leading-[28.5px]">Projektuję i prowadzę systemy cyfrowe dużej skali – web i mobile – od strategii po wdrożenie.</p>
      </div>
      <div className="content-stretch flex items-start shrink-0" data-name="Component 1" />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#858585] text-[19px] whitespace-nowrap">
        <p className="leading-[28.5px]">{`Systemy publiczne i enterprise • projekty +100 mln USD • iOS / Android / Web • WCAG 2.1 AA `}</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Simplification() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Simplification">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Simplification">
          <rect fill="var(--fill-0, #242424)" height="48" rx="24" width="48" />
          <path d={svgPaths.p3b483a80} fill="var(--fill-0, #909090)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[48px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Frame 1">
          <rect fill="var(--fill-0, #242424)" height="48" rx="24" width="48" />
          <path d={svgPaths.p239db600} fill="var(--fill-0, #909090)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#242424] content-stretch flex items-center relative rounded-[100px] shrink-0">
      <div className="relative rounded-[100px] shrink-0 size-[48px]" data-name="image 89">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[100px]">
          <img alt="" className="absolute h-full left-[-16.67%] max-w-none top-0 w-[133.33%]" src={imgImage89} />
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[25.61%_11.93%_26.47%_12.31%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.3645 23">
        <g id="Group">
          <path d={svgPaths.p2a828580} fill="var(--fill-0, #909090)" id="svg_1" />
          <path d={svgPaths.p1db75280} fill="var(--fill-0, #909090)" id="svg_2" />
          <path d={svgPaths.p328c49c0} fill="var(--fill-0, #909090)" id="svg_3" />
          <path d={svgPaths.p309db900} fill="var(--fill-0, #909090)" id="svg_4" />
          <path d={svgPaths.p12e36800} fill="var(--fill-0, #909090)" id="svg_5" />
          <path d={svgPaths.p15a13680} fill="var(--fill-0, #909090)" id="svg_6" />
          <path d={svgPaths.p39f9d100} fill="var(--fill-0, #909090)" id="svg_7" />
        </g>
      </svg>
    </div>
  );
}

function Honda() {
  return (
    <div className="bg-[#242424] overflow-clip relative rounded-[100px] shrink-0 size-[48px]" data-name="honda">
      <Group />
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[#242424] content-stretch flex items-center justify-center relative rounded-[100px] shrink-0 size-[48px]">
      <div className="h-[35px] relative shrink-0 w-[36px]" data-name="image 92">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage92} />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <Simplification />
      <Frame />
      <Frame4 />
      <Honda />
      <Frame5 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#858585] text-[18px] w-[165px]">
        <p className="leading-[21.6px] whitespace-pre-wrap">Scrolluj w dół</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[165px]" data-name="Container">
      <Container19 />
    </div>
  );
}

function LinkVariant() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip pr-[25px] py-[15px] relative rounded-[25px] shadow-[0px_1px_15px_0px_rgba(0,0,0,0.25)] shrink-0" data-name="Link - Variant 1">
      <Container18 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <LinkVariant />
    </div>
  );
}

function Subtext() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[215px] items-start left-0 right-0 top-[-1.59px]" data-name="Subtext">
      <Frame2 />
      <Frame3 />
      <Frame1 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[213px] overflow-clip relative shrink-0 w-full" data-name="Container">
      <Subtext />
    </div>
  );
}

function ContentContainerTextContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start justify-center mb-[-0.207px] pb-[24px] pt-[10px] relative shrink-0 w-full" data-name="Content Container → Text Container">
      <HeadingHeading />
      <Container15 />
    </div>
  );
}

function Intro() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[1248px] overflow-clip pb-[0.207px] relative shrink-0 w-[1200px]" data-name="Intro">
      <HobbyIconsCssTransform />
      <ContentContainerTextContainer />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-center left-[18.5px] size-[27px] top-[18.5px]" data-name="Container">
      <div className="h-[27px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute bottom-[20.83%] left-1/2 right-1/2 top-[20.83%]" data-name="Vector">
          <div className="absolute inset-[-7.14%_-1.13px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2.25 18">
              <path d="M1.125 1.125V16.875" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-[20.83%] left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
          <div className="absolute inset-[-14.29%_-7.14%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 10.125">
              <path d={svgPaths.p19eb6f20} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <button className="absolute bg-[#27272b] block bottom-[96px] cursor-pointer overflow-clip right-[96px] rounded-[43px] size-[64px]" data-name="Link">
      <Container20 />
    </button>
  );
}

function SectionHero() {
  return (
    <div className="content-stretch flex flex-col h-[1200px] items-start justify-center max-w-[1560px] p-[96px] relative shrink-0 w-[1560px]" data-name="Section - Hero" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1560 1200\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(78 0 0 60 780 -59400)\\'><stop stop-color=\\'rgba(22,22,24,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(23,23,23,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')" }}>
      <Intro />
      <Link />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] bottom-[-39px] h-[518.01px] left-[273.6px] overflow-clip rounded-[15px] shadow-[0px_40px_50px_10px_rgba(0,0,0,0.25)] w-[820.8px]" data-name="Image">
      <div className="absolute border-2 border-[#222] border-solid h-[518.01px] left-0 rounded-[15px] top-0 w-[820.8px]" data-name="Border" />
      <div className="absolute h-[538px] left-[0.4px] top-[-0.02px] w-[820px]" data-name="image 76">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage76} />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[19.2px]">Podgląd</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[63px]" data-name="Container">
      <Container22 />
    </div>
  );
}

function TagPreview() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.7)] content-stretch flex flex-col items-center justify-center overflow-clip pb-[8px] pt-[7px] px-[15px] right-[19.87px] rounded-[25px] top-[20px]" data-name="Tag Preview">
      <Container21 />
    </div>
  );
}

function CaseStudyImage() {
  return (
    <div className="bg-[#27272b] content-stretch flex h-[504.05px] items-center justify-center overflow-clip p-[64px] relative rounded-tl-[36px] rounded-tr-[36px] shrink-0 w-[1368px]" data-name="Case Study Image">
      <div className="h-[468.09px] rounded-[35px] shrink-0 w-[756.39px]" data-name="Image" />
      <Image />
      <TagPreview />
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex gap-[4px] h-[50px] items-center overflow-clip relative shrink-0 w-[208px]" data-name="Title">
      <div className="h-[19px] relative shrink-0 w-[176px]" data-name="image 19">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage19} />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[343px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Ogólnopolski system transportu publicznego</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[19.6px]">Obowiązki</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[72px]" data-name="Container">
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[19.6px] whitespace-pre-wrap">Lead UX/UI • end-to-end • WCAG</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[225.87px]" data-name="Container">
      <Container27 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Container24 />
      <Container26 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[19.6px]">Platformy</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[66px]" data-name="Container">
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] whitespace-nowrap">
        <p className="leading-[19.6px]">iOS, Android (Native) + Web + Inne systemy</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container31 />
    </div>
  );
}

function Project() {
  return (
    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-name="Project">
      <Container28 />
      <Container30 />
    </div>
  );
}

function Role() {
  return (
    <div className="content-stretch flex gap-[24px] items-center opacity-80 overflow-clip relative shrink-0 w-full" data-name="Role">
      <Frame7 />
      <Project />
    </div>
  );
}

function Description() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Description">
      <Container23 />
      <Role />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0">
      <Title />
      <Description />
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-center left-[12px] size-[24px] top-[12px]" data-name="Container">
      <div className="h-[24px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <path d="M1 11L11 1" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <path d="M1 1H11V11" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Defualt() {
  return (
    <div className="bg-[#27272b] h-[48px] overflow-clip relative rounded-[24px] shrink-0 w-full" data-name="defualt">
      <Container33 />
    </div>
  );
}

function Container32() {
  return (
    <div className="aspect-[48/48] content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="Container">
      <Defualt />
    </div>
  );
}

function Context1() {
  return (
    <div className="content-stretch flex gap-[10px] items-start justify-end overflow-clip relative shrink-0" data-name="Context">
      <Container32 />
    </div>
  );
}

function Context() {
  return (
    <div className="content-stretch flex items-center justify-between pb-[24px] pt-[8px] px-[40px] relative rounded-bl-[36px] rounded-br-[36px] shrink-0 w-[1368px]" data-name="Context">
      <Frame6 />
      <Context1 />
    </div>
  );
}

function LinkWork() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col items-start relative rounded-[36px] shadow-[0px_1px_2px_0px_black] shrink-0 w-full" data-name="Link - Work">
      <CaseStudyImage />
      <Context />
      <div className="absolute inset-[0_0_0.05px_0] rounded-[36px]" data-name="Border">
        <div aria-hidden="true" className="absolute border-2 border-[#222] border-solid inset-0 pointer-events-none rounded-[36px]" />
      </div>
    </div>
  );
}

function SectionLululemon() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start justify-center max-w-[1560px] px-[96px] py-[58px] relative shrink-0 w-[1560px]" data-name="Section - Lululemon">
      <LinkWork />
    </div>
  );
}

function Image1() {
  return <div className="h-[329px] min-h-[329px] shrink-0 w-[380px]" data-name="image" />;
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[19.2px]">Podgląd</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[63px]" data-name="Container">
      <Container35 />
    </div>
  );
}

function TagPreview1() {
  return (
    <div className="absolute bg-[rgba(28,28,28,0.7)] content-stretch flex flex-col items-center justify-center overflow-clip pb-[8px] pt-[7px] px-[15px] right-[19.78px] rounded-[25px] top-[20px]" data-name="Tag Preview">
      <Container34 />
    </div>
  );
}

function Image2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex h-[538px] items-end justify-between left-[calc(50%+2.5px)] overflow-clip rounded-[35px] shadow-[0px_2px_10px_3px_rgba(0,0,0,0.25)] top-[calc(50%+16.99px)] w-[1101px]" data-name="image">
      <div className="h-[409px] relative shrink-0 w-[210px]" data-name="image 87">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage87} />
      </div>
      <div className="h-[409px] relative shrink-0 w-[210px]" data-name="image 86">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage86} />
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[472px] left-[310px] overflow-clip rounded-[15px] shadow-[0px_4px_52px_11px_rgba(0,0,0,0.4),0px_40px_50px_10px_rgba(0,0,0,0.25)] top-[56.03px] w-[748px]" data-name="Image">
      <div className="absolute border-2 border-[#222] border-solid h-[518.01px] left-0 rounded-[15px] top-0 w-[820.8px]" data-name="Border" />
      <div className="absolute h-[538px] left-0 top-[-0.02px] w-[820px]" data-name="image 83">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage83} />
      </div>
    </div>
  );
}

function CaseStudyImage1() {
  return (
    <div className="absolute bg-[#171717] content-stretch flex inset-[-0.34%_0_15.34%_0] items-center justify-center overflow-clip p-[64px] rounded-tl-[36px] rounded-tr-[36px]" data-name="Case Study Image">
      <Image1 />
      <TagPreview1 />
      <Image2 />
      <Image3 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[27px] text-white tracking-[-0.4px] w-full">
        <p className="leading-[37.8px] whitespace-pre-wrap">Upcoming</p>
      </div>
    </div>
  );
}

function ProjectTitle() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[160px]" data-name="Project title">
      <Heading />
    </div>
  );
}

function Title1() {
  return (
    <div className="content-stretch flex h-[50px] items-center overflow-clip relative shrink-0 w-[208px]" data-name="Title">
      <ProjectTitle />
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[231px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Platforma kolekcjonerska TCG</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[19.6px]">Obowiązki</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[72px]" data-name="Container">
      <Container38 />
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[168px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[19.6px] whitespace-pre-wrap">Lead UX/UI • end-to-end</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container40 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Container37 />
      <Container39 />
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[19.6px]">Platformy</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[66px]" data-name="Container">
      <Container42 />
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] whitespace-nowrap">
        <p className="leading-[19.6px]">Web + Mobile App</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container44 />
    </div>
  );
}

function Project1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-name="Project">
      <Container41 />
      <Container43 />
    </div>
  );
}

function Role1() {
  return (
    <div className="content-stretch flex gap-[24px] items-center opacity-80 overflow-clip relative shrink-0 w-full" data-name="Role">
      <Frame8 />
      <Project1 />
    </div>
  );
}

function Description1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Description">
      <Container36 />
      <Role1 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Title1 />
      <Description1 />
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-center left-[12px] size-[24px] top-[12px]" data-name="Container">
      <div className="h-[24px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <path d="M1 11L11 1" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <path d="M1 1H11V11" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Defualt1() {
  return (
    <div className="bg-[#27272b] h-[48px] overflow-clip relative rounded-[24px] shrink-0 w-full" data-name="defualt">
      <Container46 />
    </div>
  );
}

function Container45() {
  return (
    <div className="aspect-[48/48] content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="Container">
      <Defualt1 />
    </div>
  );
}

function Context3() {
  return (
    <div className="content-stretch flex items-start justify-end overflow-clip relative shrink-0" data-name="Context">
      <Container45 />
    </div>
  );
}

function Context2() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex items-center justify-between left-0 pb-[25px] px-[40px] right-0 rounded-bl-[36px] rounded-br-[36px] top-[calc(50%+261.03px)]" data-name="Context">
      <Frame9 />
      <Context3 />
    </div>
  );
}

function LinkWork1() {
  return (
    <div className="bg-[rgba(255,255,255,0)] h-[593px] relative rounded-[36px] shadow-[0px_1px_2px_0px_black] shrink-0 w-full" data-name="Link - Work">
      <CaseStudyImage1 />
      <Context2 />
      <div className="absolute border-2 border-[#222] border-solid inset-0 rounded-[36px]" data-name="Border" />
    </div>
  );
}

function SectionPlayground() {
  return (
    <div className="content-stretch flex flex-col gap-[48px] items-start justify-center max-w-[1560px] px-[96px] py-[58px] relative shrink-0 w-[1560px]" data-name="Section - Playground">
      <LinkWork1 />
    </div>
  );
}

function Image4() {
  return <div className="h-[329px] min-h-[329px] shrink-0 w-[380px]" data-name="image" />;
}

function Image5() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-black content-stretch flex items-center justify-center left-[calc(50%-111px)] overflow-clip rounded-[35px] shadow-[0px_2px_10px_3px_rgba(0,0,0,0.25)] top-1/2" data-name="image">
      <div className="h-[467px] relative shrink-0 w-[232px]" data-name="image 79">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage79} />
      </div>
    </div>
  );
}

function Image6() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-black content-stretch flex items-center justify-center left-[calc(50%+110px)] overflow-clip rounded-[35px] shadow-[0px_2px_10px_3px_rgba(0,0,0,0.25)] top-1/2" data-name="image">
      <div className="h-[467px] relative shrink-0 w-[232px]" data-name="image 79">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage79} />
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[19.2px]">Podgląd</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[63px]" data-name="Container">
      <Container48 />
    </div>
  );
}

function TagPreview2() {
  return (
    <div className="absolute bg-[#1c1c1c] content-stretch flex flex-col items-center justify-center overflow-clip pb-[8px] pt-[7px] px-[15px] right-[19.78px] rounded-[25px] top-[20px]" data-name="Tag Preview">
      <Container47 />
    </div>
  );
}

function CaseStudyImage2() {
  return (
    <div className="absolute bg-black content-stretch flex inset-[-0.34%_0_15.34%_0] items-center justify-center overflow-clip p-[64px] rounded-tl-[36px] rounded-tr-[36px]" data-name="Case Study Image">
      <Image4 />
      <Image5 />
      <Image6 />
      <TagPreview2 />
      <div className="rounded-[750px] shrink-0 size-[1500px]" data-name="gradient-radial" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1500 1500\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(106.07 0 0 106.07 750 750)\\'><stop stop-color=\\'rgba(223,210,66,0.1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(144,172,255,0)\\' offset=\\'0.7\\'/><stop stop-color=\\'rgba(144,172,255,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')" }} />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[27px] text-white tracking-[-0.4px] w-full">
        <p className="leading-[37.8px] whitespace-pre-wrap">Upcoming</p>
      </div>
    </div>
  );
}

function ProjectTitle1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[160px]" data-name="Project title">
      <Heading1 />
    </div>
  );
}

function Title2() {
  return (
    <div className="content-stretch flex h-[50px] items-center overflow-clip relative shrink-0 w-[208px]" data-name="Title">
      <ProjectTitle1 />
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[426px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Aplikacja mobilna do przeglądania i zamawiania książek</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[19.6px]">Obowiązki</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[72px]" data-name="Container">
      <Container51 />
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[19.6px] whitespace-pre-wrap">Lead UX/UI • end-to-end • WCAG</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[225.87px]" data-name="Container">
      <Container53 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Container50 />
      <Container52 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[19.6px]">Platformy</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[66px]" data-name="Container">
      <Container55 />
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.64)] whitespace-nowrap">
        <p className="leading-[19.6px]">Web + Mobile App</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container57 />
    </div>
  );
}

function Project2() {
  return (
    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-name="Project">
      <Container54 />
      <Container56 />
    </div>
  );
}

function Role2() {
  return (
    <div className="content-stretch flex gap-[24px] items-center opacity-80 overflow-clip relative shrink-0 w-full" data-name="Role">
      <Frame11 />
      <Project2 />
    </div>
  );
}

function Description2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Description">
      <Container49 />
      <Role2 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Title2 />
      <Description2 />
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-center left-[12px] size-[24px] top-[12px]" data-name="Container">
      <div className="h-[24px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <path d="M1 11L11 1" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <path d="M1 1H11V11" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Defualt2() {
  return (
    <div className="bg-[#27272b] h-[48px] overflow-clip relative rounded-[24px] shrink-0 w-full" data-name="defualt">
      <Container59 />
    </div>
  );
}

function Container58() {
  return (
    <div className="aspect-[48/48] content-stretch flex flex-col items-start justify-center relative shrink-0" data-name="Container">
      <Defualt2 />
    </div>
  );
}

function Context5() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0" data-name="Context">
      <Container58 />
    </div>
  );
}

function Context4() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex items-center justify-between left-0 pb-[25px] px-[40px] right-0 rounded-bl-[36px] rounded-br-[36px] top-[calc(50%+261.03px)]" data-name="Context">
      <Frame10 />
      <Context5 />
    </div>
  );
}

function LinkWork2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] h-[593px] relative rounded-[36px] shadow-[0px_1px_2px_0px_black] shrink-0 w-full" data-name="Link - Work">
      <CaseStudyImage2 />
      <Context4 />
      <div className="absolute border-2 border-[#222] border-solid inset-0 rounded-[36px]" data-name="Border" />
    </div>
  );
}

function SectionPlayground1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center max-w-[1560px] px-[96px] py-[58px] relative shrink-0 w-[1560px]" data-name="Section - Playground">
      <LinkWork2 />
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[17px] text-white whitespace-nowrap">
        <p className="leading-[18.7px]">Piotr Klajsek</p>
      </div>
    </div>
  );
}

function ProjectTitle2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[103px]" data-name="Project title">
      <Container62 />
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex gap-[7px] items-center relative shrink-0 w-[133.43px]" data-name="Links">
      <ProjectTitle2 />
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-[rgba(255,255,255,0.64)] w-full">
        <p className="leading-[16.5px] whitespace-pre-wrap">Designed by me and develop with AI</p>
      </div>
    </div>
  );
}

function Description3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Description">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="heart-solid">
        <div className="absolute inset-[15.63%_6.25%_9.12%_6.25%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 18.0607">
            <path d={svgPaths.p300a3080} fill="var(--fill-0, #FF0000)" id="Vector" />
          </svg>
        </div>
      </div>
      <Container63 />
    </div>
  );
}

function Links1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[309px]" data-name="Links">
      <Description3 />
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[19.2px]">LinkedIn</p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[66px]" data-name="Container">
      <Container67 />
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex flex-col h-[22px] items-start justify-center relative shrink-0 w-[19px]" data-name="Container">
      <div className="h-[22px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[32.01%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5 9.5">
              <path d={svgPaths.p2d402500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.58333" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[32.01%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5 9.5">
              <path d={svgPaths.pbb0480} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.58333" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkDefault3() {
  return (
    <div className="content-stretch flex gap-[2.01px] items-start justify-center overflow-clip pr-[8px] py-[8px] relative shrink-0" data-name="Link - Default">
      <Container66 />
      <Container68 />
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <LinkDefault3 />
    </div>
  );
}

function Container71() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[19.2px]">CV</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[24px]" data-name="Container">
      <Container71 />
    </div>
  );
}

function Container72() {
  return (
    <div className="content-stretch flex flex-col h-[22px] items-start justify-center relative shrink-0 w-[19px]" data-name="Container">
      <div className="h-[22px] relative shrink-0 w-full" data-name="Component 2">
        <div className="absolute inset-[32.01%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5 9.5">
              <path d={svgPaths.p2d402500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.58333" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[32.01%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5 9.5">
              <path d={svgPaths.pbb0480} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.58333" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkDefault4() {
  return (
    <div className="content-stretch flex gap-[2px] items-start justify-center overflow-clip pr-[8px] py-[8px] relative shrink-0" data-name="Link - Default">
      <Container70 />
      <Container72 />
    </div>
  );
}

function Container69() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <LinkDefault4 />
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex gap-[29px] items-center pt-px relative shrink-0" data-name="Container">
      <Container65 />
      <Container69 />
    </div>
  );
}

function Container61() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[11px] items-start justify-center left-[calc(50%-280.54px)] top-0" data-name="Container">
      <Links />
      <Links1 />
      <Container64 />
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[0.75px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[27.5px] not-italic relative shrink-0 text-[25px] text-white w-full whitespace-pre-wrap">
        <p className="mb-0">Porozmawiajmy</p>
        <p>Zostaw swoje namiary</p>
      </div>
    </div>
  );
}

function ProjectTitle3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[423px]" data-name="Project title">
      <Container74 />
    </div>
  );
}

function Links2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Links">
      <ProjectTitle3 />
    </div>
  );
}

function Container76() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[15px] whitespace-nowrap">
        <p className="leading-[18px]">piotr.klajsek@gmail.com</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]" data-name="Container">
      <Container76 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#27272b] content-stretch flex items-center justify-center px-[13px] py-[7px] relative rounded-[24px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
        <p className="leading-[16px]">Copy</p>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Button />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-white content-stretch flex gap-[9.99px] items-center justify-center pl-[20px] pr-[10px] py-[6px] relative rounded-[30px] shrink-0" data-name="Background">
      <Container75 />
      <Container77 />
    </div>
  );
}

function Container73() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[20px] items-start left-[calc(50%+247.05px)] top-[-0.75px]" data-name="Container">
      <Links2 />
      <Background />
    </div>
  );
}

function Container60() {
  return (
    <div className="h-[122.8px] relative shrink-0 w-[917.09px]" data-name="Container">
      <Container61 />
      <Container73 />
    </div>
  );
}

function Desktop() {
  return (
    <div className="bg-[#0a0a0a] relative shrink-0 w-full" data-name="Desktop">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center pb-[70px] pt-[56px] px-[96px] relative w-full">
          <Container60 />
          <div aria-hidden="true" className="absolute border-[#37373f] border-solid border-t inset-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function EndOfBodyStart() {
  return (
    <div className="bg-[#0a0a0a] content-stretch flex flex-col items-center min-h-[1200px] relative shrink-0 w-full" data-name="End of bodyStart">
      <SectionHero />
      <SectionLululemon />
      <SectionPlayground />
      <SectionPlayground1 />
      <Desktop />
    </div>
  );
}

export default function Component1920WDark() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="1920w dark" style={{ backgroundImage: "linear-gradient(90deg, rgb(10, 10, 10) 0%, rgb(10, 10, 10) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container />
      <EndOfBodyStart />
      <div className="absolute left-[138px] rounded-[750px] size-[1500px] top-[-771px]" data-name="gradient-radial" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1500 1500\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(106.07 0 0 106.07 750 750)\\'><stop stop-color=\\'rgba(254,247,174,0.2)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(144,172,255,0)\\' offset=\\'0.7\\'/><stop stop-color=\\'rgba(144,172,255,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')" }} />
    </div>
  );
}