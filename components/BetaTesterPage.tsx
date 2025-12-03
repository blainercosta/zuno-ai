import { useState } from 'react';
import { SUBSCRIBER_NICHES } from '@/types/subscriber';

// Supabase config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação
const validators = {
  name: (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (trimmed.length > 100) return 'Nome muito longo';
    return null;
  },
  email: (value: string) => {
    const trimmed = value.trim().toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(trimmed)) return 'Email inválido';
    return null;
  },
  instagram: (value: string) => {
    const cleaned = value.trim().replace('@', '').toLowerCase();
    if (cleaned.length < 2) return 'Instagram deve ter pelo menos 2 caracteres';
    if (cleaned.length > 30) return 'Instagram muito longo';
    if (!/^[a-z0-9._]+$/.test(cleaned)) return 'Instagram contém caracteres inválidos';
    return null;
  },
  whatsapp: (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) return 'WhatsApp deve ter pelo menos 10 dígitos';
    if (digits.length > 13) return 'WhatsApp muito longo';
    return null;
  },
  niche: (value: string) => {
    if (!value) return 'Selecione um nicho';
    if (value.trim().length < 2) return 'Nicho deve ter pelo menos 2 caracteres';
    if (value.trim().length > 50) return 'Nicho muito longo';
    return null;
  },
};

