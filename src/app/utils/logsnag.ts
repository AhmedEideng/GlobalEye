// src/app/utils/logsnag.ts

export const logSnagNotify = async ({
  project = 'globaleye',
  channel = 'news',
  event,
  description,
  icon = '📰',
  notify = false,
}: {
  project?: string;
  channel?: string;
  event: string;
  description: string;
  icon?: string;
  notify?: boolean;
}) => {
  const LOGSNAG_TOKEN = process.env.LOGSNAG_TOKEN;

  if (!LOGSNAG_TOKEN) {
    console.warn('LogSnag token is missing.');
    return;
  }

  try {
    await fetch('https://api.logsnag.com/v1/log', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOGSNAG_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project,
        channel,
        event,
        description,
        icon,
        notify,
      }),
    });
  } catch (err) {
    console.error('LogSnag error:', err);
  }
};
