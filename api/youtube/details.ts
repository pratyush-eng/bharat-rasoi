function extractYouTubeId(url: string): string {
  if (!url) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return match && match[2].length === 11 ? match[2] : "";
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    const videoId = extractYouTubeId(url) || "3AAdKl1UYZs";
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    let title = "";
    let description = "";
    let viewsCount = 125000;
    let uploadDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    let channelName = "Brasoi";
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    try {
      const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`);
      if (oembedRes.ok) {
        const oembedData: any = await oembedRes.json();
        if (oembedData.title) title = oembedData.title;
        if (oembedData.author_name) channelName = oembedData.author_name;
      }
    } catch (e) {
      // Ignore oembed error
    }

    return res.status(200).json({
      videoId,
      youtubeUrl: watchUrl,
      title: title || "Cooking Video Tutorial",
      description: description || "Step-by-step cooking tutorial video.",
      viewsCount,
      uploadDate,
      channelName,
      thumbnailUrl
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch YouTube details" });
  }
}
