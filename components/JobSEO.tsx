import { useEffect } from 'react';
import type { Job } from '@/types/job';

interface JobSEOProps {
  job: Job;
  url: string;
}

const DEFAULT_TITLE = 'Zuno AI - Notícias e vagas de Inteligência Artificial em português';
const DEFAULT_DESCRIPTION =
  'Notícias de IA em português, vagas de Inteligência Artificial no Brasil, salários e como a IA afeta cada profissão. Atualizado todos os dias.';

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function stripHtml(value: string | null | undefined): string {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Per-job <title>, description, canonical and OG tags. Without this every job
// page shares the generic index.html metadata and Google sees 349 duplicate titles.
export default function JobSEO({ job, url }: JobSEOProps) {
  useEffect(() => {
    const location = job.is_remote ? 'Remoto' : job.location || 'Brasil';
    const title = `${job.job_title} - ${job.company_name} (${location}) | Vagas de IA - Zuno AI`;
    const source = stripHtml(job.description_full || job.responsibilities || job.requirements || job.about_company) || `Vaga de ${job.job_title} na ${job.company_name}.`;
    const description = source.length > 155 ? `${source.slice(0, 152).trimEnd()}...` : source;

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', `${job.job_title} - ${job.company_name}`);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:title', `${job.job_title} - ${job.company_name}`);
    setMeta('name', 'twitter:description', description);
    setCanonical(url);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('name', 'description', DEFAULT_DESCRIPTION);
      setCanonical('https://www.usezuno.app');
    };
  }, [job, url]);

  return null;
}
