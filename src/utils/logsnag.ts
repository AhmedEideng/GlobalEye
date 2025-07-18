export async function logSnagEvent(title: string, message: string) {
  const LOGSNAG_API_KEY = process.env.LOGSNAG_API_KEY;
  
  if (!LOGSNAG_API_KEY) {
    // Skip logging if API key is not configured
    return;
  }

  try {
    await fetch("https://api.logsnag.com/v1/log", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOGSNAG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: "GlobalEye",
        channel: "news-fetch",
        event: title,
        description: message,
        icon: "📰",
        notify: true,
      }),
    });
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('Failed to send log to LogSnag:', error);
    }
  }
}
