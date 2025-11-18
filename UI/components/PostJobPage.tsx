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
                <h2 className="text-base">Publicar vaga</h2>
              </div>
            </div>

            {/* Spacer to balance layout */}
            <div className="flex-[0_0_auto] min-w-0" style={{ width: '60px' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-16 py-8 lg:py-16">
          <div className="max-w-[752px] mx-auto">
            <h1 className="text-[30px] leading-[36px] mb-2">Publicar uma vaga</h1>
            <p className="text-zinc-400 mb-8">Preencha os campos abaixo para publicar sua vaga gratuitamente.</p>

            <form className="space-y-6">
              {/* Informações da Empresa */}
              <div className="space-y-6">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações da empresa</h3>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Nome da empresa *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    placeholder="Ex: Acme Inc"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Website da empresa</label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Logo da empresa</label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <svg className="size-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4V20M20 12H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <button type="button" className="px-4 py-2 border border-zinc-800 rounded-xl text-sm hover:bg-zinc-900 transition-colors">
                      Fazer upload
                    </button>
                  </div>
                </div>
              </div>

              {/* Informações da Vaga */}
              <div className="space-y-6 pt-8 border-t border-zinc-800">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações da vaga</h3>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Título da vaga *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    placeholder="Ex: Product Designer Sênior"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-zinc-300">Localização *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                      placeholder="Ex: São Paulo, SP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-zinc-300">Tipo *</label>
                    <select className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700">
                      <option value="">Selecione</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contrato</option>
                      <option value="remote">Remoto</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-zinc-300">Nível *</label>
                    <select className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700">
                      <option value="">Selecione</option>
                      <option value="junior">Júnior</option>
                      <option value="mid">Pleno</option>
                      <option value="senior">Sênior</option>
                      <option value="lead">Lead</option>
                      <option value="principal">Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-zinc-300">Salário</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                      placeholder="Ex: R$ 10.000 - 15.000 / mês"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Sobre a empresa *</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
                    placeholder="Descreva sua empresa, missão e cultura..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Responsabilidades *</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
                    placeholder="Descreva as principais responsabilidades da função..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Requisitos *</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
                    placeholder="Liste os requisitos necessários para a vaga..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Diferenciais</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
                    placeholder="Liste os diferenciais que seriam um plus..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">O que oferecemos</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
                    placeholder="Descreva os benefícios e o que sua empresa oferece..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Link para candidatura *</label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    placeholder="https://exemplo.com/careers/apply"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Cole o link onde os candidatos devem se inscrever</p>
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-6 pt-8 border-t border-zinc-800">
                <h3 className="text-[20px] leading-[30px] text-slate-50">Informações de contato</h3>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Não será exibido publicamente</p>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-zinc-300">Nome completo *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-8">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-slate-950 px-6 py-3 rounded-xl border border-slate-950 hover:bg-zinc-100 transition-colors"
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
