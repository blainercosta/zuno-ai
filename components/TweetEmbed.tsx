import { useEffect, useRef, useState } from 'react';

interface TweetEmbedProps {
  tweetId?: string;
  tweetUrl?: string;
}

// Declare Twitter widgets type
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
      ready: (callback: () => void) => void;
    };
  }
}

// Extract tweet ID from various URL formats
function extractTweetId(url: string): string | null {
  // Handle various Twitter/X URL formats:
  // https://twitter.com/user/status/1234567890
  // https://x.com/user/status/1234567890
  // https://twitter.com/user/status/1234567890?s=20
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
    /^(\d+)$/, // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Load Twitter widgets script with timeout
function loadTwitterScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded
    if (window.twttr?.widgets) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('twitter-wjs');
    if (existingScript) {
      // Script exists but not loaded yet, wait for it
      if (window.twttr?.widgets) {
        resolve();
      } else {
        // Wait for twttr to be ready
        const checkInterval = setInterval(() => {
          if (window.twttr?.widgets) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (window.twttr?.widgets) {
            resolve();
          } else {
            reject(new Error('Twitter script timeout'));
          }
        }, 5000);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'twitter-wjs';
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;

    script.onload = () => {
      // Wait for twttr to be fully ready
      const checkInterval = setInterval(() => {
        if (window.twttr?.widgets) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.twttr?.widgets) {
          resolve();
        } else {
          reject(new Error('Twitter widgets not available'));
        }
      }, 3000);
    };

    script.onerror = () => reject(new Error('Failed to load Twitter script'));

    document.head.appendChild(script);
  });
}

export default function TweetEmbed({ tweetId, tweetUrl }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Get the tweet ID from either prop
  const id = tweetId || (tweetUrl ? extractTweetId(tweetUrl) : null);

  useEffect(() => {
    if (!id || !containerRef.current) {
      setError(true);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const embedTweet = async () => {
      try {
        await loadTwitterScript();

        if (!mounted || !containerRef.current || !window.twttr?.widgets) {
          throw new Error('Component unmounted or Twitter not ready');
        }

        // Clear container
        containerRef.current.innerHTML = '';

        // Set a timeout for the embed itself
        const embedPromise = window.twttr.widgets.createTweet(id, containerRef.current, {
          theme: 'dark',
          dnt: true,
          align: 'center',
        });

        // Race between embed and timeout
        const result = await Promise.race([
          embedPromise,
          new Promise<undefined>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Tweet embed timeout')), 10000);
          })
        ]);

        clearTimeout(timeoutId);

        if (mounted) {
          // If result is undefined, the tweet might not exist or be private
          if (!result) {
            setError(true);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error embedding tweet:', err);
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    embedTweet();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [id]);

  // Show fallback link if error or no ID
  if (error || !id) {
    const url = tweetUrl || (id ? `https://x.com/i/status/${id}` : '');
    return (
      <div className="my-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <svg className="size-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className="text-sm text-zinc-400">Post do X</span>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 text-sm break-all"
          >
            Ver post original →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="my-8">
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <svg className="animate-spin size-5 text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-zinc-500">Carregando post...</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex justify-center [&>div]:max-w-full"
        style={{ display: isLoading ? 'none' : 'flex' }}
      />
    </div>
  );
}
