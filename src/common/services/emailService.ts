import nodemailer from "nodemailer";
import { CONFIG } from "../utils/config";

const transport = nodemailer.createTransport({
  service: "mailjet",
  auth: {
    user: CONFIG.MAILJET_API_KEY,
    pass: CONFIG.MAILJET_SECRET_KEY,
  },
});

export const emailService = {
  // async sendEmail(htmlContent: string, toEmail: string) {
  //     console.log("LOG FROM REAL EMAIL SERVICE")
  //
  //     const info = await transport.sendMail({
  //         from: '"Dmytro Pavlov 👻" <dmytro@modern-med.space>',
  //         to: toEmail,
  //         subject: "Hello ✔",
  //         text: "Hello world?",
  //         html: htmlContent,
  //     });
  //
  //     console.log('Email sent with info: ', info);
  // },

  async sendConfirmationEmail(confirmCode: string, toEmail: string) {
    const content = `
        <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='https://somesite.com/confirm-email?code=${confirmCode}'>complete registration</a>
        </p>
        `;

    const info = await transport.sendMail({
      from: '"Dmytro Pavlov 👻" <dmytro@modern-med.space>',
      to: toEmail,
      subject: "Blog - Confirm Email ✔",
      text: "Welcome to BetterLifeBlog",
      html: content,
    });

    console.log("Email sent with info: ", info);
  },

  async sendRecoverPasswordEmail(recoveryCode: string, toEmail: string) {
    const content = `
      <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
        </p>
      `;

    const info = await transport.sendMail({
      from: '"Dmytro Pavlov 👻" <dmytro@modern-med.space>',
      to: toEmail,
      subject: "Blog - Recover Password ✔",
      text: "Welcome to BetterLifeBlog",
      html: content,
    });

    console.log("Email sent with info: ", info);
  },
};
