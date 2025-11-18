import svgPaths from "./svg-shvcwjgnc";
import imgFrame2 from "figma:asset/11ad7f2d679f8009910018c3e1343bc2bd12b456.png";
import imgPictureWhereDesigningIsBuilding from "figma:asset/ae18d7ca8cc5878a00fa16ad721ff6690f37a2f8.png";

function LinkSvg() {
  return (
    <div className="absolute h-[28.875px] left-[20px] right-[23px] top-[20px]" data-name="Link → SVG">
      <div className="absolute bottom-[29.01%] left-0 right-[35.48%] top-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 21">
          <path d={svgPaths.p12bedd00} fill="var(--fill-0, #E2E8F0)" fillOpacity="0.2" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[14.51%_17.74%_14.5%_17.74%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 21">
          <path d={svgPaths.p2968b180} fill="var(--fill-0, #E2E8F0)" fillOpacity="0.5" id="Vector" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-[35.48%] right-0 top-[29.01%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 21">
          <path d={svgPaths.p2d274a00} fill="var(--fill-0, #E2E8F0)" fillOpacity="0.8" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function ItemLinkSvg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Item → Link → SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Item â Link â SVG">
          <path d={svgPaths.pa2c4300} id="Vector" stroke="var(--stroke-0, #CBD5E1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M20 20L16 16" id="Vector_2" stroke="var(--stroke-0, #CBD5E1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 size-[56px]">
      <ItemLinkSvg />
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2f351e40} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M3 11L12 14L21 11" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink() {
  return (
    <div className="h-[56px] relative rounded-[12px] shrink-0 w-full" data-name="Item → Link">
      <Svg />
    </div>
  );
}

function List() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[14px] items-center left-[8px] right-[7px] top-[68.88px]" data-name="List">
      <Frame1 />
      <ItemLink />
    </div>
  );
}

function Svg1() {
  return (
    <div className="absolute left-[16px] size-[24px] top-1/2 translate-y-[-50%]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2667d080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3a387c80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="absolute h-[48px] left-[8px] right-[7px] rounded-[12px] top-[844px]" data-name="Link">
      <Svg1 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[900px] pointer-events-auto sticky top-0" data-name="Container">
      <LinkSvg />
      <List />
      <Link />
    </div>
  );
}

function Aside() {
  return (
    <div className="h-[1200px] pointer-events-none relative shrink-0 w-[72px]" data-name="Aside">
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-solid border-zinc-800 inset-0" />
      <div className="absolute bottom-0 left-0 right-px top-0">
        <Container />
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="absolute left-0 size-[16px] top-1/2 translate-y-[-50%]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SVG">
          <path d={svgPaths.p18510a80} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1fb7d080} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[16px] left-[17px] overflow-clip top-[12px] w-[49.75px]" data-name="Container">
      <Svg2 />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[15px] justify-center leading-[0] left-[calc(50%+12.177px)] not-italic text-[15px] text-center text-white top-[8px] translate-x-[-50%] translate-y-[-50%] w-[26.105px]">
        <p className="leading-[15px]">Hot</p>
      </div>
    </div>
  );
}

