/**
 * Extracts YouTube Video ID from various YouTube URL formats.
 */
export function extractYouTubeId(url: string): string {
  if (!url) return '';
  
  // If user already pasted just the 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : '3AAdKl1UYZs'; // Default fallback ID if invalid
}

export function getYouTubeThumbnail(videoId: string): string {
  if (!videoId) return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string, startSeconds: number = 0): string {
  const timeParam = startSeconds > 0 ? `&start=${startSeconds}` : '';
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${timeParam}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
