import "dotenv/config";

export async function SendOtpMail(normalizedEmail, otp) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY is missing");
      return false;
    }
    if (!normalizedEmail || !otp) {
      console.error("Email or OTP is missing");
      return false;
    }

    console.log("Sending OTP to:", normalizedEmail);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Nestro",
          email: process.env.EMAIL_KEY, // must be the email you verified/added as a sender in Brevo
        },
        to: [{ email: normalizedEmail }],
           subject: "JWT Auth - Verify Your Email",
        textContent: `Your JWT Auth verification code is ${otp}. It expires in 3 minutes. If you did not create an account, you can ignore this email.`,
        htmlContent: `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <meta name="color-scheme" content="light">
              <title>Verify your email</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;">
                <tr>
                  <td align="center" style="padding:40px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                      <tr>
                        <td align="center" style="padding:30px 24px;background-color:#16a34a;background-image:linear-gradient(135deg,#22c55e,#2563eb);">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" width="48" height="48" style="width:48px;height:48px;border-radius:24px;background-color:#ffffff;color:#16a34a;font-size:24px;font-weight:bold;">J</td>
                            </tr>
                          </table>
                          <p style="margin:12px 0 0;color:#ffffff;font-size:20px;line-height:28px;font-weight:bold;">JWT Auth</p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:32px 32px 12px;">
                          <h1 style="margin:0;color:#111827;font-size:24px;line-height:32px;font-weight:700;">Verify your email</h1>
                          <p style="margin:12px 0 0;color:#6b7280;font-size:15px;line-height:24px;">Use this one-time code to finish creating your account.</p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:16px 32px 8px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
                            <tr>
                              <td align="center" style="padding:16px 28px;color:#166534;font-size:32px;line-height:40px;font-weight:700;letter-spacing:10px;">${otp}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:12px 32px 28px;">
                          <p style="margin:0;color:#6b7280;font-size:14px;line-height:22px;">This code expires in <strong style="color:#374151;">3 minutes</strong>.</p>
                          <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;line-height:20px;">If you didn't request an account, you can safely ignore this email.</p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:18px 24px;border-top:1px solid #e5e7eb;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:18px;">JWT Auth · Secure sign-in for your account</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo Error:", data);
      return false;
    }

    console.log("OTP email sent successfully:", data.messageId);
    return true;
  } catch (error) {
    console.error("Email Error:", {
      message: error.message,
    });
    return false;
  }
}
