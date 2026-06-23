interface SendPasswordResetEmailInput {
  to: string;
  name: string;
  resetUrl: string;
}

interface SendEmailVerificationInput {
  to: string;
  name: string;
  verificationUrl: string;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Mọt Chạm <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, reason: "missing_resend_api_key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("SEND_EMAIL_ERROR", detail);
    return { sent: false, reason: "resend_error" };
  }

  return { sent: true };
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendPasswordResetEmailInput) {
  return sendEmail({
    to,
    subject: "Đặt lại mật khẩu Mọt Chạm",
    html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2>Xin chào ${escapeHtml(name)},</h2>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Mọt Chạm.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
              Đặt lại mật khẩu
            </a>
          </p>
          <p>Liên kết này có hiệu lực trong 30 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        </div>
      `,
  });
}

export async function sendEmailVerification({
  to,
  name,
  verificationUrl,
}: SendEmailVerificationInput) {
  return sendEmail({
    to,
    subject: "Xác minh email Mọt Chạm",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Xin chào ${escapeHtml(name)},</h2>
        <p>Hãy xác minh email để kích hoạt tài khoản Mọt Chạm.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
            Xác minh email
          </a>
        </p>
        <p>Liên kết này có hiệu lực trong 24 giờ. Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
