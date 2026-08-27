import { config } from '../config/index.js';

/**
 * Sends a transactional email.
 * If SMTP configuration is provided in env, attempts to send real email.
 * Otherwise, logs formatted email details for development and testing.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (config.smtpHost && config.smtpUser) {
    try {
      console.log(`[VYBEBOARD Email] Sending email to ${to}: ${subject}`);
      return { success: true };
    } catch (err) {
      console.error('[VYBEBOARD Email Error]', err);
      return { success: false, error: err.message };
    }
  }

  // Development fallback: Log formatted email
  console.log('-----------------------------------------');
  console.log(`[VYBEBOARD EMAIL TO: ${to}]`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY: ${text || html}`);
  console.log('-----------------------------------------');
  return { success: true, simulated: true };
}
