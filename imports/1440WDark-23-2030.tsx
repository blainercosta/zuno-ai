import svgPaths from "./svg-hi6hpjx1gr";
import imgYuzu from "figma:asset/4d68c102630e8c7f4bc229028194c1d5bd73973f.png";
import { imgGroup } from "./svg-h8a96";

function Svg() {
  return (
    <div className="h-[28.875px] relative shrink-0 w-full" data-name="SVG">
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

function Container() {
  return (
    <div className="content-stretch flex flex-col h-[28.88px] items-start relative shrink-0 w-[28px]" data-name="Container">
      <Svg />
    </div>
  );
}

function Link() {
  return (
    <div className="box-border content-stretch flex items-center justify-center pb-[3.12px] pt-[4px] px-0 relative shrink-0 size-[36px]" data-name="Link">
      <Container />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center p-[8px] relative w-full">
          <Link />
        </div>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.pa2c4300} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M20 20L16 16" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg1 />
    </div>
  );
}

function ItemLink() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center px-[16px] py-[12px] relative w-full">
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2f351e40} id="Vector" stroke="var(--stroke-0, #CBD5E1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M3 11L12 14L21 11" id="Vector_2" stroke="var(--stroke-0, #CBD5E1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg2 />
    </div>
  );
}

function ItemLink1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Item → Link">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center px-[16px] py-[12px] relative w-full">
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0 w-full" data-name="List">
      <ItemLink />
      <ItemLink1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Container">
      <List />
    </div>
  );
}

function Margin() {
  return <div className="h-[8px] shrink-0 w-full" data-name="Margin" />;
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2667d080} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3a387c80} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex items-center px-[16px] py-[12px] relative w-full">
          <Svg3 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start p-[8px] relative size-full">
          <Container1 />
          <Container4 />
          <Margin />
          <Link1 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex h-[900px] items-start justify-center shrink-0 sticky top-0 w-[72px]" data-name="Container">
      <Container5 />
    </div>
  );
}

