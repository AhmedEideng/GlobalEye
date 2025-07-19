export async function logSnagEvent(title: string, message: string, icon?: string) {
  const LOGSNAG_API_KEY = process.env.LOGSNAG_API_KEY;
  
  if (!LOGSNAG_API_KEY) {
    // Skip logging if API key is not configured
    return;
  }

  try {
    const response = await fetch('https://api.logsnag.com/v1/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOGSNAG_API_KEY}`,
      },
      body: JSON.stringify({
        project: 'globaleye',
        channel: 'general',
        event: title,
        description: message,
        icon: icon || '📰',
        tags: {
          environment: process.env.NODE_ENV || 'development',
        },
      }),
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.debug('Failed to send log to LogSnag:', response.statusText);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.debug('Failed to send log to LogSnag:', error);
  }
}
