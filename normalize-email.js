// n8n Code node, mode "Run Once for Each Item".
// Turns whatever the IMAP trigger returns into one clean shape: email_id, sender, subject, body, received_at.
const j = $json;
const meta = j.metadata || j.headers || {};

let sender = '';
const from = j.from ?? meta.from;
if (typeof from === 'string') sender = from;
else if (from && from.text) sender = from.text;
else if (from) sender = JSON.stringify(from);

const subject = String(j.subject ?? meta.subject ?? '(no subject)');
const received = String(j.date ?? meta.date ?? new Date().toISOString());
const id = String(j.uid ?? j.messageId ?? j.id ?? meta['message-id'] ?? (subject + '|' + received));

let body = j.body ?? j.textPlain ?? j.text ?? '';
if (!body && j.textHtml) {
  body = String(j.textHtml)
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}
body = String(body)
  .replace(/https?:\/\/\S+/g, '[link]')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 3000);

return { json: { email_id: id, sender, subject, body, received_at: received } };
