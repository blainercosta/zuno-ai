import svgPaths from "../imports/svg-h8b310i3fd";
import svgPathsPhantom from "../imports/svg-hi6hpjx1gr";

// Placeholder image
const imgYuzu = "https://placehold.co/200x200/1a1a1a/808080?text=Yuzu";

interface JobsPageProps {
  onJobClick: () => void;
  onPostJobClick: () => void;
}

const JOBS_DATA = [
  {
    id: 1,
    title: "Designer",
    company: "Yuzu",
    location: "New York, NY",
    type: "Full-time",
    level: "Mid Level",
    salary: "$ 120,000 - 180,000 / year",
    posted: "há 1 mês",
    logo: imgYuzu,
    logoType: "image"
  },
  {
    id: 2,
    title: "Staff Product Designer",
    company: "Phantom",
    location: "United States",
    type: "Remote · Full-time",
    level: "Senior",
    salary: "$ 215,000 - 250,000 / year",
    posted: "há 2 meses",
    logoColor: "#AB9FF2",
    logoType: "svg"
  },
  {
    id: 3,
    title: "Product Designer",
    company: "Carberry & Hanrahan",
    location: "San Francisco, CA",
    type: "Full-time",
    level: "Mid Level",
    salary: "$ 140,000 - 190,000 / year",
    posted: "há 2 meses",
    logoType: "initials",
    initials: "CH",
    logoColor: "#10b981"
  },
  {
    id: 4,
    title: "Brand Designer",
    company: "Titan",
    location: "Remote",
    type: "Full-time",
    level: "Junior",
    salary: "$ 80,000 - 110,000 / year",
    posted: "há 3 meses",
    logoType: "initials",
    initials: "T",
    logoColor: "#ef4444"
  }
];

export default function JobsPage({ onJobClick, onPostJobClick }: JobsPageProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="max-w-[968px] mx-auto px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="text-center">
          <h1 className="text-[32px] sm:text-[48px] leading-[1.2] mb-6 sm:mb-8">
            Vagas de IA para profissionais<br />
            no Brasil
          </h1>

          <p className="text-[16px] sm:text-[18px] leading-[28px] text-zinc-400 mb-8 sm:mb-10 max-w-[480px] mx-auto">
            Empresas verificadas. Salários transparentes.<br />
            Oportunidades reais em IA.
          </p>

          <button
            onClick={onPostJobClick}
            className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] mb-12 sm:mb-16"
          >
            Publicar vaga grátis
          </button>

          <div className="flex flex-col items-center gap-4">
            <p className="text-[15px] leading-[22.5px] text-zinc-400">Contrataram aqui</p>
            <div className="flex items-center gap-6 sm:gap-8">
              {/* Whop Logo */}
              <svg className="h-[22px] w-auto" fill="none" viewBox="0 0 105 23">
                <path d={svgPaths.p1ed0a600} fill="#71717A" />
              </svg>
              
              {/* Attio Logo */}
              <svg className="h-[24px] w-auto" fill="none" viewBox="0 0 96 24">
                <path d="M3.9456 0H0V3.948H3.9456V0Z" fill="#71717A" />
                <path clipRule="evenodd" d={svgPaths.p190cfc80} fill="#71717A" fillRule="evenodd" />
                <path d={svgPaths.p32995a00} fill="#71717A" />
                <path clipRule="evenodd" d={svgPaths.p3c9d3100} fill="#71717A" fillRule="evenodd" />
                <path d={svgPaths.p2571ed00} fill="#71717A" />
              </svg>
              
              {/* Lindy Logo */}
              <svg className="h-[22px] w-auto" fill="none" viewBox="0 0 84 22">
                <path d={svgPaths.p25988cb0} fill="#71717A" />
                <path d={svgPaths.p15dfb670} fill="#71717A" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-[895px] mx-auto px-4 pb-16">
        <div className="space-y-4">
          {JOBS_DATA.map((job) => (
            <article
              key={job.id}
              onClick={onJobClick}
              className="border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                {/* Logo - 48px square with 0.75rem border-radius */}
                <div className="shrink-0">
                  {job.logoType === "image" ? (
                    <div className="size-12 rounded-xl bg-zinc-800 overflow-hidden">
                      <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    </div>
                  ) : job.logoType === "svg" ? (
                    <div className="size-12 rounded-xl overflow-hidden">
                      <svg className="size-full" fill="none" viewBox="0 0 48 48">
                        <rect width="48" height="48" fill={job.logoColor} />
                        <path clipRule="evenodd" d={svgPathsPhantom.p1c3a6e00} fill="#FFFDF8" fillRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: job.logoColor }}
                    >
                      <span className="text-base">{job.initials}</span>
                    </div>
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] leading-[18px] text-white mb-3">{job.title}</h3>
                  <div className="flex items-center gap-2 text-[14px] leading-[20px]">
                    <span className="text-zinc-300">{job.company}</span>
                    <span className="text-zinc-500">
                      · {job.location} · {job.type} · {job.level} · {job.salary}
                    </span>
                  </div>
                </div>

                {/* Posted & Apply */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <span className="text-[12px] leading-[16px] text-zinc-500">{job.posted}</span>
                  <button
                    className="bg-white text-slate-950 px-4 py-2.5 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[14px] leading-[14px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle apply action
                    }}
                  >
                    Candidatar
                  </button>
                </div>

                {/* Mobile Apply Button */}
                <div className="sm:hidden shrink-0">
                  <button
                    className="bg-white text-slate-950 px-4 py-2.5 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[14px] leading-[14px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle apply action
                    }}
                  >
                    Candidatar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
