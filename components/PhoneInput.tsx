import { useState, useRef, useEffect } from 'react';
import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';

// Países prioritários (aparecem primeiro na lista)
const PRIORITY_COUNTRIES: CountryCode[] = ['BR', 'US', 'PT', 'ES', 'AR', 'MX', 'CO', 'CL'];

// Mapeamento de nomes de países em português
const COUNTRY_NAMES: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
  PT: 'Portugal',
  ES: 'Espanha',
  AR: 'Argentina',
  MX: 'México',
  CO: 'Colômbia',
  CL: 'Chile',
  DE: 'Alemanha',
  FR: 'França',
  IT: 'Itália',
  GB: 'Reino Unido',
  CA: 'Canadá',
  AU: 'Austrália',
  JP: 'Japão',
  CN: 'China',
  IN: 'Índia',
  RU: 'Rússia',
  KR: 'Coreia do Sul',
  NL: 'Países Baixos',
  BE: 'Bélgica',
  CH: 'Suíça',
  AT: 'Áustria',
  SE: 'Suécia',
  NO: 'Noruega',
  DK: 'Dinamarca',
  FI: 'Finlândia',
  PL: 'Polônia',
  UY: 'Uruguai',
  PY: 'Paraguai',
  PE: 'Peru',
  EC: 'Equador',
  VE: 'Venezuela',
  BO: 'Bolívia',
  CR: 'Costa Rica',
  PA: 'Panamá',
  DO: 'República Dominicana',
  PR: 'Porto Rico',
  CU: 'Cuba',
  GT: 'Guatemala',
  HN: 'Honduras',
  SV: 'El Salvador',
  NI: 'Nicarágua',
  ZA: 'África do Sul',
  EG: 'Egito',
  NG: 'Nigéria',
  KE: 'Quênia',
  MA: 'Marrocos',
  AE: 'Emirados Árabes',
  SA: 'Arábia Saudita',
  IL: 'Israel',
  TR: 'Turquia',
  GR: 'Grécia',
  CZ: 'República Tcheca',
  RO: 'Romênia',
  HU: 'Hungria',
  IE: 'Irlanda',
  NZ: 'Nova Zelândia',
  SG: 'Singapura',
  MY: 'Malásia',
  TH: 'Tailândia',
  VN: 'Vietnã',
  PH: 'Filipinas',
  ID: 'Indonésia',
  TW: 'Taiwan',
  HK: 'Hong Kong',
};

// URL base para bandeiras via CDN (flagcdn.com - gratuito e rápido)
const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;

interface PhoneInputProps {
  value: string;
  onChange: (value: string, countryCode: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  error?: boolean;
  autoFocus?: boolean;
  defaultCountry?: CountryCode;
}

export default function PhoneInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  error,
  autoFocus,
  defaultCountry = 'BR',
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monta lista de países
  const allCountries = getCountries();
  const prioritySet = new Set(PRIORITY_COUNTRIES);
  const otherCountries = allCountries.filter((c) => !prioritySet.has(c)).sort((a, b) => {
    const nameA = COUNTRY_NAMES[a] || a;
    const nameB = COUNTRY_NAMES[b] || b;
    return nameA.localeCompare(nameB, 'pt-BR');
  });
  const sortedCountries = [...PRIORITY_COUNTRIES, ...otherCountries];

  // Filtra por busca
  const filteredCountries = sortedCountries.filter((c) => {
    const name = COUNTRY_NAMES[c] || c;
    const code = `+${getCountryCallingCode(c)}`;
    const searchLower = search.toLowerCase();
    return (
      name.toLowerCase().includes(searchLower) ||
      code.includes(search) ||
      c.toLowerCase().includes(searchLower)
    );
  });

  const handleCountrySelect = (c: CountryCode) => {
    setCountry(c);
    setIsOpen(false);
    setSearch('');
    // Notifica a mudança de país
    onChange(value, getCountryCallingCode(c));
    inputRef.current?.focus();
  };

  const callingCode = getCountryCallingCode(country);

  // Formata o valor completo para envio (código do país + número)
  const getFullNumber = () => {
    const digits = value.replace(/\D/g, '');
    return `${callingCode}${digits}`;
  };

  // Expõe o número completo via onChange quando necessário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    onChange(digits, callingCode);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-stretch bg-black/40 border rounded-xl overflow-hidden transition-all ${
          error ? 'border-red-400/60' : 'border-zinc-800 focus-within:border-zinc-600'
        }`}
      >
        {/* Seletor de país */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-4 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors border-r border-zinc-800"
        >
          <img
            src={getFlagUrl(country)}
            alt={COUNTRY_NAMES[country] || country}
            className="w-6 h-[18px] object-cover rounded-sm"
            loading="lazy"
          />
          <span className="text-zinc-400 text-sm">+{callingCode}</span>
          <svg
            className={`size-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Input do número */}
        <input
          ref={inputRef}
          type="tel"
          placeholder="Seu número"
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none"
          autoFocus={autoFocus}
          data-full-number={getFullNumber()}
        />
      </div>

      {/* Dropdown de países */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-xl">
          {/* Busca */}
          <div className="p-2 border-b border-zinc-800">
            <input
              type="text"
              placeholder="Buscar país..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
              autoFocus
            />
          </div>

          {/* Lista de países */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-500 text-center">
                Nenhum país encontrado
              </div>
            ) : (
              filteredCountries.map((c, index) => {
                const isPriority = prioritySet.has(c);
                const isFirstOther = !isPriority && index === PRIORITY_COUNTRIES.length;
                return (
                  <div key={c}>
                    {isFirstOther && filteredCountries.some((fc) => prioritySet.has(fc)) && (
                      <div className="border-t border-zinc-800 my-1" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-800/50 transition-colors ${
                        country === c ? 'bg-zinc-800/30' : ''
                      }`}
                    >
                      <img
                        src={getFlagUrl(c)}
                        alt={COUNTRY_NAMES[c] || c}
                        className="w-6 h-[18px] object-cover rounded-sm"
                        loading="lazy"
                      />
                      <span className="flex-1 text-sm text-white">
                        {COUNTRY_NAMES[c] || c}
                      </span>
                      <span className="text-sm text-zinc-500">+{getCountryCallingCode(c)}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper para obter o número completo de um PhoneInput
export function getPhoneFullNumber(countryCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '');
  return `${countryCode}${digits}`;
}
