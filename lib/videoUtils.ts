const normalizeAbsoluteUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const isFacebookVideoUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(normalizeAbsoluteUrl(url));
    const hostname = urlObj.hostname.replace(/^m\./, 'www.').replace(/^web\./, 'www.');
    return hostname === 'fb.watch' || hostname.endsWith('facebook.com');
  } catch {
    return false;
  }
};

export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    isFacebookVideoUrl(url)
  );
};

export const isVerticalVideo = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('/reel/') || lowerUrl.includes('/shorts/');
};

const cleanSearchParams = (urlObj: URL, allowedParams: string[] = []) => {
  const allowed = new Set(allowedParams);
  Array.from(urlObj.searchParams.keys()).forEach((key) => {
    if (!allowed.has(key)) {
      urlObj.searchParams.delete(key);
    }
  });
};

const normalizeFacebookUrl = (url: string): string => {
  const absoluteUrl = normalizeAbsoluteUrl(url);
  if (!absoluteUrl) return '';

  try {
    const urlObj = new URL(absoluteUrl);
    const hostname = urlObj.hostname.replace(/^m\./, 'www.').replace(/^web\./, 'www.');

    if (hostname === 'fb.watch') {
      urlObj.hostname = hostname;
      cleanSearchParams(urlObj);
      return urlObj.toString();
    }

    if (!hostname.endsWith('facebook.com')) {
      return absoluteUrl;
    }

    urlObj.protocol = 'https:';
    urlObj.hostname = hostname === 'facebook.com' ? 'www.facebook.com' : hostname;

    if (urlObj.pathname === '/plugins/video.php') {
      return urlObj.toString();
    }

    const videoId =
      urlObj.searchParams.get('v') ||
      urlObj.pathname.match(/\/videos\/(?:[^/]+\/)?(\d+)/)?.[1] ||
      (urlObj.pathname.match(/\/watch\/?$/) ? urlObj.searchParams.get('v') : null) ||
      urlObj.pathname.match(/\/share\/v\/(\d+)/)?.[1] ||
      urlObj.pathname.match(/\/reel\/(\d+)/)?.[1];

    if (
      videoId &&
      (urlObj.pathname.includes('/watch') ||
        urlObj.pathname.includes('/videos/') ||
        urlObj.pathname.includes('/share/v/') ||
        urlObj.pathname.includes('/reel/'))
    ) {
      return `https://www.facebook.com/video.php?v=${videoId}`;
    }

    cleanSearchParams(urlObj, videoId && urlObj.searchParams.has('v') ? ['v'] : []);

    const normalized = urlObj.toString();
    return urlObj.pathname.includes('/reel/') && !normalized.endsWith('/')
      ? `${normalized}/`
      : normalized;
  } catch {
    return absoluteUrl;
  }
};

export const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();
  
  // YouTube
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    let videoId = '';
    if (lowerUrl.includes('youtu.be/')) {
      videoId = trimmedUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (lowerUrl.includes('v=')) {
      videoId = trimmedUrl.split('v=')[1]?.split('&')[0];
    } else if (lowerUrl.includes('/embed/')) {
      videoId = trimmedUrl.split('/embed/')[1]?.split('?')[0];
    } else if (lowerUrl.includes('/shorts/')) {
      videoId = trimmedUrl.split('/shorts/')[1]?.split('?')[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
  }

  // Facebook
  if (isFacebookVideoUrl(trimmedUrl)) {
    const cleanUrl = normalizeFacebookUrl(trimmedUrl);

    if (cleanUrl.includes('/plugins/video.php')) {
      return cleanUrl;
    }

    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&width=560`;
  }

  return trimmedUrl;
};

export const getVideoExternalUrl = (url: string): string => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (isFacebookVideoUrl(trimmedUrl)) {
    return normalizeFacebookUrl(trimmedUrl);
  }
  return getEmbedUrl(trimmedUrl) || trimmedUrl;
};
