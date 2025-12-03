import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PAYMENT_URL = 'https://www.abacatepay.com/pay/bill_aJYE06HEdYEUx2fHd3L0mTNa';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [paymentStarted, setPaymentStarted] = useState(false);

  const handlePayment = () => {
    window.open(PAYMENT_URL, '_blank');
    setPaymentStarted(true);
  };

  const handleConfirmPayment = () => {
    navigate('/checkout/sucesso');
  };

  // Tela de aguardando pagamento
  if (paymentStarted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center">
            {/* Animated icon */}
            <div className="mb-8">
              <div className="size-20 mx-auto rounded-2xl bg-[#7349D4]/10 flex items-center justify-center">
                <svg className="size-10 text-[#7349D4] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-medium mb-3 tracking-tight">
              Complete o pagamento
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed mb-10">
              Uma nova aba foi aberta com o pagamento.
              <br />
              Após pagar, clique no botão abaixo.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-white text-zinc-950 font-medium py-3.5 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Já paguei
              </button>

              <button
                onClick={handlePayment}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium py-3.5 rounded-xl hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
              >
                Abrir pagamento novamente
              </button>
            </div>

            <p className="text-sm text-zinc-600 mt-8">
              Problemas? Entre em contato pelo WhatsApp
            </p>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col px-6 py-8 md:py-12">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7349D4]/10 text-[#7349D4] text-xs font-medium mb-6">
              <span className="size-1.5 rounded-full bg-[#7349D4] animate-pulse" />
              Lançamento
            </div>
            <h1 className="text-3xl md:text-4xl font-medium mb-4 tracking-tight leading-tight">
              Notícias de IA
              <br />
              <span className="text-zinc-400">antes de todo mundo</span>
            </h1>
            <p className="text-zinc-500 text-base leading-relaxed max-w-sm mx-auto">
              Receba no WhatsApp. Poste na hora certa.
              Seu conteúdo sai antes da concorrência acordar.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="size-12 rounded-xl bg-[#62D4DD]/10 flex items-center justify-center shrink-0">
                <svg className="size-6 text-[#62D4DD]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Direto no WhatsApp</p>
                <p className="text-sm text-zinc-500">Notificação quando sai notícia relevante</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="size-12 rounded-xl bg-[#FF7BCA]/10 flex items-center justify-center shrink-0">
                <svg className="size-6 text-[#FF7BCA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Timing perfeito</p>
                <p className="text-sm text-zinc-500">Poste antes de virar trend</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="size-12 rounded-xl bg-[#FFF96F]/10 flex items-center justify-center shrink-0">
                <svg className="size-6 text-[#FFF96F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Curadoria de IA</p>
                <p className="text-sm text-zinc-500">Só o que importa pro seu nicho</p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex -space-x-2">
              <div className="size-8 rounded-full bg-gradient-to-br from-[#7349D4] to-[#FF7BCA] border-2 border-[#09090b]" />
              <div className="size-8 rounded-full bg-gradient-to-br from-[#62D4DD] to-[#7349D4] border-2 border-[#09090b]" />
              <div className="size-8 rounded-full bg-gradient-to-br from-[#FFF96F] to-[#FF7BCA] border-2 border-[#09090b]" />
            </div>
            <p className="text-sm text-zinc-500">
              <span className="text-white font-medium">127 criadores</span> já recebem
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-8" />

          {/* Price & CTA */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pt-8 pb-6 -mx-6 px-6">
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-zinc-600 line-through text-sm">R$ 97</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#7349D4]/10 text-[#7349D4] font-medium">-48%</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-zinc-500 text-lg">R$</span>
                <span className="text-5xl font-medium tracking-tight">49</span>
                <span className="text-zinc-500">,90<span className="text-sm">/mês</span></span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-white text-zinc-950 font-medium py-4 rounded-xl hover:bg-zinc-100 transition-colors text-base"
            >
              Quero receber primeiro
            </button>

            <p className="text-center text-xs text-zinc-600 mt-4">
              Pix ou cartão. Cancele quando quiser.
            </p>
          </div>
        </div>
    </div>
  );
}
