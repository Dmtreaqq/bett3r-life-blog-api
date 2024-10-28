import nodemailer from 'nodemailer'

export const emailService = {
    async sendEmail(body: string) {
        console.log("LOG FROM REAL EMAIL SERVICE")
    //     const transport = nodemailer.createTransport({
    //         service: 'mailjet',
    //         auth: {
    //             user: '237ea1fe21b0118ca64cf6e45251ce09',
    //             pass: 'e4358b7bf6778aa7c75de361beee41af'
    //         }
    //     })
    //
    //     const content = `
    //     <h1>Thank for your registration</h1>
    //         <p>To finish registration please follow the link below:
    //         <a href='https://modern-med.space/confirm-email?code=your_confirmation_code'>complete registration</a>
    //     </p>
    //     `
    //
    //     const info = await transport.sendMail({
    //         from: '"Dmytro Pavlov 👻" <dmytro@modern-med.space>', // sender address
    //         to: "dmtreaqq@gmail.com", // list of receivers
    //         subject: "Hello ✔", // Subject line
    //         text: "Hello world?", // plain text body
    //         html: content, // html body
    //     });

        // console.log('Email sent with info: ', info);
    }
}