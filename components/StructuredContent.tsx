import type { ContentBlock } from '@/types/news'
import TweetEmbed from './TweetEmbed'

interface StructuredContentProps {
  content: string | ContentBlock[]
}

export default function StructuredContent({ content }: StructuredContentProps) {
  // Handle both JSON string and already-parsed array
  let blocks: ContentBlock[] = []

  if (Array.isArray(content)) {
    // Already an array (parsed by Supabase)
    blocks = content
  } else if (typeof content === 'string') {
    // Try to parse as JSON string
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        blocks = parsed
      } else {
        return null // Not a valid structured content
      }
    } catch {
      return null // Not JSON, let parent handle HTML
    }
  } else {
    return null
  }

  if (blocks.length === 0) {
    return null
  }

  return (
    <div className="article-content">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} className="text-[17px] leading-[1.8] mb-6 text-zinc-400">
                {block.text}
              </p>
            )

          case 'heading':
            if (block.level === 2) {
              return (
                <h2 key={index} className="text-[26px] font-semibold mt-12 mb-5 text-white leading-[1.3]">
                  {block.text}
                </h2>
              )
            }
            if (block.level === 3) {
              return (
                <h3 key={index} className="text-[22px] font-semibold mt-9 mb-4 text-white leading-[1.3]">
                  {block.text}
                </h3>
              )
            }
            return (
              <h4 key={index} className="text-[18px] font-semibold mt-6 mb-3 text-white leading-[1.3]">
                {block.text}
              </h4>
            )

          case 'image':
            return (
              <figure key={index} className="my-8">
                <img
                  src={block.url}
                  alt={block.caption || ''}
                  className="w-full rounded-xl"
                  loading="lazy"
                />
                {block.caption && (
                  <figcaption className="text-sm text-zinc-500 mt-3 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )

          case 'callout':
            return (
              <blockquote
                key={index}
                className={`border-l-3 pl-5 my-8 italic ${
                  block.style === 'insight'
                    ? 'border-[#7349D4] text-zinc-300'
                    : 'border-zinc-700 text-zinc-400'
                }`}
              >
                {block.text}
              </blockquote>
            )

          case 'divider':
            return (
              <hr key={index} className="border-zinc-800 my-10" />
            )

          case 'tweet':
            return (
              <TweetEmbed
                key={index}
                tweetId={block.tweetId}
                tweetUrl={block.tweetUrl || block.url}
              />
            )

          case 'embed':
            // Handle different embed types
            if (block.embedType === 'twitter' || block.url?.includes('twitter.com') || block.url?.includes('x.com')) {
              return (
                <TweetEmbed
                  key={index}
                  tweetUrl={block.url}
                />
              )
            }
            // YouTube embed
            if (block.embedType === 'youtube' || block.url?.includes('youtube.com') || block.url?.includes('youtu.be')) {
              const videoId = block.url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)?.[1]
              if (videoId) {
                return (
                  <div key={index} className="my-8 aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube video"
                    />
                  </div>
                )
              }
            }
            // Generic embed fallback
            return (
              <div key={index} className="my-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 text-sm break-all"
                >
                  {block.url}
                </a>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
