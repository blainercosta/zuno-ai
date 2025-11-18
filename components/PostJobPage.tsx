interface PostJobPageProps {
  onBack: () => void;
}

export default function PostJobPage({ onBack }: PostJobPageProps) {
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

            <form className="space-y-12">
              {/* Informações da Empresa */}
              <div className="space-y-6">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações da empresa</h3>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Nome da empresa *
                  </label>
                  <input
                    type="text"
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
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Logo da empresa
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <svg className="size-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4V20M20 12H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2.5 border border-zinc-800 rounded-xl text-[14px] leading-[14px] hover:bg-zinc-900 transition-colors"
                    >
                      Fazer upload
                    </button>
                  </div>
                  <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                    Recomendado: 200x200px, PNG ou JPG
                  </p>
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
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ex: Product Designer Sênior"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Localização *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Tipo *
                    </label>
                    <select className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer">
                      <option value="" className="bg-zinc-900">Selecione</option>
                      <option value="full-time" className="bg-zinc-900">Full-time</option>
                      <option value="part-time" className="bg-zinc-900">Part-time</option>
                      <option value="contract" className="bg-zinc-900">Contrato</option>
                      <option value="remote" className="bg-zinc-900">Remoto</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Nível *
                    </label>
                    <select className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700 transition-colors appearance-none cursor-pointer">
                      <option value="" className="bg-zinc-900">Selecione</option>
                      <option value="junior" className="bg-zinc-900">Júnior</option>
                      <option value="mid" className="bg-zinc-900">Pleno</option>
                      <option value="senior" className="bg-zinc-900">Sênior</option>
                      <option value="lead" className="bg-zinc-900">Lead</option>
                      <option value="principal" className="bg-zinc-900">Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                      Salário
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                      placeholder="Ex: R$ 10.000 - 15.000 / mês"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Sobre a empresa *
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva sua empresa, missão e cultura..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Responsabilidades *
                  </label>
                  <textarea
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
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Liste os diferenciais que seriam um plus..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    O que oferecemos
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                    placeholder="Descreva os benefícios e o que sua empresa oferece..."
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Link para candidatura *
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="https://exemplo.com/careers/apply"
                  />
                  <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                    Cole o link onde os candidatos devem se inscrever
                  </p>
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-6 pt-8 border-t border-zinc-800">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações de contato</h3>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="seu@email.com"
                  />
                  <p className="text-[12px] leading-[18px] text-zinc-500 mt-2">
                    Não será exibido publicamente
                  </p>
                </div>

                <div>
                  <label className="block text-[14px] leading-[21px] mb-2 text-zinc-300">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-transparent border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-8">
                <button
                  type="button"
                  onClick={onBack}
                  className="order-2 sm:order-1 px-6 py-3 border border-zinc-800 rounded-xl text-[15px] leading-[15px] hover:bg-zinc-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="order-1 sm:order-2 flex-1 bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors text-[15px] leading-[15px] font-medium"
                >
                  Publicar vaga gratuitamente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
