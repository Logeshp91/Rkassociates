import nodemailer from 'nodemailer';

function readEnvValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasSmtpConfig() {
  return Boolean(
    readEnvValue(process.env.SMTP_HOST) &&
      readEnvValue(process.env.SMTP_PORT) &&
      readEnvValue(process.env.SMTP_USER) &&
      readEnvValue(process.env.SMTP_PASS)
  );
}

export async function sendEmail({ to, subject, text }) {
  if (!to) {
    throw new Error('Recipient email is required');
  }

  if (!hasSmtpConfig()) {
    throw new Error('SMTP is not configured');
  }

  const port = Number(readEnvValue(process.env.SMTP_PORT));

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('SMTP_PORT must be a valid port number');
  }

 const secure =
  ['true', 'ssl'].includes(
    readEnvValue(process.env.SMTP_SECURE).toLowerCase()
  );

// const transporter = nodemailer.createTransport({
//   host: readEnvValue(process.env.SMTP_HOST),
//   port,
//   secure,
//   auth: {
//     user: readEnvValue(process.env.SMTP_USER),
//     pass: readEnvValue(process.env.SMTP_PASS)
//   }
// });
const transporter = nodemailer.createTransport({
  host: readEnvValue(process.env.SMTP_HOST),
  port,
  secure,
  auth: {
    user: readEnvValue(process.env.SMTP_USER),
    pass: readEnvValue(process.env.SMTP_PASS)
  },
  logger: true,
  debug: true,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

  await transporter.sendMail({
    from: readEnvValue(process.env.SMTP_FROM) || readEnvValue(process.env.SMTP_USER),
    to: readEnvValue(to),
    subject,
    text
  });

  return true;
}
