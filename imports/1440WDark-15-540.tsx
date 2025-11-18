import svgPaths from "./svg-rto7qlii0f";
import imgMetaJpg from "figma:asset/068b6e40a3a1d7992231c21de5252c39822d3bdd.png";

function Header() {
  return (
    <div className="bg-zinc-950 h-px max-w-[1440px] shrink-0 sticky top-0 w-full z-[2]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
    </div>
  );
}

function MetaJpg() {
  return (
    <div className="h-[517.98px] max-w-[986.66px] relative rounded-[12px] shrink-0 w-full" data-name="meta.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgMetaJpg} />
      </div>
    </div>
  );
}

function OverlayShadow() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px]" data-name="Overlay+Shadow">
      <div className="absolute inset-0 pointer-events-none shadow-[0px_0px_0px_1px_inset_rgba(255,255,255,0.03)]" />
    </div>
  );
}

function Container() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start max-h-[1200px] max-w-[1600px] min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <MetaJpg />
      <OverlayShadow />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col h-[740px] items-start justify-center relative shrink-0 w-[986.66px]" data-name="Container">
      <Container />
    </div>
  );
}

function Container2() {
  return (
    <div className="basis-0 content-stretch flex grow h-full items-center justify-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex h-full items-start justify-center relative shrink-0 w-[1440px]" data-name="Container">
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bottom-[68px] content-stretch flex items-start left-0 overflow-clip right-0 top-[60px]" data-name="Container">
      <Container3 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p227d200} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px]" data-name="Button">
      <Svg />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p11f30c00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M9 12V12.1" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 12V12.1" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M15 12V12.1" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px]" data-name="Button">
      <Svg1 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p24cbefc0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px]" data-name="Button">
      <Svg2 />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="SVG">
          <path d="M14 14V17.5M14 10.5V10.6167" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
          <path d={svgPaths.p87df0c0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px]" data-name="Button">
      <Svg3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute box-border content-stretch flex items-center justify-center left-0 p-[16px] right-0 top-[832px]" data-name="Container">
      <Container5 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 36">
        <g id="SVG">
          <g id="Mask group">
            <mask height="36" id="mask0_15_555" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="36" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.pcc2ad00} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_15_555)">
              <path d="M36 0H0V36H36V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-center left-[46px] size-[36px] top-1/2 translate-y-[-50%]" data-name="Link">
      <Svg4 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
        <p className="leading-[22.5px] whitespace-pre">Dipa Inhouse</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute content-stretch flex items-start left-[92px] top-[calc(50%-0.75px)] translate-y-[-50%]" data-name="Link">
      <Container7 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M17 7L7 17M7 7L17 17" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center left-0 rounded-[12px] size-[36px] top-1/2 translate-y-[-50%]" data-name="Button">
      <Svg5 />
    </div>
  );
}

function Container8() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Container">
      <Link />
      <Link1 />
      <Button4 />
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow h-[22.5px] min-h-px min-w-px overflow-clip relative shrink-0" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] left-[calc(50%-0.178px)] not-italic text-[15px] text-center text-white top-[10.5px] translate-x-[-50%] translate-y-[-50%] w-[360.34px]">
        <p className="leading-[22.5px]">Gastroscan - AI-Based Food Recognition Branding</p>
      </div>
    </div>
  );
}

function Svg6() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M7 12V12.1" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 12V12.1" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M17 12V12.1" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonMenu() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px]" data-name="Button menu">
      <Svg6 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <ButtonMenu />
    </div>
  );
}

function Container11() {
  return (
    <div className="basis-0 content-stretch flex grow items-start justify-end min-h-px min-w-px relative shrink-0" data-name="Container">
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute box-border content-stretch flex items-center justify-between left-0 pl-[12px] pr-[12.01px] py-[12px] right-0 top-0" data-name="Container">
      <Container8 />
      <Container9 />
      <Container11 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-black h-[900px] overflow-clip relative shrink-0 w-[1440px] z-[1]" data-name="Background">
      <Container4 />
      <Container6 />
      <Container12 />
    </div>
  );
}

function Main() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow isolate items-start min-h-px min-w-px relative self-stretch shrink-0" data-name="Main">
      <Header />
      <Background />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Main />
    </div>
  );
}

export default function Component1440WDark() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="1440w dark" style={{ backgroundImage: "linear-gradient(90deg, rgb(9, 9, 11) 0%, rgb(9, 9, 11) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container13 />
    </div>
  );
}