function Svg3() {
  return (
    <div className="absolute left-[111px] size-[24px] top-1/2 translate-y-[-50%]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M6.5 9.5L11.5 14.5L16.5 9.5" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonDialog() {
  return (
    <div className="h-[40px] relative rounded-[12px] shrink-0 w-[144px]" data-name="Button dialog">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <Container1 />
      <Svg3 />
    </div>
  );
}

function LinkButton() {
  return (
    <div className="absolute bg-white h-[36px] left-0 rounded-[12px] top-0 w-[42.78px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-slate-950 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.199px)] not-italic text-[14px] text-center text-slate-950 top-[18px] translate-x-[-50%] translate-y-[-50%] w-[17.177px]">
        <p className="leading-[14px]">All</p>
      </div>
    </div>
  );
}

function LinkButton1() {
  return (
    <div className="absolute h-[36px] left-[50.78px] rounded-[12px] top-0 w-[40.11px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.182px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[14.474px]">
        <p className="leading-[14px]">UI</p>
      </div>
    </div>
  );
}

function LinkButton2() {
  return (
    <div className="absolute h-[36px] left-[98.89px] rounded-[12px] top-0 w-[66.67px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.162px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[40.994px]">
        <p className="leading-[14px]">Figma</p>
      </div>
    </div>
  );
}

function LinkButton3() {
  return (
    <div className="absolute h-[36px] left-[173.56px] rounded-[12px] top-0 w-[90.13px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.199px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[64.527px]">
        <p className="leading-[14px]">UI Design</p>
      </div>
    </div>
  );
}

function LinkButton4() {
  return (
    <div className="absolute h-[36px] left-[271.69px] rounded-[12px] top-0 w-[128.75px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.179px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[103.109px]">
        <p className="leading-[14px]">Product Design</p>
      </div>
    </div>
  );
}

function LinkButton5() {
  return (
    <div className="absolute h-[36px] left-[408.44px] rounded-[12px] top-0 w-[105.95px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.162px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[80.273px]">
        <p className="leading-[14px]">Web Design</p>
      </div>
    </div>
  );
}

function LinkButton6() {
  return (
    <div className="absolute h-[36px] left-[522.39px] rounded-[12px] top-0 w-[72.33px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.171px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[46.672px]">
        <p className="leading-[14px]">Design</p>
      </div>
    </div>
  );
}

function LinkButton7() {
  return (
    <div className="absolute h-[36px] left-[602.72px] rounded-[12px] top-0 w-[94.09px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.152px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[68.395px]">
        <p className="leading-[14px]">UX And UI</p>
      </div>
    </div>
  );
}

function LinkButton8() {
  return (
    <div className="absolute h-[36px] left-[704.81px] rounded-[12px] top-0 w-[77.73px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.179px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[52.089px]">
        <p className="leading-[14px]">Minimal</p>
      </div>
    </div>
  );
}

function LinkButton9() {
  return (
    <div className="absolute h-[36px] left-[790.55px] rounded-[12px] top-0 w-[80.27px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.183px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[54.636px]">
        <p className="leading-[14px]">Website</p>
      </div>
    </div>
  );
}

function LinkButton10() {
  return (
    <div className="absolute h-[36px] left-[878.81px] rounded-[12px] top-0 w-[45.66px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.158px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[19.977px]">
        <p className="leading-[14px]">UX</p>
      </div>
    </div>
  );
}

function LinkButton11() {
  return (
    <div className="absolute h-[36px] left-[932.47px] rounded-[12px] top-0 w-[116.91px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.17px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[91.251px]">
        <p className="leading-[14px]">Landing Page</p>
      </div>
    </div>
  );
}

function LinkButton12() {
  return (
    <div className="absolute h-[36px] left-[1057.38px] rounded-[12px] top-0 w-[53.09px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.182px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[27.453px]">
        <p className="leading-[14px]">App</p>
      </div>
    </div>
  );
}

function LinkButton13() {
  return (
    <div className="absolute h-[36px] left-[1118.47px] rounded-[12px] top-0 w-[101.75px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.158px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[76.067px]">
        <p className="leading-[14px]">Mobile App</p>
      </div>
    </div>
  );
}

function LinkButton14() {
  return (
    <div className="absolute h-[36px] left-[1228.22px] rounded-[12px] top-0 w-[99.03px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.156px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[73.343px]">
        <p className="leading-[14px]">Dashboard</p>
      </div>
    </div>
  );
}

function LinkButton15() {
  return (
    <div className="absolute h-[36px] left-[1335.25px] rounded-[12px] top-0 w-[86.05px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.192px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[60.434px]">
        <p className="leading-[14px]">Branding</p>
      </div>
    </div>
  );
}

function LinkButton16() {
  return (
    <div className="absolute h-[36px] left-[1429.3px] rounded-[12px] top-0 w-[58.45px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.198px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[32.847px]">
        <p className="leading-[14px]">Saas</p>
      </div>
    </div>
  );
}

function LinkButton17() {
  return (
    <div className="absolute h-[36px] left-[1495.75px] rounded-[12px] top-0 w-[93.47px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.152px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[67.774px]">
        <p className="leading-[14px]">Animation</p>
      </div>
    </div>
  );
}

function LinkButton18() {
  return (
    <div className="absolute h-[36px] left-[1597.22px] rounded-[12px] top-0 w-[59.41px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.151px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[33.711px]">
        <p className="leading-[14px]">Logo</p>
      </div>
    </div>
  );
}

function LinkButton19() {
  return (
    <div className="absolute h-[36px] left-[1664.63px] rounded-[12px] top-0 w-[111.7px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.166px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[86.032px]">
        <p className="leading-[14px]">Components</p>
      </div>
    </div>
  );
}

function LinkButton20() {
  return (
    <div className="absolute h-[36px] left-[1784.33px] rounded-[12px] top-0 w-[62.03px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.155px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[36.34px]">
        <p className="leading-[14px]">Icons</p>
      </div>
    </div>
  );
}

function LinkButton21() {
  return (
    <div className="absolute h-[36px] left-[1854.36px] rounded-[12px] top-0 w-[130.3px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.181px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[104.661px]">
        <p className="leading-[14px]">Website Design</p>
      </div>
    </div>
  );
}

function LinkButton22() {
  return (
    <div className="absolute h-[36px] left-[1992.66px] rounded-[12px] top-0 w-[45.72px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.158px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[20.037px]">
        <p className="leading-[14px]">Ios</p>
      </div>
    </div>
  );
}

function LinkButton23() {
  return (
    <div className="absolute h-[36px] left-[2046.38px] rounded-[12px] top-0 w-[88.77px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.197px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[63.163px]">
        <p className="leading-[14px]">Mobile UI</p>
      </div>
    </div>
  );
}

function LinkButton24() {
  return (
    <div className="absolute h-[36px] left-[2143.14px] rounded-[12px] top-0 w-[55.86px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.19px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[30.24px]">
        <p className="leading-[14px]">Uiux</p>
      </div>
    </div>
  );
}

function LinkButton25() {
  return (
    <div className="absolute h-[36px] left-[2207px] rounded-[12px] top-0 w-[98.94px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.156px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[73.252px]">
        <p className="leading-[14px]">Dark Mode</p>
      </div>
    </div>
  );
}

function LinkButton26() {
  return (
    <div className="absolute h-[36px] left-[2313.94px] rounded-[12px] top-0 w-[45.13px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.157px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[19.443px]">
        <p className="leading-[14px]">3D</p>
      </div>
    </div>
  );
}

function LinkButton27() {
  return (
    <div className="absolute h-[36px] left-[2367.06px] rounded-[12px] top-0 w-[64.34px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.158px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[38.657px]">
        <p className="leading-[14px]">Clean</p>
      </div>
    </div>
  );
}

function LinkButton28() {
  return (
    <div className="absolute h-[36px] left-[2439.41px] rounded-[12px] top-0 w-[121.52px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.174px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[95.868px]">
        <p className="leading-[14px]">User Interface</p>
      </div>
    </div>
  );
}

function LinkButton29() {
  return (
    <div className="absolute h-[36px] left-[2568.92px] rounded-[12px] top-0 w-[109.44px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.164px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[83.769px]">
        <p className="leading-[14px]">Logo Design</p>
      </div>
    </div>
  );
}

function LinkButton30() {
  return (
    <div className="absolute h-[36px] left-[2686.36px] rounded-[12px] top-0 w-[39.58px]" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.179px)] not-italic text-[14px] text-center text-white top-[18px] translate-x-[-50%] translate-y-[-50%] w-[13.937px]">
        <p className="leading-[14px]">AI</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[36px] overflow-auto relative shrink-0 w-[788px]" data-name="Container">
      <LinkButton />
      <LinkButton1 />
      <LinkButton2 />
      <LinkButton3 />
      <LinkButton4 />
      <LinkButton5 />
      <LinkButton6 />
      <LinkButton7 />
      <LinkButton8 />
      <LinkButton9 />
      <LinkButton10 />
      <LinkButton11 />
      <LinkButton12 />
      <LinkButton13 />
      <LinkButton14 />
      <LinkButton15 />
      <LinkButton16 />
      <LinkButton17 />
      <LinkButton18 />
      <LinkButton19 />
      <LinkButton20 />
      <LinkButton21 />
      <LinkButton22 />
      <LinkButton23 />
      <LinkButton24 />
      <LinkButton25 />
      <LinkButton26 />
      <LinkButton27 />
      <LinkButton28 />
      <LinkButton29 />
      <LinkButton30 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
      <ButtonDialog />
      <Container2 />
    </div>
  );
}

