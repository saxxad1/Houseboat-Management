export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    lowerUrl.includes('facebook.com') ||
    lowerUrl.includes('fb.watch')
  );
};

export const isVerticalVideo = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('/reel/') || lowerUrl.includes('/shorts/');
};

export const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0];
    } else if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
  }

  // Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    let cleanUrl = url;
    
    // Replace mobile facebook with www
    cleanUrl = cleanUrl.replace('m.facebook.com', 'www.facebook.com');

    // Remove tracking parameters
    try {
      const urlObj = new URL(cleanUrl);
      const v = urlObj.searchParams.get('v');
      
      // Clean up watch URLs
      if (urlObj.pathname.includes('/watch') && v) {
        cleanUrl = `https://www.facebook.com/video.php?v=${v}`;
      } else if (urlObj.pathname.includes('/reel/')) {
        // Handle Facebook Reels
        const reelId = urlObj.pathname.split('/reel/')[1]?.replace('/', '');
        if (reelId) {
          cleanUrl = `https://www.facebook.com/video.php?v=${reelId}`;
        }
      } else {
        // Remove tracking params like mibextid that can break embeds
        urlObj.searchParams.delete('mibextid');
        urlObj.searchParams.delete('extid');
        cleanUrl = urlObj.toString();
      }
    } catch (e) {
      // Ignore invalid URLs
    }

    // Standardize Facebook embed URL
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&width=560`;
  }

  return url;
};
