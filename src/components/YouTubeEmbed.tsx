import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, Play, RefreshCw } from 'lucide-react';

export interface YouTubeEmbedProps {
  /** Can be a video ID (e.g. 'CbbhxZQA1ps') or a full YouTube URL */
  videoSource: string;
  /** Accessible title for screen readers and iframe title */
  title: string;
  /** Optional channel name or curator */
  channelName?: string;
  /** Optional description snippet */
  description?: string;
  /** Optional thumbnail override */
  thumbnailUrl?: string;
  /** Aspect ratio container style, default 16/9 */
  aspectRatio?: '16/9' | '4/3';
  /** Extra CSS classes */
  className?: string;
  /** Callback when user clicks open on YouTube */
  onOpenExternal?: () => void;
}

/**
 * Standardized utility to extract and validate an 11-character YouTube video ID
 * from arbitrary URLs, embed codes, shortlinks, or raw IDs.
 */
export function extractYouTubeVideoId(input: string | undefined | null): string | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // 1. Direct 11-character alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Parse URL patterns safely
  try {
    // Check if it's a URL or needs https:// prefix
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    const url = new URL(urlString);
    const host = url.hostname.replace('www.', '');

    // Case: youtu.be/<id>
    if (host === 'youtu.be') {
      const pathId = url.pathname.slice(1).split('/')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        return pathId;
      }
    }

    // Case: youtube.com or youtube-nocookie.com
    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com') {
      // /watch?v=<id>
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }

      // /embed/<id>
      if (url.pathname.startsWith('/embed/')) {
        const embedId = url.pathname.replace('/embed/', '').split('/')[0].split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(embedId)) {
          return embedId;
        }
      }

      // /shorts/<id>
      if (url.pathname.startsWith('/shorts/')) {
        const shortId = url.pathname.replace('/shorts/', '').split('/')[0].split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(shortId)) {
          return shortId;
        }
      }
    }

    // Fallback: search query parameter or regex match within string
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // If URL constructor fails, attempt regex
    const match = trimmed.match(/([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Standardized YouTube Embed Component with URL validation, privacy-enhanced mode,
 * responsive aspect ratio, accessible fallback states, and direct links.
 */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoSource,
  title,
  channelName,
  description,
  thumbnailUrl,
  aspectRatio = '16/9',
  className = '',
  onOpenExternal,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoId = extractYouTubeVideoId(videoSource);
  const isValid = Boolean(videoId);

  const computedThumbnail =
    thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');

  const directYouTubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : videoSource.startsWith('http')
    ? videoSource
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;

  // Reset state when video source changes
  useEffect(() => {
    setIframeLoaded(false);
    setForceFallback(false);
    setHasError(false);
  }, [videoSource]);

  // Privacy-enhanced embed URL without autoplay with sound
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`
    : '';

  // Render Fallback Card if ID is invalid or user toggled fallback
  if (!isValid || forceFallback || hasError) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3D1E28] via-[#2A131B] to-[#1C0B12] text-white border border-white/10 shadow-lg ${
          aspectRatio === '16/9' ? 'aspect-video' : 'aspect-4/3'
        } ${className}`}
      >
        {/* Background Thumbnail preview with dark overlay */}
        {computedThumbnail && (
          <img
            src={computedThumbnail}
            alt={title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
            onError={() => {
              // Ignore image fallback errors
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 flex flex-col justify-between p-4 sm:p-6 z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-[#FCECEF]">
              <span className="w-2 h-2 rounded-full bg-[#E25574] animate-pulse" />
              <span>{!isValid ? 'Unavailable Video' : 'Embed Restricted'}</span>
            </div>

            {isValid && (
              <button
                onClick={() => {
                  setForceFallback(false);
                  setHasError(false);
                }}
                className="text-[11px] text-[#F4A6B8] hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/15 px-2 py-1 rounded-lg transition-colors"
                title="Try loading embedded player again"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Player</span>
              </button>
            )}
          </div>

          {/* Center Info & Title */}
          <div className="space-y-2 max-w-xl">
            <h4 className="text-sm sm:text-base font-bold line-clamp-2 text-white">
              {title}
            </h4>
            {channelName && (
              <p className="text-xs text-[#F4A6B8] font-medium">{channelName}</p>
            )}
            <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed">
              {!isValid
                ? 'This video is currently unavailable or has an unverified ID. You can watch it directly on the YouTube platform.'
                : description ||
                  'The creator has enabled YouTube-only playback permissions or this browser sandbox is restricting external players.'}
            </p>
          </div>

          {/* Bottom Action */}
          <div className="pt-2 flex items-center gap-3">
            <a
              href={directYouTubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onOpenExternal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#E25574] hover:bg-[#D9658B] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#E25574]/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <span className="text-[10px] text-white/50">
              Opens safely in a new window
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black border border-white/15 shadow-md ${
        aspectRatio === '16/9' ? 'aspect-video' : 'aspect-4/3'
      } ${className}`}
    >
      {/* Loading Skeleton */}
      {!iframeLoaded && (
        <div className="absolute inset-0 bg-[#2A131B] flex flex-col items-center justify-center p-6 text-center z-10 animate-pulse">
          {computedThumbnail && (
            <img
              src={computedThumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-[#F4A6B8] fill-[#F4A6B8]" />
            </div>
            <p className="text-xs text-white/80 font-medium">{title}</p>
            <span className="text-[10px] text-[#F4A6B8]">Loading secure player...</span>
          </div>
        </div>
      )}

      {/* Embedded Iframe */}
      <iframe
        src={embedUrl}
        title={title}
        aria-label={title}
        className="w-full h-full border-0 relative z-20"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        onLoad={() => setIframeLoaded(true)}
        onError={() => setHasError(true)}
      />

      {/* Bottom utility overlay to switch to fallback or open in YouTube if the iframe encounters a problem */}
      <div className="absolute top-2 right-2 z-30 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/20">
          <a
            href={directYouTubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpenExternal}
            className="text-[11px] text-white hover:text-[#F4A6B8] px-2 py-0.5 rounded flex items-center gap-1"
            title="Open in full YouTube"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setForceFallback(true)}
            className="text-[10px] text-white/70 hover:text-white px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20"
            title="Switch to fallback preview card"
          >
            Fallback card
          </button>
        </div>
      </div>
    </div>
  );
};
