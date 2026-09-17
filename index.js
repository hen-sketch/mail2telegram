export default {
  async email(message, env, ctx) {
    const raw = await new Response(message.raw).text();

    const splitIndex = raw.indexOf("\r\n\r\n") > -1
      ? raw.indexOf("\r\n\r\n")
      : raw.indexOf("\n\n");

    const headers = splitIndex > -1 ? raw.slice(0, splitIndex) : raw;
    let body = splitIndex > -1 ? raw.slice(splitIndex + 4) : "";

    const getHeader = (name) => {
      const m = headers.match(new RegExp(`^${name}:\\s*(.*)$`, "im"));
      return m ? m[1].trim() : "";
    };

    const subject = getHeader("Subject") || "(no subject)";
    const from = getHeader("From") || message.from;
    const to = getHeader("To") || message.to;

    if (body.length > 3000) body = body.slice(0, 3000) + "\n...(truncated)";

    const text = [
      `📧 ${subject}`,
      "",
      `From: ${from}`,
      `To: ${to}`,
      "",
      "---",
      "",
      body,
    ].join("\n");

    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_ID, text }),
    });
  },
};
