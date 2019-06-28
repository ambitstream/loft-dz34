const path = require('path')
const helpers = require('../utils/helpers')
const config = require('../config/config.json')
const nodemailer = require('nodemailer')
const db = require('../db/index.js')

module.exports = {
  getIndex: (req, res) => {
    const data = {
      msgsemail: helpers.getMessageHelper(req, 'msgsemail'),
      products: db.get('products').value(),
      skills: db.get('skills').value()
    }
    res.render('index', data)
  },
  postFormData: (req, res) => {
    const { name, email, message } = req.body
    if (name && email) {
      const transporter = nodemailer.createTransport(config.mail.smtp)
      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: config.mail.smtp.auth.user,
        subject: config.mail.subject,
        text:
          message.trim().slice(0, 500) +
          `\n Отправлено с: <${email}>`
      }
      transporter.sendMail(mailOptions, (err, info) => {
        if (!err) {
          req.flash('msgsemail', 'Email sent')
        } else {
          req.flash('msgsemail', 'Error while sending email')
        }
        res.redirect('/#contactForm')
      })
    } else {
      req.flash('msgsemail', 'Name and Email fields are required')
      res.redirect('/#contactForm')
    }
  }
}
