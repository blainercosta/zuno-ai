export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-[896px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-semibold text-white">zuno</span>
            <span className="text-xl font-light text-zinc-500">mono</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">
              Sobre
            </a>
            <span className="text-zinc-700">·</span>
            <a href="#" className="hover:text-white transition-colors">
              Termos
            </a>
            <span className="text-zinc-700">·</span>
            <a href="#" className="hover:text-white transition-colors">
              Privacidade
            </a>
            <span className="text-zinc-700">·</span>
            <a href="#" className="hover:text-white transition-colors">
              Contato
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Zuno AI. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