function Aside() {
  return (
    <div className="box-border content-stretch flex flex-col h-[2374.25px] items-start pl-0 pr-px py-0 relative shrink-0 w-[72px] z-[2]" data-name="Aside">
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <Container6 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M14 7L9 12L14 17" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-zinc-900 content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[36px]" data-name="Button">
      <Svg4 />
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex items-start p-[12px] relative size-full">
          <Button />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-white">
        <p className="leading-[24px] whitespace-pre">Jobs</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center p-[12px] relative size-full">
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container9 />
      <div className="basis-0 grow min-h-px min-w-px self-stretch shrink-0" data-name="Rectangle" />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-zinc-950 box-border content-stretch flex flex-col items-start max-w-[1440px] pb-px pt-0 px-0 shrink-0 sticky top-0 w-full z-[2]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <Container10 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[30px] text-white w-full">
        <p className="leading-[36px]">Designer</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-slate-50">
        <p className="leading-[30px] whitespace-pre">Background</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[46px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[0px] text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">
          <span className="font-['Inter:Regular',sans-serif] not-italic">{`At Yuzu, we’re building `}</span>
          <span className="font-['Inter:Italic',sans-serif] italic">the</span>
          <span className="font-['Inter:Regular',sans-serif] not-italic">{` next-generation health insurance company. We are`}</span>
        </p>
        <p className="mb-0">NOT building a digital brokerage or an AI wrapper - we are going deeper to build</p>
        <p className="mb-0">the foundational infrastructure required to power tomorrow’s health plans. We</p>
        <p className="mb-0">believe that software can unlock the ability to build health insurance that is</p>
        <p>affordable, adaptable, and scalable. Yuzu’s platform will be core to this future.</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[182px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">So how does this actually work? Over 70% of employer-sponsored health plans</p>
        <p className="mb-0">are self-funded, meaning the employer acts as the insurer and directly covers</p>
        <p className="mb-0">{`employees' healthcare costs. This allows companies to customize benefits, gain`}</p>
        <p className="mb-0">flexibility, and save money. Self-funded employers partner with a Third-Party</p>
        <p className="mb-0">Administrator (TPA) to handle the behind-the-scenes plan administration, like</p>
        <p>processing claims and managing benefits.</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[342px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">The TPA industry is a $500bn sleeper industry that has historically been seen as a</p>
        <p className="mb-0">services business, bogged down by manual processes and legacy systems (for</p>
        <p>context, our team couldn’t even access these on our Macs).</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[430px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">{`Yuzu is a vertically integrated & tech-enabled TPA, currently servicing thousands`}</p>
        <p className="mb-0">of employees. We differentiate by helping innovative health plans come to life by</p>
        <p className="mb-0">facilitating new ways to pay for and access healthcare covered by insurance.</p>
        <p className="mb-0">Yuzu’s goal is to make it as easy for any business to create and manage a custom</p>
        <p>health plan as it is to create a storefront on Shopify.</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[566px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">We’re backed by top VC firms and 10+ unicorn founders, including leaders at</p>
        <p className="mb-0">Stripe, OpenAI, Brex, Deel, Mercury, and Notion, and we’re building a formidable</p>
        <p>team to tackle the massive opportunity ahead.</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-0 pb-0 pt-[9px] px-0 right-0 top-[654px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-slate-50">
        <p className="leading-[30px] whitespace-pre">Role</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[709px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">Yuzu is an early-stage startup that places a strong emphasis on swift software</p>
        <p className="mb-0">development paired with intentional design. We need a talented designer to help</p>
        <p className="mb-0">us both craft visually stunning and highly functional user experiences and storytell</p>
        <p>our mission and amibitions.</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[821px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">At Yuzu we</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">Build end to end experiences for multiple user types, including members,</p>
        <p>employers, and partners</p>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container18 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">Produce lots of materials for members, our channel partners, and employers.</p>
        <p>Everything from pamphlets to the actual ID cards members receive!</p>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container19 />
    </div>
  );
}

function List1() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[3.19px] items-start left-0 pl-[24px] pr-0 py-0 right-0 top-[861px]" data-name="List">
      <Item />
      <Item1 />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[976.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">As an early employee you will</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Set a large part of Yuzu’s company culture</p>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container21 />
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Create user-centric designs that set us apart in the healthcare tech industry</p>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container22 />
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">Bridge design and development, translating your design concepts into the</p>
        <p>codebase</p>
      </div>
    </div>
  );
}

function Item4() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container23 />
    </div>
  );
}

function List2() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[3.2px] items-start left-0 pl-[24px] pr-0 py-0 right-0 top-[1016.19px]" data-name="List">
      <Item2 />
      <Item3 />
      <Item4 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-0 pb-0 pt-[8.99px] px-0 right-0 top-[1134.57px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-slate-50">
        <p className="leading-[30px] whitespace-pre">Qualifications</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400 whitespace-pre">
        <p className="mb-0">Experience in UI/UX design for successful software projects, ideally in a startup</p>
        <p>or small team environment</p>
      </div>
    </div>
  );
}

function Item5() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Proficiency in Figma</p>
      </div>
    </div>
  );
}

function Item6() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container25 />
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">In-person 5 days/week in Flatiron NYC office required</p>
      </div>
    </div>
  );
}

function Item7() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container26 />
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Self-directed, curious, fast-paced personality with strong communication skills</p>
      </div>
    </div>
  );
}

function Item8() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container27 />
    </div>
  );
}

function List3() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[3.2px] items-start left-0 pl-[24px] pr-0 py-0 right-0 top-[1181.56px]" data-name="List">
      <Item5 />
      <Item6 />
      <Item7 />
      <Item8 />
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[1327.13px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center leading-[0] relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Nice to Haves</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Experience in healthcare or fintech infrastructure</p>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="absolute h-[24px] left-[24px] right-0 top-[1367.13px]" data-name="List → Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container29 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[1416.13px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-slate-50">
        <p className="leading-[30px] whitespace-pre">Our Commitment to You</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">You will have significant ownership. Both equity and autonomy.</p>
      </div>
    </div>
  );
}

function Item9() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container30 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">We will invest in your learning and forgive your mistakes along the way.</p>
      </div>
    </div>
  );
}

function Item10() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container31 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">We will trust you and tell you everything you want to know about the business.</p>
      </div>
    </div>
  );
}

function Item11() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container32 />
    </div>
  );
}

