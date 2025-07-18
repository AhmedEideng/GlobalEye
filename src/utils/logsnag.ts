export async function logSnagEvent(title: string, message: string) {
  await fetch("https://api.logsnag.com/v1/log", {
    method: "POST",
    headers: {
      Authorization: `Bearer cad3e695cfa7f93e19ed4b38ce9b11b2`,
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
}