function PictureTiimiEmployeeListViewInASaaSHrManagementSystem() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img alt="" className="absolute h-[100.01%] left-0 max-w-none top-0 w-full" src={imgFrame2} />
    </div>
  );
}

function OverlayShadow() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px]" data-name="Overlay+Shadow">
      <div className="absolute inset-0 pointer-events-none shadow-[0px_0px_0px_1px_inset_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute h-[219.98px] left-0 overflow-clip right-0 rounded-[12px] top-0" data-name="Button">
      <PictureTiimiEmployeeListViewInASaaSHrManagementSystem />
      <OverlayShadow />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[219.98px] left-0 overflow-clip right-0 top-0" data-name="Container">
      <Button />
    </div>
  );
}

function LinkSvg1() {
  return (
    <div className="absolute bottom-0 left-0 right-[265.33px] top-[231.98px]" data-name="Link → SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Link â SVG">
          <g id="Mask group">
            <mask height="28" id="mask0_3_358" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="28" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p59bf7f0} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_358)">
              <path d="M28 0H0V28H28V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[19px] left-[76.37px] overflow-clip top-[calc(50%+115.99px)] translate-y-[-50%] w-[434.61px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[19px] justify-center leading-[0] left-0 not-italic text-[15px] text-zinc-400 top-[9.5px] translate-y-[-50%] w-[434.979px]">
        <p className="leading-[19px]">Tiimi - Employee List View in a SaaS HR Management System</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[259.98px] overflow-clip relative shrink-0 w-[293.33px]" data-name="Container">
      <Container3 />
      <LinkSvg1 />
      <div className="absolute capitalize flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[19px] justify-center leading-[0] left-[38px] not-italic text-[15px] text-white top-[246.48px] translate-y-[-50%] w-[30.754px]">
        <p className="leading-[15px]">Fikri</p>
      </div>
      <Container4 />
      <div className="absolute bg-gradient-to-r bottom-0 from-[rgba(9,9,11,0)] h-[32px] right-0 to-[#09090b] w-[64px]" data-name="Gradient" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-start flex flex-wrap gap-[20px] items-start relative shrink-0 w-full">
      {[...Array(6).keys()].map((_, i) => (
        <Container5 key={i} />
      ))}
    </div>
  );
}

