// import nodemailer from 'nodemailer';

// function readEnvValue(value) {
//   return typeof value === 'string' ? value.trim() : '';
// }

// function hasSmtpConfig() {
//   return Boolean(
//     readEnvValue(process.env.SMTP_HOST) &&
//       readEnvValue(process.env.SMTP_PORT) &&
//       readEnvValue(process.env.SMTP_USER) &&
//       readEnvValue(process.env.SMTP_PASS)
//   );
// }

// export async function sendEmail({ to, subject, text }) {
//   if (!to) {
//     throw new Error('Recipient email is required');  console.log("Recipient:", to);

//   console.log({
//     SMTP_HOST: process.env.SMTP_HOST,
//     SMTP_PORT: process.env.SMTP_PORT,
//     SMTP_SECURE: process.env.SMTP_SECURE,
//     SMTP_USER: process.env.SMTP_USER,
//     SMTP_FROM: process.env.SMTP_FROM,
//     SMTP_PASS_EXISTS: !!process.env.SMTP_PASS
//   });
//   }

//   if (!hasSmtpConfig()) {
//     throw new Error('SMTP is not configured');
//   }

//   const port = Number(readEnvValue(process.env.SMTP_PORT));

//   if (!Number.isInteger(port) || port <= 0) {
//     throw new Error('SMTP_PORT must be a valid port number');
//   }

//  const secure =
//   ['true', 'ssl'].includes(
//     readEnvValue(process.env.SMTP_SECURE).toLowerCase()
//   );

// const transporter = nodemailer.createTransport({
//   host: readEnvValue(process.env.SMTP_HOST),
//   port,
//   secure,
//   auth: {
//     user: readEnvValue(process.env.SMTP_USER),
//     pass: readEnvValue(process.env.SMTP_PASS)
//   }
// });

//   await transporter.sendMail({
//     from: readEnvValue(process.env.SMTP_FROM) || readEnvValue(process.env.SMTP_USER),
//     to: readEnvValue(to),
//     subject,
//     text
//   });

//   return true;
// }
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

// create transporter ONCE (important for production)
const transporter = nodemailer.createTransport({
  host: readEnvValue(process.env.SMTP_HOST),
  port: Number(readEnvValue(process.env.SMTP_PORT)),
  secure: ['true', 'ssl'].includes(
    readEnvValue(process.env.SMTP_SECURE).toLowerCase()
  ),
  auth: {
    user: readEnvValue(process.env.SMTP_USER),
    pass: readEnvValue(process.env.SMTP_PASS)
  },
  connectionTimeout: 20000,
  socketTimeout: 20000
});

export async function sendEmail({ to, subject, text }) {
  console.log("📧 sendEmail called");
  console.log("Recipient:", to);

  console.log({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_PASS_EXISTS: !!process.env.SMTP_PASS
  });

  if (!to) {
    throw new Error('Recipient email is required');
  }

  if (!hasSmtpConfig()) {
    throw new Error('SMTP is not configured');
  }

  await transporter.sendMail({
    from: readEnvValue(process.env.SMTP_FROM) || readEnvValue(process.env.SMTP_USER),
    to: readEnvValue(to),
    subject,
    text
  });

  return true;
}