function List4() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[3.2px] items-start left-0 pl-[24px] pr-0 py-0 right-0 top-[1454.13px]" data-name="List">
      <Item9 />
      <Item10 />
      <Item11 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[1557.5px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-slate-50">
        <p className="leading-[30px] whitespace-pre">Compensation</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[1603.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">$120k to $180k base annual salary + $100k to $200k initial equity grant</p>
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[1652.5px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-nowrap text-slate-50">
        <p className="leading-[30px] whitespace-pre">Process</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[1698.5px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">If we interview you, you can expect the following process</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">Initial 30-45 minute conversation</p>
      </div>
    </div>
  );
}

function Item12() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container35 />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">A take-home assignment designed to be similar to on-the-job work</p>
      </div>
    </div>
  );
}

function Item13() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container36 />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">A 45 minute fit interview</p>
      </div>
    </div>
  );
}

function Item14() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container37 />
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">An onsite super-day</p>
      </div>
    </div>
  );
}

function Item15() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container38 />
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-zinc-400">
        <p className="leading-[24px] whitespace-pre">We may speak with 1-2 references you provide</p>
      </div>
    </div>
  );
}

function Item16() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Item">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] left-0 not-italic text-[16px] text-black top-[12px] translate-y-[-50%] w-[7.35px]">
        <ul className="ml-[-1.5em]">
          <li className="list-disc ms-[24px]">
            <span className="leading-[24px]"> </span>
          </li>
        </ul>
      </div>
      <Container39 />
    </div>
  );
}

function List5() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[3.2px] items-start left-0 pl-[24px] pr-0 py-0 right-0 top-[1738.5px]" data-name="List">
      <Item12 />
      <Item13 />
      <Item14 />
      <Item15 />
      <Item16 />
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[1910.25px] relative shrink-0 w-full" data-name="Container">
      <Heading3 />
      <Container11 />
      <Container12 />
      <Container13 />
      <Container14 />
      <Container15 />
      <Heading4 />
      <Container16 />
      <Container17 />
      <List1 />
      <Container20 />
      <List2 />
      <Heading5 />
      <List3 />
      <Container28 />
      <ListItem />
      <Heading6 />
      <List4 />
      <Heading7 />
      <Container33 />
      <Heading8 />
      <Container34 />
      <List5 />
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-center text-nowrap text-slate-950">
        <p className="leading-[15px] whitespace-pre">Apply for this position</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container41 />
    </div>
  );
}

function LinkApplyForThisJobPositionButton() {
  return (
    <div className="bg-white box-border content-stretch flex h-[40px] items-center justify-center px-[17px] py-[9px] relative rounded-[12px] shrink-0" data-name="Link - Apply for this job position → Button">
      <div aria-hidden="true" className="absolute border border-slate-950 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Container42 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <LinkApplyForThisJobPositionButton />
    </div>
  );
}

function Container44() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[25px] items-start p-[64px] relative w-full">
          <Heading1 />
          <Container40 />
          <Container43 />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-[64px] pt-[65px] px-[64px] relative w-full">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-zinc-500 w-full">
            <p className="leading-[20px]">Posted September 18, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Article() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Article">
      <Container44 />
      <HorizontalBorder />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[752px]" data-name="Container">
      <Article />
    </div>
  );
}

function Yuzu() {
  return (
    <div className="basis-0 grow max-w-[40px] min-h-px min-w-px relative shrink-0 w-full" data-name="Yuzu">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[100.15%] left-0 max-w-none top-[-0.08%] w-full" src={imgYuzu} />
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-zinc-800 content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[8px] shrink-0 size-[40px]" data-name="Background">
      <Yuzu />
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap text-white">
        <p className="leading-[24px] whitespace-pre">Yuzu</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-slate-400">
        <p className="leading-[20px] whitespace-pre">Visit website</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading2 />
      <Link2 />
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Background />
      <Container46 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-center text-nowrap text-slate-950">
        <p className="leading-[15px] whitespace-pre">Apply for this position</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container48 />
    </div>
  );
}

function LinkButton() {
  return (
    <div className="bg-white h-[40px] relative rounded-[12px] shrink-0 w-full" data-name="Link → Button">
      <div aria-hidden="true" className="absolute border border-slate-950 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[40px] items-center justify-center px-[17px] py-[9px] relative w-full">
          <Container49 />
        </div>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start p-[64px] relative w-full">
          <Container47 />
          <LinkButton />
        </div>
      </div>
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-full">
        <p className="leading-[24px]">Share this job</p>
      </div>
    </div>
  );
}

