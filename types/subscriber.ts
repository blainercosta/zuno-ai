export type SubscriberStatus = 'pending' | 'active' | 'cancelled' | 'paused';

export interface Subscriber {
  id: number;
  name: string;
  email: string;
  instagram: string;
  whatsapp: string;
  niche: string;
  status: SubscriberStatus;
  payment_confirmed_at?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriberInsert {
  name: string;
  email: string;
  instagram: string;
  whatsapp: string;
  niche: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// Nichos disponíveis
export const SUBSCRIBER_NICHES = [
  'Tech & Startups',
  'Marketing Digital',
  'Finanças & Investimentos',
  'Saúde & Bem-estar',
  'Educação',
  'E-commerce',
  'Criadores de Conteúdo',
  'Outro',
] as const;

export type SubscriberNiche = (typeof SUBSCRIBER_NICHES)[number];
