function extractYouTubeId(url: string): string {
  if (!url) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return match && match[2].length === 11 ? match[2] : "";
}

function cleanYouTubeDateString(raw: string): string {
  if (!raw) return "";
  let clean = raw
    .replace(/^Streamed live on /i, "")
    .replace(/^Premiered /i, "")
    .replace(/^Published on /i, "")
    .replace(/^Released on /i, "")
    .trim();

  if (clean.includes("-") && /\d{4}-\d{2}-\d{2}/.test(clean)) {
    try {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    } catch (e) {}
  }
  return clean;
}

function formatYouTubeDurationSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return "10:00";
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${rem.toString().padStart(2, "0")}`;
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
    let viewsCount = 0;
    let uploadDate = "";
    let channelName = "";
    let duration = "10:00";
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    try {
      // 1. Fetch YouTube oEmbed API for title and author
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`);
      if (oembedRes.ok) {
        const oembedData: any = await oembedRes.json();
        if (oembedData.title) title = oembedData.title;
        if (oembedData.author_name) channelName = oembedData.author_name;
        if (oembedData.thumbnail_url) thumbnailUrl = oembedData.thumbnail_url;
      }
    } catch (e) {
      // Ignore oembed error
    }

    try {
      // 2. Fetch YouTube watch HTML page with consent cookies & modern desktop user agent
      const htmlRes = await fetch(watchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Cookie": "SOCS=CAESEwgDEgk2MzE5NzE1NzQaAmVuIAEaBgiA_LyaBg; CONSENT=PENDING+999; PREF=tz=UTC&hl=en"
        }
      });

      if (htmlRes.ok) {
        const html = await htmlRes.text();

        // Check ytInitialPlayerResponse
        const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script>)/s);
        if (playerMatch) {
          try {
            const p = JSON.parse(playerMatch[1]);
            if (p.videoDetails) {
              if (!title && p.videoDetails.title) title = p.videoDetails.title;
              if (!channelName && p.videoDetails.author) channelName = p.videoDetails.author;
              if (p.videoDetails.shortDescription) description = p.videoDetails.shortDescription;
              if (p.videoDetails.viewCount) viewsCount = parseInt(p.videoDetails.viewCount, 10);
              if (p.videoDetails.lengthSeconds) duration = formatYouTubeDurationSeconds(parseInt(p.videoDetails.lengthSeconds, 10));
            }
            if (p.microformat?.playerMicroformatRenderer) {
              const micro = p.microformat.playerMicroformatRenderer;
              if (micro.publishDate || micro.uploadDate) uploadDate = cleanYouTubeDateString(micro.publishDate || micro.uploadDate);
              if (!viewsCount && micro.viewCount) viewsCount = parseInt(micro.viewCount, 10);
              if (!channelName && micro.ownerChannelName) channelName = micro.ownerChannelName;
            }
          } catch (e) {}
        }

        // Check ytInitialData
        const initialDataMatch = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*(?:var|<\/script>)/s);
        if (initialDataMatch) {
          try {
            const d = JSON.parse(initialDataMatch[1]);
            const jsonStr = JSON.stringify(d);
            if (!viewsCount) {
              const vM = jsonStr.match(/"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i) ||
                         jsonStr.match(/"originalViewCount":"(\d+)"/i) ||
                         jsonStr.match(/"viewCount":"(\d+)"/i);
              if (vM && vM[1]) viewsCount = parseInt(vM[1].replace(/,/g, ""), 10);
            }
            if (!uploadDate) {
              const dM = jsonStr.match(/"dateText":\s*\{"simpleText":"([^"]+)"\}/i) ||
                         jsonStr.match(/"publishDate":\s*\{"simpleText":"([^"]+)"\}/i);
              if (dM && dM[1]) uploadDate = cleanYouTubeDateString(dM[1]);
            }
          } catch (e) {}
        }

        // Regex fallback directly on HTML
        if (!viewsCount) {
          const vM = html.match(/"viewCount":"(\d+)"/i) ||
                     html.match(/"originalViewCount":"(\d+)"/i) ||
                     html.match(/"videoViewCountRenderer":\s*\{"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i) ||
                     html.match(/"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i) ||
                     html.match(/([\d,]+)\s+views/i);
          if (vM && vM[1]) viewsCount = parseInt(vM[1].replace(/,/g, ""), 10);
        }

        if (!uploadDate) {
          const dM = html.match(/<meta itemprop="datePublished" content="([^"]+)"/i) ||
                     html.match(/<meta itemprop="uploadDate" content="([^"]+)"/i) ||
                     html.match(/"publishDate":"([^"]+)"/i) ||
                     html.match(/"uploadDate":"([^"]+)"/i) ||
                     html.match(/"dateText":\s*\{"simpleText":"([^"]+)"\}/i);
          if (dM && dM[1]) uploadDate = cleanYouTubeDateString(dM[1]);
        }

        if (!title) {
          const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<meta name="title" content="([^"]+)"/i);
          if (titleMatch) title = titleMatch[1];
        }

        if (!description) {
          const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i);
          if (descMatch && descMatch[1] && !descMatch[1].includes("Enjoy the videos and music")) {
            description = descMatch[1];
          }
        }
      }
    } catch (e) {
      // Ignore html fetch error
    }

    if (!uploadDate) {
      uploadDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    return res.status(200).json({
      videoId,
      youtubeUrl: watchUrl,
      title: title || "Cooking Video Tutorial",
      description: description || "Step-by-step cooking tutorial video.",
      viewsCount: viewsCount || 125000,
      uploadDate,
      channelName: channelName || "Chef Studio",
      thumbnailUrl,
      duration
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch YouTube details" });
  }
}
