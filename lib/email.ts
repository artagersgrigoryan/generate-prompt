import type { EmailConfig } from "next-auth/providers/email";

const BRAND = "Website Prompt Generator";

/**
 * Custom magic-link email for the Auth.js Resend provider.
 *
 * Why custom instead of the built-in template:
 * - The default Auth.js email is a near-empty one-button table that Gmail
 *   flags as "similar to spam". A branded email with real copy + a plain-text
 *   alternative scores far better with spam filters.
 * - The subject/body should reference the brand, not the raw host (which is
 *   "localhost:3000" in dev and looks like phishing).
 *
 * Deliverability also depends on DNS (SPF + DKIM are set by Resend on domain
 * verification; add a DMARC record yourself) and domain reputation/warmup —
 * those can't be fixed here.
 */
export async function sendVerificationRequest(params: {
  identifier: string;
  url: string;
  provider: EmailConfig;
}) {
  const { identifier: to, url, provider } = params;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: `Sign in to ${BRAND}`,
      html: html(url),
      text: text(url),
    }),
  });

  if (!res.ok) {
    throw new Error("Resend error: " + JSON.stringify(await res.json()));
  }
}

function html(url: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign in to ${BRAND}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:16px;padding:40px 36px;">
            <tr>
              <td style="font-size:18px;font-weight:600;color:#171717;padding-bottom:8px;">
                ${BRAND}
              </td>
            </tr>
            <tr>
              <td style="font-size:22px;font-weight:700;color:#171717;padding-bottom:12px;">
                Sign in to your account
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#525252;padding-bottom:28px;">
                Click the button below to securely sign in. This link will expire in 24&nbsp;hours and can only be used once.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:28px;">
                <a href="${url}" style="display:inline-block;background-color:#000000;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;">
                  Sign in
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.6;color:#737373;padding-bottom:8px;">
                Or copy and paste this link into your browser:
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.6;color:#525252;word-break:break-all;padding-bottom:28px;">
                <a href="${url}" style="color:#525252;">${url}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.6;color:#a3a3a3;border-top:1px solid #e5e5e5;padding-top:20px;">
                If you didn't request this email, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function text(url: string) {
  return `Sign in to ${BRAND}

Click the link below to securely sign in. This link expires in 24 hours and can only be used once.

${url}

If you didn't request this email, you can safely ignore it.`;
}
