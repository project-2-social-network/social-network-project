const nodemailer = require("nodemailer");
const template = require("../templates/mail.template");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NM_USER,
    pass: process.env.NM_PASSWORD
  }
})

module.exports.sendActivationMail = (email, token) => {
  transporter.sendMail({
    from: `BeCapy <${process.env.NM_USER}>`,
    to: email,
    subject: "Thanks for joining us",
    html: template.generateEmail(token)
  })
}

module.exports.sendHelpEmail = (emailToSend, text) => {
  transporter.sendMail({
    from: `BeCapy <${process.env.NM_USER}>`,
    to: 'becapyorg@gmail.com, marinaolboni@gmail.com, marina.blasongraviz@gmail.com',
    subject: emailToSend,
    html: text
  })
}