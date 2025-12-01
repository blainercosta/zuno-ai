import { useState, FormEvent, useRef } from 'react'
import { submitJob } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import Footer from './Footer'

interface PostJobPageProps {
  onBack: () => void;
}

interface FormData {
  company_name: string
  company_url: string
  logo_url: string
  job_title: string
  job_url: string
  location: string
  seniority_level: string
  employment_type: string
  workplace_type: string
  is_remote: boolean
  description_full: string
  about_company: string
  responsibilities: string
  requirements: string
  differentials: string
  benefits: string
  salary: string
  process: string
}

interface FieldErrors {
  [key: string]: string
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
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = (): boolean => {
    const errors: FieldErrors = {}

    // Company name
    if (!formData.company_name.trim()) {
      errors.company_name = 'Nome da empresa é obrigatório'
    } else if (formData.company_name.trim().length < 2) {
      errors.company_name = 'Nome da empresa deve ter pelo menos 2 caracteres'
    }

    // Job title
    if (!formData.job_title.trim()) {
      errors.job_title = 'Título da vaga é obrigatório'
    } else if (formData.job_title.trim().length < 3) {
      errors.job_title = 'Título da vaga deve ter pelo menos 3 caracteres'
    }

    // Job URL
    if (!formData.job_url.trim()) {
      errors.job_url = 'Link para candidatura é obrigatório'
    } else {
      try {
        new URL(formData.job_url)
      } catch {
        errors.job_url = 'Digite uma URL válida (ex: https://exemplo.com)'
      }
    }

    // About company
    if (!formData.about_company.trim()) {
      errors.about_company = 'Descrição da empresa é obrigatória'
    } else if (formData.about_company.trim().length < 10) {
      errors.about_company = 'Descrição da empresa deve ter pelo menos 10 caracteres'
    }

    // Responsibilities
    if (!formData.responsibilities.trim()) {
      errors.responsibilities = 'Responsabilidades são obrigatórias'
    } else if (formData.responsibilities.trim().length < 10) {
      errors.responsibilities = 'Responsabilidades devem ter pelo menos 10 caracteres'
    }

    // Requirements
    if (!formData.requirements.trim()) {
      errors.requirements = 'Requisitos são obrigatórios'
    } else if (formData.requirements.trim().length < 10) {
      errors.requirements = 'Requisitos devem ter pelo menos 10 caracteres'
    }

    // Optional URL validations
    if (formData.company_url.trim()) {
      try {
        new URL(formData.company_url)
      } catch {
        errors.company_url = 'Digite uma URL válida (ex: https://exemplo.com)'
      }
    }

    if (formData.logo_url.trim()) {
      try {
        new URL(formData.logo_url)
      } catch {
        errors.logo_url = 'Digite uma URL válida para o logo'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFieldErrors(prev => ({ ...prev, logo_url: 'Selecione uma imagem válida (PNG, JPG, etc)' }))
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, logo_url: 'Imagem deve ter no máximo 2MB' }))
      return
    }

    setIsUploading(true)
    setFieldErrors(prev => ({ ...prev, logo_url: '' }))

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `logos/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      setFieldErrors(prev => ({ ...prev, logo_url: 'Erro ao enviar imagem. Tente novamente.' }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Corrija os erros nos campos destacados' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
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

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const inputClassName = (fieldName: string) =>
    `w-full px-4 py-3 bg-transparent border rounded-xl text-[15px] text-white placeholder:text-zinc-500 focus:outline-none transition-colors ${
      fieldErrors[fieldName]
        ? 'border-red-500 focus:border-red-400'
        : 'border-zinc-800 focus:border-zinc-700'
    }`

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="flex items-center w-full">
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

          <div className="flex-1 flex items-center justify-center min-w-0">
            <div className="p-3">
              <h2 className="text-base">Publicar vaga</h2>
            </div>
          </div>

          <div className="flex-[0_0_auto] min-w-0" style={{ width: '60px' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-16 py-8 md:py-12 lg:py-16 pb-24 md:pb-16">
        <div className="max-w-[752px] mx-auto">
          {!showSuccess ? (
            <>
              <h1 className="text-[28px] md:text-[36px] leading-[1.2] mb-4">Publicar uma vaga</h1>
              <p className="text-[16px] md:text-[18px] leading-[28px] text-zinc-400 mb-8 md:mb-12">
                Preencha os campos abaixo para publicar sua vaga gratuitamente.
              </p>

              {/* Error Message */}
              {message && message.type === 'error' && (
                <div className="mb-8 p-4 rounded-xl border bg-red-950/20 border-red-800 text-red-400">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
                {/* Informações da Empresa */}
                <div className="space-y-5 md:space-y-6">
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
                      className={inputClassName('company_name')}
                      placeholder="Ex: Acme Inc"
                    />
                    {fieldErrors.company_name && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.company_name}</p>
                    )}
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
                      className={inputClassName('company_url')}
                      placeholder="https://exemplo.com"
                    />
                    {fieldErrors.company_url && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.company_url}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Logo da empresa
                    </label>

                    {/* Logo Preview */}
                    {formData.logo_url && (
                      <div className="mb-3 flex items-center gap-3">
                        <div className="size-16 rounded-xl bg-zinc-800 overflow-hidden">
                          <img
                            src={formData.logo_url}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                          className="text-sm text-red-400 hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[15px] text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? 'Enviando...' : 'Enviar imagem'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <span className="text-zinc-500 text-sm self-center">ou</span>
                      <input
                        type="url"
                        name="logo_url"
                        value={formData.logo_url}
                        onChange={handleChange}
                        className={`flex-1 ${inputClassName('logo_url')}`}
                        placeholder="Cole a URL do logo"
                      />
                    </div>
                    {fieldErrors.logo_url && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.logo_url}</p>
                    )}
                    <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                      Envie uma imagem (PNG ou JPG, máx 2MB) ou cole uma URL
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
                      rows={4}
                      className={inputClassName('about_company') + ' resize-none'}
                      placeholder="Descreva sua empresa, missão e cultura..."
                    />
                    {fieldErrors.about_company && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.about_company}</p>
                    )}
                  </div>
                </div>

                {/* Informações da Vaga */}
                <div className="space-y-5 md:space-y-6 pt-8 border-t border-zinc-800">
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
                      className={inputClassName('job_title')}
                      placeholder="Ex: Product Designer Sênior"
                    />
                    {fieldErrors.job_title && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.job_title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Descrição da vaga
                    </label>
                    <textarea
                      name="description_full"
                      value={formData.description_full}
                      onChange={handleChange}
                      rows={4}
                      className={inputClassName('description_full') + ' resize-none'}
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
                        className={inputClassName('location')}
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
                        className={inputClassName('seniority_level') + ' appearance-none cursor-pointer'}
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
                        className={inputClassName('employment_type') + ' appearance-none cursor-pointer'}
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
                        className={inputClassName('workplace_type') + ' appearance-none cursor-pointer'}
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
                      className={inputClassName('salary')}
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
                      rows={4}
                      className={inputClassName('responsibilities') + ' resize-none'}
                      placeholder="Descreva as principais responsabilidades da função..."
                    />
                    {fieldErrors.responsibilities && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.responsibilities}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Requisitos *
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={4}
                      className={inputClassName('requirements') + ' resize-none'}
                      placeholder="Liste os requisitos necessários para a vaga..."
                    />
                    {fieldErrors.requirements && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.requirements}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Diferenciais
                    </label>
                    <textarea
                      name="differentials"
                      value={formData.differentials}
                      onChange={handleChange}
                      rows={3}
                      className={inputClassName('differentials') + ' resize-none'}
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
                      rows={3}
                      className={inputClassName('benefits') + ' resize-none'}
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
                      rows={3}
                      className={inputClassName('process') + ' resize-none'}
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
                      className={inputClassName('job_url')}
                      placeholder="https://linkedin.com/jobs/view/123456"
                    />
                    {fieldErrors.job_url && (
                      <p className="mt-2 text-sm text-red-400">{fieldErrors.job_url}</p>
                    )}
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
                    disabled={isSubmitting || isUploading}
                    className="order-1 sm:order-2 flex-1 bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Publicando...' : 'Publicar vaga gratuitamente'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            // Success View
            <div className="flex flex-col items-center justify-center py-16 md:py-24">
              <div className="size-20 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="size-10 text-emerald-400" fill="none" viewBox="0 0 24 24">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3 text-center">
                Vaga enviada com sucesso!
              </h3>
              <p className="text-base text-zinc-400 text-center mb-6 max-w-md">
                Sua vaga foi enviada para aprovação e em breve estará disponível na plataforma.
              </p>

              <p className="text-sm text-zinc-500 text-center">
                Redirecionando em alguns segundos...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