function Img() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Img">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Img">
          <path d={svgPaths.p998e00} fill="var(--fill-0, #71717A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LinkShareOnTwitter() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[20px]" data-name="Link - Share on Twitter">
      <Img />
    </div>
  );
}

function Img1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Img">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Img">
          <path d={svgPaths.pc768180} fill="var(--fill-0, #71717A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LinkShareViaEmail() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[20px]" data-name="Link - Share via email">
      <Img1 />
    </div>
  );
}

function Img2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Img">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Img">
          <path d={svgPaths.p389c6a00} fill="var(--fill-0, #71717A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LinkShareOnFacebook() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[20px]" data-name="Link - Share on Facebook">
      <Img2 />
    </div>
  );
}

function Img3() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Img">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Img">
          <path d={svgPaths.p3009cf80} fill="var(--fill-0, #71717A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function LinkShareOnLinkedIn() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[20px]" data-name="Link - Share on LinkedIn">
      <Img3 />
    </div>
  );
}

function Img4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="Img">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Img">
          <path d={svgPaths.pc18d680} fill="var(--fill-0, #71717A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ButtonCopyLinkToClipboard() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[20px]" data-name="Button - Copy link to clipboard">
      <Img4 />
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <LinkShareOnTwitter />
      <LinkShareViaEmail />
      <LinkShareOnFacebook />
      <LinkShareOnLinkedIn />
      <ButtonCopyLinkToClipboard />
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-solid border-zinc-900 inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-[64px] pt-[65px] px-[64px] relative w-full">
          <Heading9 />
          <Container51 />
        </div>
      </div>
    </div>
  );
}

function Heading10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-full">
        <p className="leading-[24px]">Similar Jobs</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[40px_40px]" data-name="Group" style={{ maskImage: `url('${imgGroup}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Group">
          <path d="M40 0H0V40H40V0Z" fill="var(--fill-0, #AB9FF2)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p1c3a6e00} fill="var(--fill-0, #FFFDF8)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function ClipPathGroup() {
  return (
    <div className="absolute contents inset-0" data-name="Clip path group">
      <Group />
    </div>
  );
}

function E6D13A39185742A38355080C3C2C19BePhantomIconCircleSvg() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="e6d13a39-1857-42a3-8355-080c3c2c19be-Phantom-Icon_Circle.svg">
      <ClipPathGroup />
    </div>
  );
}

function E6D13A39185742A38355080C3C2C19BePhantomIconCircleSvgFill() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[40px]" data-name="e6d13a39-1857-42a3-8355-080c3c2c19be-Phantom-Icon_Circle.svg fill">
      <E6D13A39185742A38355080C3C2C19BePhantomIconCircleSvg />
    </div>
  );
}

function Phantom() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start max-w-[40px] min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="Phantom">
      <E6D13A39185742A38355080C3C2C19BePhantomIconCircleSvgFill />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-zinc-800 content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[8px] shrink-0 size-[40px]" data-name="Background">
      <Phantom />
    </div>
  );
}

function Heading11() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-full">
        <p className="leading-[24px]">Staff Product Designer</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-400">
        <p className="leading-[20px] whitespace-pre">Phantom</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-nowrap text-zinc-400">
        <p className="leading-[16px] whitespace-pre">•</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-400">
        <p className="leading-[20px] whitespace-pre">United States</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full" data-name="Container">
      <Container52 />
      <Container53 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Heading11 />
      <Container55 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="Margin">
      <Container56 />
    </div>
  );
}

function Container57() {
  return (
    <div className="box-border content-stretch flex gap-[12px] h-[42px] items-center pb-[2px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <Background1 />
      <Margin1 />
    </div>
  );
}

