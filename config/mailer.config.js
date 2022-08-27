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
    from: `Social Network <${process.env.NM_USER}>`,
    to: email,
    subject: "Thanks for joining us",
    html: template.generateEmail(token)
  })
}