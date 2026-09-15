import { useEffect } from 'react'
import type { Job } from '@/types/job'
import { parseSalary } from '@/utils/salary'

interface JobStructuredDataProps {
  job: Job
}

/**
 * Componente que injeta dados estruturados (Schema.org) no head
 * para melhorar a indexação da vaga no Google
 */
export default function JobStructuredData({ job }: JobStructuredDataProps) {
  useEffect(() => {
    if (job.status !== 'active') return

    const parsedSalary = job.salary ? parseSalary(job.salary) : null

    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.job_title,
      description: job.description_full || [job.about_company, job.responsibilities, job.requirements, job.differentials, job.benefits].filter(Boolean).join('\n\n') || `Vaga de ${job.job_title} na ${job.company_name}`,
      identifier: {
        '@type': 'PropertyValue',
        name: job.company_name,
        value: job.job_id
      },
      datePosted: job.posted_at,
      // Active job: validity is at least 14 days from now, never a past date (Google for Jobs drops expired postings)
      validThrough: new Date(Math.max(new Date(job.posted_at || Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000, Date.now() + 14 * 24 * 60 * 60 * 1000)).toISOString(),
      employmentType: job.employment_type?.toUpperCase() || 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company_name,
        sameAs: job.company_url || undefined,
        logo: job.logo_url || undefined
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'BR'
        }
      },
      ...(job.is_remote && {
        jobLocationType: 'TELECOMMUTE'
      }),
      ...(parsedSalary && {
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'BRL',
          value: {
            '@type': 'QuantitativeValue',
            ...(parsedSalary.value !== undefined
              ? { value: parsedSalary.value }
              : { minValue: parsedSalary.min, maxValue: parsedSalary.max }),
            unitText: 'MONTH'
          }
        }
      }),
      ...(job.responsibilities && {
        responsibilities: job.responsibilities
      }),
      ...(job.requirements && {
        qualifications: job.requirements
      }),
      ...(job.benefits && {
        jobBenefits: job.benefits
      }),
      applicationContact: {
        '@type': 'ContactPoint',
        contactType: 'Application',
        url: job.job_url
      },
      industry: 'Inteligência Artificial',
      occupationalCategory: 'AI/ML',
      relevantOccupation: {
        '@type': 'Occupation',
        name: job.job_title,
        occupationLocation: {
          '@type': 'City',
          name: job.location
        }
      }
    }

    // Remove campos undefined
    const cleanedData = JSON.parse(JSON.stringify(structuredData))

    // Cria ou atualiza o script tag
    let script = document.getElementById('job-structured-data') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'job-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(cleanedData)

    // Cleanup ao desmontar
    return () => {
      const existingScript = document.getElementById('job-structured-data')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [job])

  return null // Este componente não renderiza nada visível
}
