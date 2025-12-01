import { Mail, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { useSimilarJobs } from "@/hooks/useSimilarJobs";
import type { Job } from "@/types/job";
import Footer from "./Footer";
import JobStructuredData from "./JobStructuredData";
import {
  getJobApplicationUrl,
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
  getLinkedInShareUrl,
  getJobShareUrl
} from "@/utils/tracking";
import { SimilarJobsListSkeleton } from "./Skeleton";

interface JobDetailPageProps {
  onBack: () => void;
  onJobClick: (job: Job) => void;
  job: Job | null;
}

export default function JobDetailPage({ onBack, onJobClick, job }: JobDetailPageProps) {
  const { similarJobs, isLoading: loadingSimilar } = useSimilarJobs(job, 3);

  // Gera a URL compartilhável para esta vaga
  const jobUrl = job ? getJobShareUrl(job.job_id) : ''

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">Vaga não encontrada</p>
      </div>
    );
  }
  return (
    <>
      {/* Structured Data para SEO */}
      <JobStructuredData job={job} />

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
              <h1 className="text-[30px] leading-[36px] mb-8">{job.job_title}</h1>

              {/* Description */}
              {job.description_full && (
                <div className="mb-8">
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.description_full}
                  </div>
                </div>
              )}

              {/* About Company Section */}
              {job.about_company && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6">Sobre a empresa</h3>
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.about_company}
                  </div>
                </div>
              )}

              {/* Responsibilities Section */}
              {job.responsibilities && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Responsabilidades</h3>
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {/* Requirements Section */}
              {job.requirements && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Requisitos</h3>
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Differentials Section */}
              {job.differentials && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Diferenciais</h3>
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.differentials}
                  </div>
                </div>
              )}

              {/* Benefits Section */}
              {job.benefits && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Benefícios</h3>
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.benefits}
                  </div>
                </div>
              )}

              {/* Salary Section */}
              {job.salary && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Remuneração</h3>
                  <p className="text-zinc-400 leading-[24px]">
                    {job.salary}
                  </p>
                </div>
              )}

              {/* Process Section */}
              {job.process && (
                <div className="mb-8">
                  <h3 className="text-[20px] leading-[30px] text-slate-50 mb-6 pt-2">Processo seletivo</h3>
                  <div className="text-zinc-400 leading-[24px] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere' }}>
                    {job.process}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <button
                onClick={() => window.open(getJobApplicationUrl(job.job_url, job.job_id), '_blank')}
                className="bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors mb-8"
              >
                Candidatar-se
              </button>

              {/* Posted Date */}
              {job.posted_at && (
                <div className="border-t border-zinc-800 pt-16">
                  <p className="text-sm text-zinc-500 leading-[21px]">Publicada em {new Date(job.posted_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-zinc-800">
            {/* Company Info */}
            <div className="px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <div className="flex items-start gap-3 mb-6">
                {job.logo_url ? (
                  <div className="size-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                    <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="size-12 rounded-xl flex items-center justify-center bg-zinc-800 text-white shrink-0">
                    <span className="text-base">{job.company_name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base leading-[24px] mb-0.5">{job.company_name}</h3>
                  <p className="text-sm text-slate-400 leading-[21px]">{job.location}</p>
                </div>
              </div>
              <button
                onClick={() => window.open(getJobApplicationUrl(job.job_url, job.job_id), '_blank')}
                className="w-full bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors"
              >
                Candidatar-se
              </button>
            </div>

            {/* Share */}
            <div className="border-t border-zinc-800 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <h3 className="text-base leading-[24px] mb-4">Compartilhar vaga</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => window.open(getTwitterShareUrl(job.job_title, job.company_name, jobUrl), '_blank')}
                  className="text-zinc-600 hover:text-white transition-colors"
                  title="Compartilhar no X"
                >
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button
                  onClick={() => window.open(getWhatsAppShareUrl(job.job_title, job.company_name, jobUrl), '_blank')}
                  className="text-zinc-600 hover:text-white transition-colors"
                  title="Compartilhar no WhatsApp"
                >
                  <Mail className="size-5" />
                </button>
                <button
                  onClick={() => window.open(getFacebookShareUrl(jobUrl), '_blank')}
                  className="text-zinc-600 hover:text-white transition-colors"
                  title="Compartilhar no Facebook"
                >
                  <Facebook className="size-5" />
                </button>
                <button
                  onClick={() => window.open(getLinkedInShareUrl(jobUrl, job.job_title), '_blank')}
                  className="text-zinc-600 hover:text-white transition-colors"
                  title="Compartilhar no LinkedIn"
                >
                  <Linkedin className="size-5" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${jobUrl}?utm_source=direct&utm_medium=share&utm_campaign=zuno`)
                    alert('Link copiado! Compartilhe a vaga do Zuno AI 🤖')
                  }}
                  className="text-zinc-600 hover:text-white transition-colors"
                  title="Copiar link"
                >
                  <LinkIcon className="size-5" />
                </button>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="border-t border-zinc-800 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
              <h3 className="text-base leading-[24px] mb-4">Vagas similares</h3>

              {loadingSimilar ? (
                <SimilarJobsListSkeleton count={3} />
              ) : similarJobs.length > 0 ? (
                <div className="space-y-0 mb-6">
                  {similarJobs.map((similarJob) => (
                    <button
                      key={similarJob.id}
                      onClick={() => onJobClick(similarJob)}
                      className="w-full p-3 hover:bg-zinc-900 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {similarJob.logo_url ? (
                          <div className="size-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                            <img src={similarJob.logo_url} alt={similarJob.company_name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="size-12 rounded-xl flex items-center justify-center bg-zinc-800 text-white shrink-0">
                            <span className="text-base">{similarJob.company_name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base text-white leading-[24px] truncate">{similarJob.job_title}</h4>
                          <div className="flex items-center gap-2 text-sm text-zinc-400 leading-[21px]">
                            <span>{similarJob.company_name}</span>
                            {similarJob.location && (
                              <>
                                <span>·</span>
                                <span className="truncate">{similarJob.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 py-4">Nenhuma vaga similar encontrada</p>
              )}

              <button
                onClick={onBack}
                className="w-full px-4 py-2 border border-zinc-800 rounded-xl text-sm hover:bg-zinc-900 transition-colors"
              >
                Ver todas as vagas
              </button>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
    </>
  );
}