// Formatação de WhatsApp
function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function BetaTesterPage() {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    instagram: '',
    whatsapp: '',
    nicho: '',
    nichoCustom: '',
  });
  const [showCustomNiche, setShowCustomNiche] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validateField = (field: keyof typeof formData) => {
    const validatorKey = field === 'nome' ? 'name' : field === 'nicho' || field === 'nichoCustom' ? 'niche' : field;
    const validator = validators[validatorKey as keyof typeof validators];
    if (!validator) return true;
    const error = validator(formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !validators.name(formData.nome);
      case 2: return !validators.email(formData.email);
      case 3: return !validators.instagram(formData.instagram);
      case 4: return !validators.whatsapp(formData.whatsapp);
      case 5: {
        if (showCustomNiche) {
          return !validators.niche(formData.nichoCustom);
        }
        return formData.nicho !== '' && formData.nicho !== 'Outro';
      }
      default: return true;
    }
  };

  const handleNext = () => {
    if (step === 5) {
      if (showCustomNiche) {
        const error = validators.niche(formData.nichoCustom);
        if (error) {
          setErrors((prev) => ({ ...prev, nichoCustom: error }));
          return;
        }
      }
      setStep(step + 1);
      return;
    }

    const fieldMap: Record<number, keyof typeof formData> = {
      1: 'nome',
      2: 'email',
      3: 'instagram',
      4: 'whatsapp',
    };
    const field = fieldMap[step];
    if (field && validateField(field)) {
      setStep(step + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid()) {
      e.preventDefault();
      handleNext();
    }
  };

  const saveSubscriber = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          instagram: formData.instagram.trim().replace('@', '').toLowerCase(),
          whatsapp: formData.whatsapp.trim(),
          niche: showCustomNiche ? formData.nichoCustom.trim() : formData.nicho,
          source: 'beta_tester', // Different source for beta testers
          utm_source: urlParams.get('utm_source') || 'beta',
          utm_medium: urlParams.get('utm_medium') || null,
          utm_campaign: urlParams.get('utm_campaign') || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.code === 'DUPLICATE') {
          setSaveError(result.error);
        } else if (result.errors) {
          const firstError = Object.values(result.errors)[0] as string;
          setSaveError(firstError);
        } else {
          console.error('API error:', result);
          setSaveError(result.error || 'Erro ao salvar. Tente novamente.');
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Erro de conexão. Tente novamente.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getNicho = () => showCustomNiche ? formData.nichoCustom.trim() : formData.nicho;

  const handleFinish = async () => {
    const saved = await saveSubscriber();
    if (!saved) return;

    const message = encodeURIComponent(
      `Oi! Sou beta tester do Zuno AI.\n\n` +
      `Nome: ${formData.nome}\n` +
      `Email: ${formData.email}\n` +
      `Instagram: @${formData.instagram.replace('@', '')}\n` +
      `WhatsApp: ${formData.whatsapp}\n` +
      `Nicho: ${getNicho()}`
    );

    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  // Tela final de sucesso (step 6)
  if (step === 6) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mb-6 inline-flex">
              <div className="size-20 rounded-2xl bg-[#62D4DD]/10 flex items-center justify-center animate-scaleIn">
                <svg className="size-10 text-[#62D4DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-medium mb-3 tracking-tight">Bem-vindo, {formData.nome}!</h1>
            <p className="text-zinc-400 text-base">
              Seu cadastro de beta tester foi salvo
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="size-8 rounded-lg bg-[#7349D4]/10 flex items-center justify-center shrink-0">
                <svg className="size-4 text-[#7349D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300">Acesso antecipado ao Zuno AI</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="size-8 rounded-lg bg-[#FF7BCA]/10 flex items-center justify-center shrink-0">
                <svg className="size-4 text-[#FF7BCA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300">Notícias de IA em primeira mão</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="size-8 rounded-lg bg-[#62D4DD]/10 flex items-center justify-center shrink-0">
                <svg className="size-4 text-[#62D4DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-300">Sem necessidade de pagamento</p>
            </div>
          </div>

          {saveError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-left">
              <p className="text-red-400 text-sm">{saveError}</p>
            </div>
          )}

          <button
            onClick={handleFinish}
            disabled={isSaving}
            className={`w-full font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
              isSaving
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white hover:bg-zinc-100 text-zinc-950'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin size-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Entrar no grupo de beta
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-600 mt-4">
            Vamos te avisar quando o Zuno estiver pronto
          </p>
        </div>

        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.5s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Steps de onboarding
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col px-6 py-8">
      {/* Header */}
      <div className="max-w-md mx-auto w-full mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#62D4DD]/10 text-[#62D4DD] text-xs font-medium">
          <span className="size-1.5 rounded-full bg-[#62D4DD]" />
          Beta Tester
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto w-full mb-8">
        <div className="flex items-center justify-end mb-3">
          <span className="text-xs text-zinc-500">{step} de 5</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#62D4DD]' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          {/* Step 1: Nome */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-medium mb-2 tracking-tight">Como podemos te chamar?</h2>
              <p className="text-zinc-500 text-base mb-8">
                Seu primeiro nome ou apelido
              </p>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  setErrors({ ...errors, nome: null });
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => validateField('nome')}
                className={`w-full bg-black/40 border rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                  errors.nome ? 'border-red-400/60 focus:border-red-400' : 'border-zinc-800 focus:border-zinc-600'
                }`}
                autoFocus
              />
              {errors.nome && (
                <p className="text-red-400 text-sm mt-3">{errors.nome}</p>
              )}
            </div>
          )}

          {/* Step 2: Email */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-medium mb-2 tracking-tight">Qual seu melhor email?</h2>
              <p className="text-zinc-500 text-base mb-8">
                Para enviar atualizações do beta
              </p>
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: null });
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => validateField('email')}
                className={`w-full bg-black/40 border rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                  errors.email ? 'border-red-400/60 focus:border-red-400' : 'border-zinc-800 focus:border-zinc-600'
                }`}
                autoFocus
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-3">{errors.email}</p>
              )}
            </div>
          )}

          {/* Step 3: Instagram */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-medium mb-2 tracking-tight">Qual seu Instagram?</h2>
              <p className="text-zinc-500 text-base mb-8">
                Para personalizar o conteúdo pro seu perfil
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                <input
                  type="text"
                  placeholder="seuinstagram"
                  value={formData.instagram}
                  onChange={(e) => {
                    setFormData({ ...formData, instagram: e.target.value.replace('@', '') });
                    setErrors({ ...errors, instagram: null });
                  }}
                  onKeyDown={handleKeyDown}
                  onBlur={() => validateField('instagram')}
                  className={`w-full bg-black/40 border rounded-xl pl-9 pr-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                    errors.instagram ? 'border-red-400/60 focus:border-red-400' : 'border-zinc-800 focus:border-zinc-600'
                  }`}
                  autoFocus
                />
              </div>
              {errors.instagram && (
                <p className="text-red-400 text-sm mt-3">{errors.instagram}</p>
              )}
            </div>
          )}

          {/* Step 4: WhatsApp */}
          {step === 4 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-medium mb-2 tracking-tight">Seu WhatsApp</h2>
              <p className="text-zinc-500 text-base mb-8">
                Para te avisar quando o beta estiver pronto
              </p>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => {
                  setFormData({ ...formData, whatsapp: formatWhatsApp(e.target.value) });
                  setErrors({ ...errors, whatsapp: null });
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => validateField('whatsapp')}
                className={`w-full bg-black/40 border rounded-xl px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                  errors.whatsapp ? 'border-red-400/60 focus:border-red-400' : 'border-zinc-800 focus:border-zinc-600'
                }`}
                autoFocus
              />
              {errors.whatsapp && (
                <p className="text-red-400 text-sm mt-3">{errors.whatsapp}</p>
              )}
            </div>
          )}

          {/* Step 5: Nicho */}
          {step === 5 && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-medium mb-2 tracking-tight">Qual seu nicho?</h2>
              <p className="text-zinc-500 text-base mb-8">
                Para enviar só notícias relevantes pra você
              </p>

              <div className="grid grid-cols-2 gap-2">
                {SUBSCRIBER_NICHES.filter(n => n !== 'Outro').map((nicho) => (
                  <button
                    key={nicho}
                    onClick={() => {
                      setFormData({ ...formData, nicho, nichoCustom: '' });
                      setShowCustomNiche(false);
                      setErrors({ ...errors, nicho: null, nichoCustom: null });
                    }}
                    className={`p-4 rounded-xl border text-sm text-left transition-all ${
                      formData.nicho === nicho && !showCustomNiche
                        ? 'bg-[#62D4DD]/10 border-[#62D4DD] text-white'
                        : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {nicho}
                  </button>
                ))}
                {/* Campo Outro - input inline */}
                <div>
                  <input
                    type="text"
                    placeholder="Outro"
                    value={formData.nichoCustom}
                    onChange={(e) => {
                      setFormData({ ...formData, nichoCustom: e.target.value, nicho: '' });
                      setShowCustomNiche(true);
                      setErrors({ ...errors, nichoCustom: null });
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full p-4 rounded-xl border text-sm text-left transition-all ${
                      showCustomNiche && formData.nichoCustom
                        ? 'bg-[#62D4DD]/10 border-[#62D4DD] text-white placeholder:text-zinc-500'
                        : 'bg-black/40 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 hover:border-zinc-700'
                    } focus:outline-none focus:border-[#62D4DD]`}
                  />
                  {errors.nichoCustom && (
                    <p className="text-red-400 text-sm mt-2">{errors.nichoCustom}</p>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Navigation */}
          {step >= 1 && step <= 5 && (
            <div className="mt-10">
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`w-full font-medium py-4 rounded-xl transition-all ${
                  isStepValid()
                    ? 'bg-white text-zinc-950 hover:bg-zinc-100'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {step === 5 ? 'Finalizar cadastro' : 'Continuar'}
              </button>

              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="w-full mt-3 py-3 text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
                >
                  Voltar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
