import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Gerar job_id único baseado no timestamp
      const job_id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { data, error } = await supabase
        .from('vagas_ia')
        .insert([{
          job_id,
          job_url: formData.job_url,
          job_title: formData.job_title,
          company_name: formData.company_name,
          company_url: formData.company_url || null,
          company_id: null, // Pode ser preenchido depois se necessário
          logo_url: formData.logo_url || null,
          location: formData.location || null,
          posted_at: new Date().toISOString(),
          seniority_level: formData.seniority_level || null,
          employment_type: formData.employment_type || null,
          workplace_type: formData.workplace_type || null,
          is_remote: formData.is_remote,
          is_easy_apply: false,
          description_full: formData.description_full || null,
          about_company: formData.about_company || null,
          responsibilities: formData.responsibilities || null,
          requirements: formData.requirements || null,
          differentials: formData.differentials || null,
          benefits: formData.benefits || null,
          salary: formData.salary || null,
          process: formData.process || null,
          status: 'active'
        }])
        .select()

      if (error) throw error

      setMessage({ type: 'success', text: 'Vaga publicada com sucesso!' })

      // Limpar formulário após 2 segundos e voltar
      setTimeout(() => {
        onBack()
      }, 2000)

    } catch (error: any) {
      console.error('Erro ao publicar vaga:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao publicar vaga. Tente novamente.'
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
    <div className="flex min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-16 h-[72px]">
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
            <h2 className="text-base absolute left-1/2 -translate-x-1/2">Publicar vaga</h2>

            {/* Spacer */}
            <div className="size-10"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
          <div className="max-w-[752px] mx-auto">
            <h1 className="text-[30px] leading-[36px] mb-2">Publicar uma vaga</h1>
            <p className="text-[16px] leading-[24px] text-zinc-400 mb-12">
              Preencha os campos abaixo para publicar sua vaga gratuitamente.
            </p>

            {/* Message */}
            {message && (
              <div className={`mb-8 p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-green-950/20 border-green-800 text-green-400'
                  : 'bg-red-950/20 border-red-800 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Informações da Empresa */}
              <div className="space-y-6">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações da empresa</h3>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Nome da empresa *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: Acme Inc"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Website da empresa
                  </label>
                  <input
                    type="url"
                    name="company_url"
                    value={formData.company_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    URL do logo da empresa
                  </label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                    Cole a URL de uma imagem hospedada (PNG ou JPG)
                  </p>
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Sobre a empresa *
                  </label>
                  <textarea
                    name="about_company"
                    value={formData.about_company}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva sua empresa, missão e cultura..."
                  />
                </div>
              </div>

              {/* Informações da Vaga */}
              <div className="space-y-6 pt-8 border-t border-zinc-800">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações da vaga</h3>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Título da vaga *
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: Product Designer Sênior"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Descrição completa da vaga
                  </label>
                  <textarea
                    name="description_full"
                    value={formData.description_full}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descrição geral da vaga..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Nível de senioridade
                    </label>
                    <select
                      name="seniority_level"
                      value={formData.seniority_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
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
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Tipo de emprego
                    </label>
                    <select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
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
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Tipo de local de trabalho
                    </label>
                    <select
                      name="workplace_type"
                      value={formData.workplace_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer"
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
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Salário
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: R$ 10.000 - 15.000 / mês"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Responsabilidades *
                  </label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva as principais responsabilidades da função..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Requisitos *
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Liste os requisitos necessários para a vaga..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Diferenciais
                  </label>
                  <textarea
                    name="differentials"
                    value={formData.differentials}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Liste os diferenciais que seriam um plus..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Benefícios
                  </label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva os benefícios oferecidos..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Processo seletivo
                  </label>
                  <textarea
                    name="process"
                    value={formData.process}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva as etapas do processo seletivo..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Link para candidatura *
                  </label>
                  <input
                    type="url"
                    name="job_url"
                    value={formData.job_url}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://linkedin.com/jobs/view/123456"
                  />
                  <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                    Cole o link onde os candidatos devem se inscrever (LinkedIn, site da empresa, etc)
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-8">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="order-2 sm:order-1 px-6 py-3 border border-zinc-800 rounded-xl text-[15px] leading-[15px] hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="order-1 sm:order-2 flex-1 bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar vaga gratuitamente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
