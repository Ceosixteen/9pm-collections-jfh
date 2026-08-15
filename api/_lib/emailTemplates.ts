// Branded HTML for transactional emails sent via Resend. Kept deliberately
// table-based / inline-styled since that's what survives most email client
// CSS sanitizers (Gmail, Outlook, etc. strip <style> blocks unpredictably).

const BRAND_PURPLE = '#B24BF3';
const LOGO_URL = 'https://jubafashionhub.link/images/juba_fashion_hub_logo.jpg';

function wrapEmailShell(previewText: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Juba Fashion Hub</title>
  </head>
  <body style="margin:0; padding:0; background-color:#FAF8FC; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8FC; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <img src="${LOGO_URL}" alt="Juba Fashion Hub" width="48" height="48" style="border-radius:10px; display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:#18181B;">
                <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.6;">
                  Juba Fashion Hub &middot; Juba, South Sudan<br />
                  WhatsApp / Call: +211 911 267 703
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildSignInEmailHtml(link: string): string {
  const body = `
    <h1 style="margin:0 0 12px 0; font-size:20px; font-weight:800; color:#0f172a;">Sign in to your account</h1>
    <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#475569;">
      Tap the button below to securely sign in to Juba Fashion Hub — no password needed. This link works once and expires shortly, so use it soon.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-radius:999px; background-color:${BRAND_PURPLE};">
          <a href="${link}" style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">
            Sign In to Juba Fashion Hub
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0 0; font-size:12px; line-height:1.6; color:#94a3b8;">
      Didn't request this? You can safely ignore this email — no changes were made to your account.
    </p>
    <p style="margin:16px 0 0 0; font-size:11px; line-height:1.6; color:#cbd5e1; word-break:break-all;">
      Or paste this link into your browser:<br />${link}
    </p>
  `;
  return wrapEmailShell('Your secure sign-in link for Juba Fashion Hub', body);
}
