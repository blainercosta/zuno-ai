import { useRef, useEffect, useState } from 'react';
import { submitWaitlist } from '@/lib/api';

interface BetaAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export default function BetaAccessModal({ isOpen, onClose }: BetaAccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handlePointerMove = (event: PointerEvent) => {
      const modal = modalRef.current;
      if (!modal) return;

      const rect = modal.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const relativeX = event.clientX - centerX;
      const relativeY = event.clientY - centerY;

      const x = relativeX / (rect.width / 2);
      const y = relativeY / (rect.height / 2);

      modal.style.setProperty('--pointer-x', `${x * 50}%`);
      modal.style.setProperty('--pointer-y', `${y * 50}%`);
    };

    document.addEventListener('pointermove', handlePointerMove);
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, [isOpen]);

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return 'Nome deve conter apenas letras';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    // Skip validation in development
    if (import.meta.env.DEV) return undefined;

    if (!email.trim()) return 'Email é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Telefone é obrigatório';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return 'Telefone inválido';
    }
    return undefined;
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let finalValue = value;
    if (field === 'phone') {
      finalValue = formatPhone(value);
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // In development, skip Supabase and just show success
      if (import.meta.env.DEV) {
        console.log('Development mode: Skipping Supabase insert', {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: cleanPhone,
        });
        setShowSuccess(true);
        setFormData({ name: '', email: '', phone: '' });
        return;
      }

      const result = await submitWaitlist({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhone,
      });

      if (result.error) {
        console.error('Waitlist API error:', result.error);
        if (result.error.includes('já está cadastrado') || result.error.includes('duplicate')) {
          setErrors({ email: 'Este email já está cadastrado' });
          return;
        }
        throw new Error(result.error);
      }

      console.log('Beta waitlist signup successful:', result);
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ email: 'Erro ao cadastrar. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state first
    setFormData({ name: '', email: '', phone: '' });
    setErrors({});

    // If success is shown, wait for flip animation before closing
    if (showSuccess) {
      setShowSuccess(false);
      // Wait a bit for flip animation, then close
      setTimeout(() => {
        onClose();
      }, 100);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center p-0 md:p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={handleClose}
    >
      <style>{`
        .zuno-gradient {
          position: relative;
          width: 480px;
          height: 480px;
          border-radius: 40px;
        }

        .zuno-gradient::before,
        .zuno-gradient::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 40px;
          background: conic-gradient(
            from var(--angle),
            #7349D4,
            #FF7BCA,
            #FFF96F,
            #62D4DD,
            #7349D4
          );
          animation: rotate 3s linear infinite;
          pointer-events: none;
        }

        .zuno-gradient::after {
          filter: blur(15px);
          opacity: 0.4;
        }

        .zuno-gradient .card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 39px;
          background: radial-gradient(
            800px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.06) 30%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          z-index: 1;
        }

        .zuno-gradient:hover .card-inner::before {
          opacity: 1;
        }

        .zuno-gradient .card-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 39px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.03) 0%,
              transparent 50%,
              rgba(255, 255, 255, 0.02) 100%
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.01) 0px,
              transparent 2px,
              transparent 4px
            );
          backdrop-filter: blur(1px);
          pointer-events: none;
          z-index: 0;
        }

        .zuno-gradient .card-inner > * {
          position: relative;
          z-index: 2;
        }

        @media (max-width: 768px) {
          .zuno-gradient {
            width: 100%;
            max-width: 100vw;
            height: auto;
            min-height: auto;
            border-radius: 24px 24px 0 0;
            background: conic-gradient(
              from var(--angle),
              #7349D4,
              #FF7BCA,
              #FFF96F,
              #62D4DD,
              #7349D4
            );
          }

          .zuno-gradient::before,
          .zuno-gradient::after {
            border-radius: 24px 24px 0 0;
          }

          .zuno-gradient .card-inner {
            border-radius: 23px 23px 0 0 !important;
          }
        }

        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
          }
        }

        .success-card {
          width: 480px;
          height: 480px;
          border-radius: 40px;
          background: #0a0a0a;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .success-card::before,
        .success-card::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 40px;
          background: conic-gradient(
            from var(--angle),
            #7349D4,
            #FF7BCA,
            #FFF96F,
            #62D4DD,
            #7349D4
          );
          animation: rotate 3s linear infinite;
        }

        .success-card::after {
          filter: blur(15px);
          opacity: 0.4;
        }

        .success-card .card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 39px;
          background: radial-gradient(
            800px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.06) 30%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          z-index: 1;
        }

        .success-card:hover .card-inner::before {
          opacity: 1;
        }

        .success-card .card-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 39px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.03) 0%,
              transparent 50%,
              rgba(255, 255, 255, 0.02) 100%
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.01) 0px,
              transparent 2px,
              transparent 4px
            );
          backdrop-filter: blur(1px);
          pointer-events: none;
          z-index: 0;
        }

        .success-card .card-inner > * {
          position: relative;
          z-index: 2;
        }

        @media (max-width: 768px) {
          .success-card {
            width: 100%;
            max-width: 100vw;
            height: auto;
            min-height: auto;
            border-radius: 24px 24px 0 0;
            background: conic-gradient(
              from var(--angle),
              #7349D4,
              #FF7BCA,
              #FFF96F,
              #62D4DD,
              #7349D4
            );
          }

          .success-card::before,
          .success-card::after {
            border-radius: 24px 24px 0 0;
          }

          .success-card .card-inner {
            border-radius: 23px 23px 0 0 !important;
          }
        }

        .modal-container {
          width: 480px;
          height: 480px;
          perspective: 2000px;
          position: relative;
        }

        .modal-flipper {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-flipper.flipped {
          transform: rotateY(180deg);
        }

        .modal-front,
        .modal-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .modal-back {
          transform: rotateY(180deg);
        }

        @media (max-width: 768px) {
          .modal-container {
            width: 100%;
            max-width: 100vw;
            height: auto;
            min-height: auto;
            perspective: none;
          }

          .modal-flipper {
            transform-style: flat;
            height: auto;
          }

          .modal-flipper.flipped {
            transform: none;
          }

          .modal-front,
          .modal-back {
            position: relative;
            backface-visibility: visible;
            -webkit-backface-visibility: visible;
            height: auto;
          }

          .modal-back {
            transform: none;
            display: none;
          }

          .modal-flipper.flipped .modal-front {
            display: none;
          }

          .modal-flipper.flipped .modal-back {
            display: block;
          }

          .zuno-gradient,
          .success-card {
            padding: 1px;
          }

          .zuno-gradient .card-inner,
          .success-card .card-inner {
            position: relative !important;
            inset: auto !important;
            padding-bottom: 24px !important;
          }
        }

        .drag-handle {
          width: 40px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          margin: 0 auto 16px;
        }

        @media (min-width: 769px) {
          .drag-handle {
            display: none;
          }
        }
      `}</style>

      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-flipper ${showSuccess ? 'flipped' : ''}`}>
          {/* Front - Form */}
          <div className="modal-front">
            <div
              ref={modalRef}
              className="zuno-gradient relative overflow-hidden"
            >
              <div className="card-inner absolute inset-[1px] bg-[#0a0a0a] rounded-t-[23px] md:rounded-[39px] z-10 flex flex-col justify-center p-6 pt-4 md:p-[76px]">
                <div className="drag-handle"></div>

                <div className="mb-4 md:mb-8 text-center relative z-10">
                  <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div className="flex-1"></div>
                    <h2 className="text-[11px] leading-[14px] font-normal text-white/80 tracking-[0.2em] uppercase flex-1 text-center">
                      Acesso Beta
                    </h2>
                    <div className="flex-1 flex justify-end">
                      <button
                        onClick={handleClose}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label="Fechar"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] md:text-[15px] leading-[20px] md:leading-[22px] text-white/70 max-w-[280px] md:max-w-[320px] mx-auto">
                    Cadastre-se agora e saia na frente. Seja um dos primeiros a ter acesso exclusivo.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome"
                disabled={isSubmitting}
                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] leading-[20px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all ${
                  errors.name ? 'border-red-400/60 focus:border-red-400' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors.name && (
                <p className="mt-1.5 text-[12px] text-red-300">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                disabled={isSubmitting}
                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] leading-[20px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all ${
                  errors.email ? 'border-red-400/60 focus:border-red-400' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-red-300">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                disabled={isSubmitting}
                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] leading-[20px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all ${
                  errors.phone ? 'border-red-400/60 focus:border-red-400' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              {errors.phone && (
                <p className="mt-1.5 text-[12px] text-red-300">{errors.phone}</p>
              )}
            </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] font-medium mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Garantir meu acesso'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Back - Success */}
          <div className="modal-back">
            <div className="success-card w-full h-full">
              <div className="card-inner absolute inset-[1px] bg-[#0a0a0a] rounded-t-[23px] md:rounded-[39px] z-10 flex flex-col px-6 py-6 md:px-12 md:py-12">
                <div className="drag-handle"></div>

                <div className="flex justify-end mb-4 relative z-[100]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    aria-label="Fechar"
                    type="button"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center relative z-[2] py-8 md:py-0">
                  <h2 className="text-[10px] leading-[14px] font-normal text-white/50 mb-4 md:mb-6 tracking-[0.2em] uppercase">
                    VOCÊ ESTÁ DENTRO!
                  </h2>

                  <h3 className="text-[22px] md:text-[28px] leading-[28px] md:leading-[34px] font-bold text-white mb-3 max-w-[280px] md:max-w-[320px]">
                    Estamos muito felizes em tê-lo(a) conosco!
                  </h3>

                  <p className="text-[14px] leading-[20px] text-white/90 max-w-[280px] md:max-w-[320px]">
                    Fique de olho na sua caixa de entrada, novidades em breve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