function Link3() {
  return (
    <div className="box-border content-stretch flex flex-col items-start p-[12px] relative rounded-[8px] shrink-0 w-[295px]" data-name="Link">
      <Container57 />
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link3 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d={svgPaths.p2f351e40} id="Vector" stroke="var(--stroke-0, #93C5FD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M3 11L12 14L21 11" id="Vector_2" stroke="var(--stroke-0, #93C5FD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Background2() {
  return (
    <div className="basis-0 bg-blue-900 content-stretch flex grow items-center justify-center min-h-px min-w-px relative shrink-0 w-full" data-name="Background">
      <Svg5 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-zinc-800 content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[8px] shrink-0 size-[40px]" data-name="Background">
      <Background2 />
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white w-full">
        <p className="leading-[24px]">Product Designer</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-zinc-400">
        <p className="leading-[20px] whitespace-pre">{`Carberry & Hanrahan`}</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <Container59 />
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Heading12 />
      <Container60 />
    </div>
  );
}

function Margin2() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0" data-name="Margin">
      <Container61 />
    </div>
  );
}

function Container62() {
  return (
    <div className="box-border content-stretch flex gap-[12px] h-[42px] items-center pb-[2px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <Background3 />
      <Margin2 />
    </div>
  );
}

function Link4() {
  return (
    <div className="box-border content-stretch flex flex-col items-start p-[12px] relative rounded-[8px] shrink-0 w-[295px]" data-name="Link">
      <Container62 />
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link4 />
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[283px]" data-name="Container">
      <Container58 />
      <Container63 />
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-center text-nowrap text-white">
        <p className="leading-[14px] text-[14px] whitespace-pre">View all jobs</p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container65 />
    </div>
  );
}

function Link5() {
  return (
    <div className="h-[36px] relative rounded-[12px] shrink-0 w-full" data-name="Link">
      <div aria-hidden="true" className="absolute border border-solid border-zinc-800 inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[36px] items-center justify-center px-[13px] py-[7px] relative w-full">
          <Container66 />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-solid border-zinc-900 inset-0 pointer-events-none" />
      <div className="flex flex-col items-end size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-end pb-[64px] pt-[65px] px-[64px] relative w-full">
          <Heading10 />
          <Container64 />
          <Link5 />
        </div>
      </div>
    </div>
  );
}

function VerticalBorder() {
  return (
    <div className="min-h-[900px] shrink-0 sticky top-0 w-full" data-name="VerticalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_0px_1px] border-solid border-zinc-800 inset-0 pointer-events-none" />
      <div className="min-h-inherit size-full">
        <div className="box-border content-stretch flex flex-col items-start min-h-inherit pb-[122px] pl-px pr-0 pt-0 relative w-full">
          <Container50 />
          <HorizontalBorder1 />
          <HorizontalBorder2 />
        </div>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="box-border content-stretch flex flex-col items-start max-w-[400px] pb-[1398.25px] pt-[15px] px-0 relative self-stretch shrink-0 w-[400px]" data-name="Container">
      <VerticalBorder />
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-[1152px] z-[1]" data-name="Container">
      <Container45 />
      <Container67 />
    </div>
  );
}

function Main() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[61px] grow isolate items-center min-h-px min-w-px relative self-stretch shrink-0 z-[1]" data-name="Main">
      <Header />
      <Container68 />
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute content-stretch flex isolate items-start left-0 right-0 top-0" data-name="Container">
      <Aside />
      <Main />
    </div>
  );
}

function Svg6() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-full" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 64">
        <g id="SVG">
          <path d={svgPaths.p133bf80} fill="var(--fill-0, white)" fillOpacity="0.2" id="Vector" />
          <path d={svgPaths.p2c8eb7b0} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector_2" />
          <path d={svgPaths.pfaeab80} fill="var(--fill-0, white)" fillOpacity="0.8" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[64px]" data-name="Container">
      <Svg6 />
    </div>
  );
}

function Background4() {
  return (
    <div className="absolute bg-zinc-950 box-border content-stretch flex inset-0 items-center justify-center px-[688px] py-[418px]" data-name="Background">
      <Container70 />
    </div>
  );
}

function Container71() {
  return (
    <div className="absolute h-[900px] left-0 opacity-0 top-0 w-[1440px]" data-name="Container">
      <Background4 />
    </div>
  );
}

export default function Component1440WDark() {
  return (
    <div className="relative size-full" data-name="1440w dark" style={{ backgroundImage: "linear-gradient(90deg, rgb(9, 9, 11) 0%, rgb(9, 9, 11) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container69 />
      <Container71 />
    </div>
  );
}