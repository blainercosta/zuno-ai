import { useState, FormEvent, useEffect } from 'react'
import { submitJob } from '@/lib/api'

interface PostJobPageProps {
  onBack: () => void;
}

interface FormData {
  // Company info
  company_name: string
  company_url: string
  logo_url: string

  // Job info
  job_title: string
  job_url: string
  location: string
  seniority_level: string
  employment_type: string
  workplace_type: string
  is_remote: boolean

  // Job details
  description_full: string
  about_company: string
  responsibilities: string
  requirements: string
  differentials: string
  benefits: string
  salary: string
  process: string
}

export default function PostJobPage({ onBack }: PostJobPageProps) {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    company_url: '',
    logo_url: '',
    job_title: '',
    job_url: '',
    location: '',
    seniority_level: '',
    employment_type: '',
    workplace_type: '',
    is_remote: false,
    description_full: '',
    about_company: '',
    responsibilities: '',
    requirements: '',
    differentials: '',
    benefits: '',
    salary: '',
    process: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Usar Edge Function segura para submeter a vaga
      const result = await submitJob({
        job_url: formData.job_url,
        job_title: formData.job_title,
        company_name: formData.company_name,
        company_url: formData.company_url || undefined,
        logo_url: formData.logo_url || undefined,
        location: formData.location || undefined,
        seniority_level: formData.seniority_level || undefined,
        employment_type: formData.employment_type || undefined,
        workplace_type: formData.workplace_type || undefined,
        is_remote: formData.is_remote,
        description_full: formData.description_full || undefined,
        about_company: formData.about_company || undefined,
        responsibilities: formData.responsibilities || undefined,
        requirements: formData.requirements || undefined,
        differentials: formData.differentials || undefined,
        benefits: formData.benefits || undefined,
        salary: formData.salary || undefined,
        process: formData.process || undefined,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setShowSuccess(true)
      setMessage({ type: 'success', text: 'Vaga enviada para aprovação!' })

      // Voltar após 3 segundos
      setTimeout(() => {
        onBack()
      }, 3000)

    } catch (error: unknown) {
      console.error('Erro ao publicar vaga:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao publicar vaga. Tente novamente.'
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onBack}
      />

      {/* Modal Container with slide-up animation */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-full md:w-auto md:max-w-4xl md:mx-4 bg-zinc-950 md:rounded-2xl overflow-hidden animate-slideUp md:animate-scaleIn flex flex-col max-h-screen"
          onClick={(e) => e.stopPropagation()}
        >
          {!showSuccess ? (
            // Form View
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 sm:px-6 lg:px-16 h-[60px] md:h-[72px]">
                  {/* Drag Handle - Mobile Only */}
                  <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-700 rounded-full"></div>

                  {/* Back Button */}
                  <button
                    onClick={onBack}
                    className="size-10 flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="size-6" fill="none" viewBox="0 0 24 24">
                      <path d="M15 19L8 12L15 5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>

                  {/* Title */}
                  <h2 className="text-sm md:text-base absolute left-1/2 -translate-x-1/2">Publicar vaga</h2>

                  {/* Spacer */}
                  <div className="size-10"></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 sm:px-6 lg:px-16 py-6 md:py-8 lg:py-16 overflow-y-auto">
                <div className="max-w-[752px] mx-auto">
                  <h1 className="text-[24px] md:text-[30px] leading-[30px] md:leading-[36px] mb-2">Publicar uma vaga</h1>
                  <p className="text-[14px] md:text-[16px] leading-[21px] md:leading-[24px] text-zinc-400 mb-8 md:mb-12">
                    Preencha os campos abaixo para publicar sua vaga gratuitamente.
                  </p>

                  {/* Message */}
                  {message && message.type === 'error' && (
                    <div className="mb-8 p-4 rounded-xl border bg-red-950/20 border-red-800 text-red-400">
                      {message.text}
                    </div>
                  )}

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
              {/* Informações da Empresa */}
              <div className="space-y-5 md:space-y-6">
                <h3 className="text-[18px] md:text-[20px] leading-[27px] md:leading-[30px] text-slate-50">Informações da empresa</h3>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Nome da empresa *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: Acme Inc"
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Website da empresa
                  </label>
                  <input
                    type="url"
                    name="company_url"
                    value={formData.company_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    URL do logo da empresa
                  </label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <p className="text-[13px] md:text-[12px] leading-[19px] md:leading-[18px] text-zinc-500 mt-2">
                    Cole a URL de uma imagem hospedada (PNG ou JPG)
                  </p>
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Sobre a empresa *
                  </label>
                  <textarea
                    name="about_company"
                    value={formData.about_company}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva sua empresa, missão e cultura..."
                  />
                </div>
              </div>

              {/* Informações da Vaga */}
              <div className="space-y-5 md:space-y-6 pt-6 md:pt-8 border-t border-zinc-800">
                <h3 className="text-[18px] md:text-[20px] leading-[27px] md:leading-[30px] text-slate-50">Informações da vaga</h3>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Título da vaga *
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: Product Designer Sênior"
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Descrição completa da vaga
                  </label>
                  <textarea
                    name="description_full"
                    value={formData.description_full}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descrição geral da vaga..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                      Nível de senioridade
                    </label>
                    <select
                      name="seniority_level"
                      value={formData.seniority_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900">Selecione</option>
                      <option value="Júnior" className="bg-zinc-900">Júnior</option>
                      <option value="Pleno" className="bg-zinc-900">Pleno</option>
                      <option value="Sênior" className="bg-zinc-900">Sênior</option>
                      <option value="Lead" className="bg-zinc-900">Lead</option>
                      <option value="Principal" className="bg-zinc-900">Principal</option>
                      <option value="Staff" className="bg-zinc-900">Staff</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                      Tipo de emprego
                    </label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900">Selecione</option>
                      <option value="Tempo integral" className="bg-zinc-900">Tempo integral</option>
                      <option value="Meio período" className="bg-zinc-900">Meio período</option>
                      <option value="Contrato" className="bg-zinc-900">Contrato</option>
                      <option value="Freelance" className="bg-zinc-900">Freelance</option>
                      <option value="Estágio" className="bg-zinc-900">Estágio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                      Tipo de local de trabalho
                    </label>
                    <select
                      name="workplace_type"
                      value={formData.workplace_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-zinc-900">Selecione</option>
                      <option value="Remoto" className="bg-zinc-900">Remoto</option>
                      <option value="Presencial" className="bg-zinc-900">Presencial</option>
                      <option value="Híbrido" className="bg-zinc-900">Híbrido</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[14px] leading-[21px] text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_remote"
                      checked={formData.is_remote}
                      onChange={handleChange}
                      className="size-4 rounded border-zinc-800 bg-transparent"
                    />
                    Vaga 100% remota
                  </label>
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Salário
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: R$ 10.000 - 15.000 / mês"
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Responsabilidades *
                  </label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva as principais responsabilidades da função..."
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Requisitos *
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Liste os requisitos necessários para a vaga..."
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Diferenciais
                  </label>
                  <textarea
                    name="differentials"
                    value={formData.differentials}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Liste os diferenciais que seriam um plus..."
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Benefícios
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva os benefícios oferecidos..."
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Processo seletivo
                  </label>
                  <textarea
                    name="process"
                    value={formData.process}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva as etapas do processo seletivo..."
                  />
                </div>

                <div>
                  <label className="block text-[15px] md:text-[14px] leading-[22px] md:leading-[21px] mb-2.5 md:mb-2 text-zinc-300">
                    Link para candidatura *
                  </label>
                  <input
                    type="url"
                    name="job_url"
                    value={formData.job_url}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 md:py-3 bg-transparent border border-zinc-800 rounded-xl text-[16px] md:text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://linkedin.com/jobs/view/123456"
                  />
                  <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                    Cole o link onde os candidatos devem se inscrever (LinkedIn, site da empresa, etc)
                  </p>
                </div>
              </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 md:pt-8">
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={isSubmitting}
                      className="order-2 sm:order-1 px-6 py-3.5 md:py-3 border border-zinc-800 rounded-xl text-[16px] md:text-[15px] leading-[16px] md:leading-[15px] hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="order-1 sm:order-2 flex-1 bg-white text-slate-950 px-6 py-3.5 md:py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[16px] md:text-[15px] leading-[16px] md:leading-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Publicando...' : 'Publicar vaga gratuitamente'}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </div>
          ) : (
            // Success View
            <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 min-h-[400px]">
              {/* Success Icon */}
              <div className="size-16 md:size-20 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="size-8 md:size-10 text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Success Message */}
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 text-center">
                Vaga publicada com sucesso!
              </h3>
              <p className="text-sm md:text-base text-zinc-400 text-center mb-6">
                Sua vaga foi publicada e já está disponível na plataforma.
              </p>

              {/* Auto-close message */}
              <p className="text-xs text-zinc-500 text-center">
                Redirecionando em alguns segundos...
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
