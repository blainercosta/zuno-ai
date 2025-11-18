import svgPaths from "../imports/svg-hi6hpjx1gr";
import { Twitter, Mail, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";

// Placeholder image
const imgYuzu = "https://placehold.co/200x200/1a1a1a/808080?text=Yuzu";

interface JobDetailPageProps {
  onBack: () => void;
}

export default function JobDetailPage({ onBack }: JobDetailPageProps) {
  return (
    <div className="flex min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
          <div className="flex items-center w-full">
            {/* Back Button Container */}
            <div className="flex-[0_0_auto] min-w-0">
              <div className="p-3">
                <button
                  onClick={onBack}
                  className="bg-zinc-900 size-9 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <svg className="size-6" fill="none" viewBox="0 0 24 24">
                    <path d="M14 7L9 12L14 17" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Title Container - Centered */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <div className="p-3">
                <h2 className="text-base">Jobs</h2>
              </div>
            </div>
            
            {/* Spacer to balance layout */}
            <div className="flex-[0_0_auto] min-w-0" style={{ width: '60px' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Article Section */}
          <div className="flex-1 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
            <div className="max-w-[752px]">
              {/* Title */}
              <h1 className="text-[30px] leading-[36px] mb-8">Designer</h1>

              {/* Background Section */}
              <div className="mb-8">
                <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6">Sobre a empresa</h3>
                
                <div className="text-zinc-400 space-y-6">
                  <p className="leading-[24px]">
                    At Yuzu, we're building <em>the</em> next-generation health insurance company. We are
                    NOT building a digital brokerage or an AI wrapper - we are going deeper to build
                    the foundational infrastructure required to power tomorrow's health plans. We
                    believe that software can unlock the ability to build health insurance that is
                    affordable, adaptable, and scalable. Yuzu's platform will be core to this future.
                  </p>
                  
                  <p className="leading-[24px]">
                    So how does this actually work? Over 70% of employer-sponsored health plans
                    are self-funded, meaning the employer acts as the insurer and directly covers
                    employees' healthcare costs. This allows companies to customize benefits, gain
                    flexibility, and save money. Self-funded employers partner with a Third-Party
                    Administrator (TPA) to handle the behind-the-scenes plan administration, like
                    processing claims and managing benefits.
                  </p>
                  
                  <p className="leading-[24px]">
                    The TPA industry is a $500bn sleeper industry that has historically been seen as a
                    services business, bogged down by manual processes and legacy systems (for
                    context, our team couldn't even access these on our Macs).
                  </p>
                  
                  <p className="leading-[24px]">
                    Yuzu is a vertically integrated & tech-enabled TPA, currently servicing thousands
                    of employees. We differentiate by helping innovative health plans come to life by
                    facilitating new ways to pay for and access healthcare covered by insurance.
                    Yuzu's goal is to make it as easy for any business to create and manage a custom
                    health plan as it is to create a storefront on Shopify.
                  </p>
                  
                  <p className="leading-[24px]">
                    We're backed by top VC firms and 10+ unicorn founders, including leaders at
                    Stripe, OpenAI, Brex, Deel, Mercury, and Notion, and we're building a formidable
                    team to tackle the massive opportunity ahead.
                  </p>
                </div>
              </div>

              {/* Role Section */}
              <div className="mb-8">
                <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Responsabilidades</h3>
                
                <div className="text-zinc-400 space-y-6">
                  <p className="leading-[24px]">
                    Yuzu is an early-stage startup that places a strong emphasis on swift software
                    development paired with intentional design. We need a talented designer to help
                    us both craft visually stunning and highly functional user experiences and storytell
                    our mission and ambitions.
                  </p>
                  
                  <div>
                    <p className="leading-[24px] mb-3">At Yuzu we</p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li className="leading-[24px]">Build end to end experiences for multiple user types, including members, employers, and partners</li>
                      <li className="leading-[24px]">Produce lots of materials for members, our channel partners, and employers. Everything from pamphlets to the actual ID cards members receive!</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="leading-[24px] mb-3">As an early employee you will</p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li className="leading-[24px]">Set a large part of Yuzu's company culture</li>
                      <li className="leading-[24px]">Create user-centric designs that set us apart in the healthcare tech industry</li>
                      <li className="leading-[24px]">Bridge design and development, translating your design concepts into the codebase</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Qualifications Section */}
              <div className="mb-8">
                <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Requisitos</h3>

                <ul className="list-disc ml-6 space-y-1 text-zinc-400 mb-6">
                  <li className="leading-[24px]">Experience in UI/UX design for successful software projects, ideally in a startup or small team environment</li>
                  <li className="leading-[24px]">Proficiency in Figma</li>
                  <li className="leading-[24px]">In-person 5 days/week in Flatiron NYC office required</li>
                  <li className="leading-[24px]">Self-directed, curious, fast-paced personality with strong communication skills</li>
                </ul>

                <p className="text-zinc-400 font-medium leading-[24px] mb-3">Diferenciais</p>
                <ul className="list-disc ml-6 text-zinc-400">
                  <li className="leading-[24px]">Experience in healthcare or fintech infrastructure</li>
                </ul>
              </div>

              {/* Our Commitment Section */}
              <div className="mb-8">
                <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">O que oferecemos</h3>
                
                <ul className="list-disc ml-6 space-y-1 text-zinc-400">
                  <li className="leading-[24px]">You will have significant ownership. Both equity and autonomy.</li>
                  <li className="leading-[24px]">We will invest in your learning and forgive your mistakes along the way.</li>
                  <li className="leading-[24px]">We will trust you and tell you everything you want to know about the business.</li>
                </ul>
              </div>

              {/* Compensation Section */}
              <div className="mb-8">
                <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Remuneração</h3>
                
                <p className="text-zinc-400 leading-[24px]">
                  $120k to $180k base annual salary + $100k to $200k initial equity grant
                </p>
              </div>

              {/* Process Section */}
              <div className="mb-8">
                <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Processo seletivo</h3>
                
                <p className="text-zinc-400 leading-[24px] mb-3">If we interview you, you can expect the following process</p>
                
                <ul className="list-disc ml-6 space-y-1 text-zinc-400">
                  <li className="leading-[24px]">Initial 30-45 minute conversation</li>
                  <li className="leading-[24px]">A take-home assignment designed to be similar to on-the-job work</li>
                  <li className="leading-[24px]">A 45 minute fit interview</li>
                  <li className="leading-[24px]">An onsite super-day</li>
                  <li className="leading-[24px]">We may speak with 1-2 references you provide</li>
                </ul>
              </div>

              {/* Apply Button */}
              <button className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors mb-8">
                Candidatar-se
              </button>

              {/* Posted Date */}
              <div className="border-t border-zinc-800 pt-16">
                <p className="text-sm text-zinc-500 leading-[21px]">Publicada em 18 de setembro de 2025</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-zinc-800">
            {/* Company Info */}
            <div className="px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <div className="flex items-start gap-3 mb-6">
                <div className="size-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                  <img src={imgYuzu} alt="Yuzu" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base leading-[24px] mb-0.5">Yuzu</h3>
                  <a href="#" className="text-sm text-slate-400 hover:text-white leading-[21px]">Visit website</a>
                </div>
              </div>
              <button className="w-full bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors">
                Candidatar-se
              </button>
            </div>

            {/* Share */}
            <div className="border-t border-zinc-800 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <h3 className="text-base leading-[24px] mb-4">Compartilhar vaga</h3>
              <div className="flex gap-4">
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <Twitter className="size-5" />
                </button>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <Mail className="size-5" />
                </button>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <Facebook className="size-5" />
                </button>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <Linkedin className="size-5" />
                </button>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <LinkIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="border-t border-zinc-800 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <h3 className="text-base leading-[24px] mb-4">Vagas similares</h3>

              <div className="space-y-0 mb-6">
                <button className="w-full p-3 hover:bg-zinc-900 rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-purple-500 flex items-center justify-center shrink-0 overflow-hidden">
                      <svg className="size-full" fill="none" viewBox="0 0 48 48">
                        <rect width="48" height="48" fill="#AB9FF2" />
                        <path clipRule="evenodd" d={svgPaths.p1c3a6e00} fill="#FFFDF8" fillRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base text-white leading-[24px] truncate">Staff Product Designer</h4>
                      <div className="flex items-center gap-2 text-sm text-zinc-400 leading-[21px]">
                        <span>Phantom</span>
                        <span>·</span>
                        <span className="truncate">United States</span>
                      </div>
                    </div>
                  </div>
                </button>

                <button className="w-full p-3 hover:bg-zinc-900 rounded-lg transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 text-white text-base">
                      CH
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base text-white leading-[24px] truncate">Product Designer</h4>
                      <p className="text-sm text-zinc-400 leading-[21px] truncate">Carberry & Hanrahan</p>
                    </div>
                  </div>
                </button>
              </div>

              <button className="w-full px-4 py-2 border border-zinc-800 rounded-xl text-sm hover:bg-zinc-900 transition-colors">
                Ver todas as vagas
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
