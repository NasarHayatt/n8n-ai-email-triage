const source = $('Normalize Email').itemMatching($itemIndex).json;
const j = $input.item.json;

let text = j.content?.parts?.[0]?.text ?? j.text ?? j.output ?? '';
if (typeof text !== 'string') {
  text = JSON.stringify(text);
}
text = text.replace(/`{3}json/gi, '').replace(/`{3}/g, '').trim();

let ai = null;
try {
  ai = JSON.parse(text);
} catch (err) {
  ai = null;
}

const urgencyOk = ['urgent', 'normal', 'low'];
const categoryOk = ['support_issue', 'sales_lead', 'billing', 'feedback', 'spam', 'other'];
const sentimentOk = ['positive', 'neutral', 'negative'];

const valid =
  ai &&
  urgencyOk.includes(ai.urgency) &&
  categoryOk.includes(ai.category) &&
  sentimentOk.includes(ai.sentiment);

if (!valid) {
  return {
    json: {
      email_id: source.email_id,
      received_at: source.received_at,
      sender: source.sender,
      subject: source.subject,
      urgency: 'needs_review',
      category: 'other',
      sentiment: 'neutral',
      summary: 'AI answer was missing or invalid. Please read this email manually.',
      suggested_action: 'Read the email manually.',
      alert: 'yes'
    }
  };
}

return {
  json: {
    email_id: source.email_id,
    received_at: source.received_at,
    sender: source.sender,
    subject: source.subject,
    urgency: ai.urgency,
    category: ai.category,
    sentiment: ai.sentiment,
    summary: String(ai.summary ?? '').slice(0, 300),
    suggested_action: String(ai.suggested_action ?? '').slice(0, 300),
    alert: ai.urgency === 'urgent' ? 'yes' : 'no'
  }
};
