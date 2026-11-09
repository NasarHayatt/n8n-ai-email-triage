# AI Email Triage (n8n + Gemini)

A self-hosted n8n workflow that reads new email, classifies it with an LLM, validates the answer, logs it, and alerts on urgent items. I built it to practise reliable LLM workflows: structured output, validation, retries and safe failure.

Demo (32 s, test emails only): [demo.mp4](demo.mp4)

**Want it ready to import?** The complete workflow file plus a step-by-step setup guide is available here: [AI Email Triage for n8n on Gumroad](https://nasarhayatt.gumroad.com/l/n8n-ai-email-triage). Running in about 15 minutes. More ready-to-import n8n templates (lead qualifier, invoice extractor, resume screener, RAG chatbot and others): [nasarhayatt.gumroad.com](https://nasarhayatt.gumroad.com).

## How it works

1. **Get Email** (IMAP trigger) fetches each new message.
2. **Normalize Email** (Code, [normalize-email.js](normalize-email.js)) cleans HTML, links and whitespace and cuts the body to 3000 characters.
3. **Classify Email** (Google Gemini, "Message a model") returns one JSON object. The rules are in [system-prompt.txt](system-prompt.txt): fixed keys and allowed values, JSON only, and an exact definition of "urgent" (something is broken, money is being lost now, or a deadline within 24 hours).
4. **Parse AI Result** (Code, [parse-ai-result.js](parse-ai-result.js)) parses and validates the answer. If the model fails or answers badly, the email is logged as `needs_review` so nothing is lost.
5. **Log to Table** writes every result to an n8n data table.
6. **Is Urgent?** sends an email alert for urgent or `needs_review` items.

Output per email: urgency (urgent, normal, low), category (support_issue, sales_lead, billing, feedback, spam, other), sentiment, a one-sentence summary and a suggested action.

## Reliability

- Retry on fail: 5 tries, 8 seconds apart, then continue on error with the `needs_review` fallback.
- The model output is never trusted: keys and values are checked in code.
- Run history in the Executions tab shows what happened for each email.

## What I found while running it

- Some Gemini model names appear in the list but no longer work. On my key, 2.5 Flash and 2.5 Flash-Lite returned 404, Flash Latest and 3.1 Flash Lite returned 503 (overloaded), and 3.5 Flash Lite worked. The runs showed as succeeded while every email was logged `needs_review`, which I only noticed by reading the run log. That is why the fallback exists and why the log matters.
- Sending the alert to the watched mailbox would loop, so alerts go to a different address.

## Limits (honest notes)

- Tested with a small set of mixed emails (urgent, sales lead, billing, praise, spam), checked by hand against what a person would pick. It is not a benchmark.
- Alerts go by email. A Telegram branch exists on the canvas but my network blocks the Telegram API, so I do not rely on it.
- Credentials (Gemini key, IMAP and SMTP app passwords) live in n8n and are not in this repo.

Runs on n8n 2.46 in Docker: official image, named volume, port bound to localhost, restart policy `unless-stopped`.