function Frame3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative w-full">
          <Frame2 />
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function PictureWhereDesigningIsBuilding() {
  return (
    <div className="absolute bottom-[25.57%] left-0 right-0 rounded-[12px] top-0" data-name="Picture → Where Designing is Building">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[12px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgPictureWhereDesigningIsBuilding} />
      </div>
    </div>
  );
}

function OverlayShadow6() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] bottom-[76px] left-0 right-0 rounded-[12px] top-0" data-name="Overlay+Shadow">
      <div className="absolute inset-0 pointer-events-none shadow-[0px_0px_0px_1px_inset_rgba(255,255,255,0.03)]" />
    </div>
  );
}

function Svg4() {
  return (
    <div className="absolute left-1/2 size-[24px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="SVG">
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
    <div className="absolute left-[259px] rounded-[8px] size-[32px] top-[4px]" data-name="Button menu">
      <Svg4 />
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute h-[297.25px] left-[32px] right-[32px] top-[32px]" data-name="Button">
      <PictureWhereDesigningIsBuilding />
      <OverlayShadow6 />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-white top-[245.25px] translate-y-[-50%] w-[213.256px]">
        <p className="leading-[24px]">Where Designing is Building</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[37px] justify-center leading-[20px] left-0 not-italic text-[14px] text-zinc-500 top-[276.75px] translate-y-[-50%] w-[286.11px]">
        <p className="mb-0">Go from design to website with Framer, the</p>
        <p>web builder for designers</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[276.84px] not-italic text-[14px] text-zinc-500 top-[287.25px] translate-y-[-50%] w-[18.467px]">
        <p className="leading-[20px]">Ad</p>
      </div>
      <ButtonMenu />
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute h-[362.25px] left-px right-0 top-[60px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <Button6 />
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute h-[32px] left-[253.31px] rounded-[8px] top-[calc(50%-188.5px)] translate-y-[-50%] w-[73.69px]" data-name="Link">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[8px]" />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[11px] not-italic text-[14px] text-white top-[16px] translate-y-[-50%] w-[52.048px]">
        <p className="leading-[14px]">View all</p>
      </div>
    </div>
  );
}

function Svg5() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Svg6() {
  return (
    <div className="absolute right-0 size-[24px] top-[22px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="SVG" opacity="0">
          <path d={svgPaths.p298f0c00} id="Vector" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p21e370b0} id="Vector_2" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink1() {
  return (
    <div className="absolute h-[68px] left-[-16px] right-[-16px] rounded-[12px] top-0" data-name="Item → Link">
      <Svg5 />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-[72px] not-italic text-[16px] text-zinc-100 top-[24px] translate-y-[-50%] w-[68.785px]">
        <p className="leading-[24px]">Designer</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[72px] not-italic text-[14px] text-zinc-500 top-[46px] translate-y-[-50%] w-[32.987px]">
        <p className="leading-[20px]">Yuzu</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[16px] justify-center leading-[0] left-[272.69px] not-italic text-[12px] text-zinc-600 top-[34px] translate-y-[-50%] w-[38.627px]">
        <p className="leading-[16px]">Sep 18</p>
      </div>
      <Svg6 />
    </div>
  );
}

function Svg7() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Svg8() {
  return (
    <div className="absolute right-0 size-[24px] top-[22px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="SVG" opacity="0">
          <path d={svgPaths.p298f0c00} id="Vector" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p21e370b0} id="Vector_2" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink2() {
  return (
    <div className="absolute h-[68px] left-[-16px] right-[-16px] rounded-[12px] top-[68px]" data-name="Item → Link">
      <Svg7 />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-[72px] not-italic text-[16px] text-zinc-100 top-[24px] translate-y-[-50%] w-[174.715px]">
        <p className="leading-[24px]">Staff Product Designer</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[72px] not-italic text-[14px] text-zinc-500 top-[46px] translate-y-[-50%] w-[59.181px]">
        <p className="leading-[20px]">Phantom</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[16px] justify-center leading-[0] left-[270.45px] not-italic text-[12px] text-zinc-600 top-[34px] translate-y-[-50%] w-[40.874px]">
        <p className="leading-[16px]">Aug 20</p>
      </div>
      <Svg8 />
    </div>
  );
}

function Svg9() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-emerald-500 inset-[14px_271px_14px_16px] overflow-clip" data-name="Background">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[17.6px] justify-center leading-[0] left-[9.36px] not-italic text-[14.4px] text-white top-[20px] translate-y-[-50%] w-[21.607px]">
        <p className="leading-[16px]">CH</p>
      </div>
    </div>
  );
}

function Svg10() {
  return (
    <div className="absolute right-0 size-[24px] top-[22px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="SVG" opacity="0">
          <path d={svgPaths.p298f0c00} id="Vector" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p21e370b0} id="Vector_2" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink3() {
  return (
    <div className="absolute h-[68px] left-[-16px] right-[-16px] rounded-[12px] top-[136px]" data-name="Item → Link">
      <Svg9 />
      <Background />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-[72px] not-italic text-[16px] text-zinc-100 top-[24px] translate-y-[-50%] w-[133.273px]">
        <p className="leading-[24px]">Product Designer</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[72px] not-italic text-[14px] text-zinc-500 top-[46px] translate-y-[-50%] w-[139.638px]">
        <p className="leading-[20px]">{`Carberry & Hanrahan`}</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[16px] justify-center leading-[0] left-[272.25px] not-italic text-[12px] text-zinc-600 top-[34px] translate-y-[-50%] w-[39.068px]">
        <p className="leading-[16px]">Aug 18</p>
      </div>
      <Svg10 />
    </div>
  );
}

function Svg11() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Svg12() {
  return (
    <div className="absolute right-0 size-[24px] top-[22px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="SVG" opacity="0">
          <path d={svgPaths.p298f0c00} id="Vector" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p21e370b0} id="Vector_2" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink4() {
  return (
    <div className="absolute h-[68px] left-[-16px] right-[-16px] rounded-[12px] top-[204px]" data-name="Item → Link">
      <Svg11 />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-[72px] not-italic text-[16px] text-zinc-100 top-[24px] translate-y-[-50%] w-[118.323px]">
        <p className="leading-[24px]">Brand Designer</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[72px] not-italic text-[14px] text-zinc-500 top-[46px] translate-y-[-50%] w-[33.802px]">
        <p className="leading-[20px]">Titan</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[16px] justify-center leading-[0] left-[278.08px] not-italic text-[12px] text-zinc-600 top-[34px] translate-y-[-50%] w-[33.319px]">
        <p className="leading-[16px]">Jul 31</p>
      </div>
      <Svg12 />
    </div>
  );
}

function Svg13() {
  return (
    <div className="absolute inset-[26px_271px_26px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Svg14() {
  return (
    <div className="absolute right-0 size-[24px] top-[34px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="SVG" opacity="0">
          <path d={svgPaths.p298f0c00} id="Vector" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p21e370b0} id="Vector_2" stroke="var(--stroke-0, #F4F4F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ItemLink5() {
  return (
    <div className="absolute h-[92px] left-[-16px] right-[-16px] rounded-[12px] top-[272px]" data-name="Item → Link">
      <Svg13 />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[44px] justify-center leading-[24px] left-[72px] not-italic text-[16px] text-zinc-100 top-[36px] translate-y-[-50%] w-[141.23px]">
        <p className="mb-0">{`Brand & Marketing`}</p>
        <p>Designer</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[20px] justify-center leading-[0] left-[72px] not-italic text-[14px] text-zinc-500 top-[70px] translate-y-[-50%] w-[47.725px]">
        <p className="leading-[20px]">ai.work</p>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[31px] justify-center leading-[16px] left-[277.59px] not-italic text-[12px] text-zinc-600 top-[45.5px] translate-y-[-50%] w-[16.55px]">
        <p className="mb-0">Jul</p>
        <p>29</p>
      </div>
      <Svg14 />
    </div>
  );
}

function List1() {
  return (
    <div className="absolute h-[364px] left-[32px] right-[32px] top-[76px]" data-name="List">
      <ItemLink1 />
      <ItemLink2 />
      <ItemLink3 />
      <ItemLink4 />
      <ItemLink5 />
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute h-[473px] left-px right-0 top-[422.25px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-[32px] not-italic text-[16px] text-zinc-100 top-[48px] translate-y-[-50%] w-[90.389px]">
        <p className="leading-[24px]">Recent jobs</p>
      </div>
      <Link1 />
      <List1 />
    </div>
  );
}

function Svg15() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-indigo-500 inset-[14px_271px_14px_16px] overflow-clip" data-name="Background">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[17.6px] justify-center leading-[0] left-[9.19px] not-italic text-[14.4px] text-white top-[20px] translate-y-[-50%] w-[21.949px]">
        <p className="leading-[16px]">ME</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[24px] left-[72px] overflow-clip right-[100.8px] top-[12px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[20px] justify-center leading-[0] left-0 not-italic text-[16px] text-zinc-100 top-[12px] translate-y-[-50%] w-[132.603px]">
        <p className="leading-[24px]">Marjorie T Eunike</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[20px] left-[72px] overflow-clip right-[100.8px] top-[36px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[17px] justify-center leading-[0] left-0 not-italic text-[14px] text-zinc-500 top-[9.5px] translate-y-[-50%] w-[99.403px]">
        <p className="leading-[20px]">@margedesign</p>
      </div>
    </div>
  );
}

function ButtonButton() {
  return (
    <div className="absolute bg-white h-[36px] left-[242.2px] rounded-[12px] top-[16px] w-[68.8px]" data-name="Button → Button">
      <div aria-hidden="true" className="absolute border border-slate-950 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.165px)] not-italic text-[14px] text-center text-slate-950 top-[18px] translate-x-[-50%] translate-y-[-50%] w-[43.131px]">
        <p className="leading-[14px]">Follow</p>
      </div>
    </div>
  );
}

function ItemLink6() {
  return (
    <div className="absolute h-[68px] left-[16px] rounded-[12px] top-0 w-[327px]" data-name="Item → Link">
      <Svg15 />
      <Background1 />
      <Container21 />
      <Container22 />
      <ButtonButton />
    </div>
  );
}

function Svg16() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Background2() {
  return (
    <div className="absolute bg-emerald-500 inset-[14px_271px_14px_16px] overflow-clip" data-name="Background">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[17.6px] justify-center leading-[0] left-[10.36px] not-italic text-[14.4px] text-white top-[20px] translate-y-[-50%] w-[19.594px]">
        <p className="leading-[16px]">CE</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[24px] left-[72px] overflow-clip right-[100.8px] top-[12px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[20px] justify-center leading-[0] left-0 not-italic text-[16px] text-zinc-100 top-[12px] translate-y-[-50%] w-[152.478px]">
        <p className="leading-[24px]">Chronicles Embod…</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[20px] left-[72px] overflow-clip right-[100.8px] top-[36px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[17px] justify-center leading-[0] left-0 not-italic text-[14px] text-zinc-500 top-[9.5px] translate-y-[-50%] w-[150.006px]">
        <p className="leading-[20px]">@chroniclesembodie…</p>
      </div>
    </div>
  );
}

function ButtonButton1() {
  return (
    <div className="absolute bg-white h-[36px] left-[242.2px] rounded-[12px] top-[16px] w-[68.8px]" data-name="Button → Button">
      <div aria-hidden="true" className="absolute border border-slate-950 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.165px)] not-italic text-[14px] text-center text-slate-950 top-[18px] translate-x-[-50%] translate-y-[-50%] w-[43.131px]">
        <p className="leading-[14px]">Follow</p>
      </div>
    </div>
  );
}

function ItemLink7() {
  return (
    <div className="absolute h-[68px] left-[16px] rounded-[12px] top-[68px] w-[327px]" data-name="Item → Link">
      <Svg16 />
      <Background2 />
      <Container23 />
      <Container24 />
      <ButtonButton1 />
    </div>
  );
}

function Svg17() {
  return (
    <div className="absolute inset-[14px_271px_14px_16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="SVG">
          <g id="Mask group">
            <mask height="40" id="mask0_3_351" maskUnits="userSpaceOnUse" style={{ maskType: "luminance" }} width="40" x="0" y="0">
              <g id="Group">
                <path d={svgPaths.p39a2a80} fill="var(--fill-0, white)" id="Vector" />
              </g>
            </mask>
            <g mask="url(#mask0_3_351)">
              <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #202023)" id="Vector_2" />
            </g>
          </g>
          <g id="Vector_3"></g>
        </g>
      </svg>
    </div>
  );
}

function Background3() {
  return (
    <div className="absolute bg-green-500 inset-[14px_271px_14px_16px] overflow-clip" data-name="Background">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[17.6px] justify-center leading-[0] left-[8px] not-italic text-[14.4px] text-white top-[20px] translate-y-[-50%] w-[24.334px]">
        <p className="leading-[16px]">OM</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[24px] left-[72px] overflow-clip right-[100.8px] top-[12px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[20px] justify-center leading-[0] left-0 not-italic text-[16px] text-zinc-100 top-[12px] translate-y-[-50%] w-[65.36px]">
        <p className="leading-[24px]">obi muni</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[20px] left-[72px] overflow-clip right-[100.8px] top-[36px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[17px] justify-center leading-[0] left-0 not-italic text-[14px] text-zinc-500 top-[9.5px] translate-y-[-50%] w-[149.736px]">
        <p className="leading-[20px]">@muniobimg9nuwjm…</p>
      </div>
    </div>
  );
}

function ButtonButton2() {
  return (
    <div className="absolute bg-white h-[36px] left-[242.2px] rounded-[12px] top-[16px] w-[68.8px]" data-name="Button → Button">
      <div aria-hidden="true" className="absolute border border-slate-950 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[14px] justify-center leading-[0] left-[calc(50%+0.165px)] not-italic text-[14px] text-center text-slate-950 top-[18px] translate-x-[-50%] translate-y-[-50%] w-[43.131px]">
        <p className="leading-[14px]">Follow</p>
      </div>
    </div>
  );
}

function ItemLink8() {
  return (
    <div className="absolute h-[68px] left-[16px] rounded-[12px] top-[136px] w-[327px]" data-name="Item → Link">
      <Svg17 />
      <Background3 />
      <Container25 />
      <Container26 />
      <ButtonButton2 />
    </div>
  );
}

function List2() {
  return (
    <div className="absolute h-[236px] left-0 right-0 top-[68px]" data-name="List">
      <ItemLink6 />
      <ItemLink7 />
      <ItemLink8 />
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="absolute h-[305px] left-px right-0 top-[895.25px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <div className="absolute flex flex-col font-['Inter:Medium',_sans-serif] font-medium h-[24px] justify-center leading-[0] left-[32px] not-italic text-[16px] text-zinc-100 top-[44px] translate-y-[-50%] w-[118.183px]">
        <p className="leading-[24px]">Recent signups</p>
      </div>
      <List2 />
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[19px] left-[40px] overflow-clip right-[12px] top-[10px]" data-name="Container">
      <div className="absolute flex flex-col font-['Inter:Regular',_sans-serif] font-normal h-[19px] justify-center leading-[0] left-0 not-italic text-[15px] text-zinc-500 top-[9.5px] translate-y-[-50%] w-[113.145px]">
        <p className="leading-[normal]">Search Layers...</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-zinc-900 h-[40px] left-0 overflow-clip right-0 rounded-[12px] top-1/2 translate-y-[-50%]" data-name="Input">
      <Container27 />
    </div>
  );
}

function Svg18() {
  return (
    <div className="absolute h-[24px] left-[12px] top-[8px] w-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 24">
        <g id="SVG">
          <path d={svgPaths.pf39700} id="Vector" stroke="var(--stroke-0, #52525B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2514880} id="Vector_2" stroke="var(--stroke-0, #52525B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Form() {
  return (
    <div className="absolute h-[40px] left-[33px] right-[32px] top-[20px]" data-name="Form">
      <Input />
      <Svg18 />
    </div>
  );
}

function Aside1() {
  return (
    <div className="bg-zinc-950 h-[1200.25px] shrink-0 sticky top-0 w-[360px]" data-name="Aside">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <HorizontalBorder />
      <HorizontalBorder1 />
      <HorizontalBorder2 />
      <Form />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-1/2 top-0 translate-x-[-50%] w-[1440px]" data-name="Main">
      <Aside />
      <Frame3 />
      <Aside1 />
    </div>
  );
}

export default function Component1440WDark() {
  return (
    <div className="relative size-full" data-name="1440w dark" style={{ backgroundImage: "linear-gradient(90deg, rgb(9, 9, 11) 0%, rgb(9, 9, 11) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Main />
    </div>
  );
}