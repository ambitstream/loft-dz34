const Router = require('koa-router')
const router = new Router()
const fs = require('fs')
const path = require('path')

const helpers = require('../utils/helpers')
const config = require('../config/config.json')
const nodemailer = require('nodemailer')
const db = require('../db/index.js')
const util = require('util')
const access = util.promisify(fs.access)
const mkdir = util.promisify(fs.mkdir)
const unlink = util.promisify(fs.unlink)
const rename = util.promisify(fs.rename)

router.get('/', async (ctx) => {
  try {
    const data = {
      msgsemail: helpers.getMessageHelper(ctx, 'msgsemail'),
      products: db.get('products').value(),
      skills: db.get('skills').value()
    }
    ctx.render('index', data)
  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

router.post('/', async (ctx) => {
  try {
    const { name, email, message } = ctx.request.body
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
      await transporter.sendMail(mailOptions, (err, info) => {
        if (!err) {
          ctx.flash.set({msgsemail: 'Email sent'})
        } else {
          ctx.flash.set({msgsemail: 'Error while sending email'})
        }
      })
      return ctx.redirect('/')
    } else {
      ctx.flash.set({msgsemail: 'Name and Email fields are required'})
      return ctx.redirect('/')
    }
  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

router.get('/admin', async (ctx) => {
  try {
    if (!ctx.session.isAuth) return ctx.redirect('/login')
    const data = {
      skills: db.get('skills').value(),
      msgfile: helpers.getMessageHelper(ctx, 'msgfile'),
      msgskill: helpers.getMessageHelper(ctx, 'msgskill')
    }
    ctx.render('admin', data)
  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

router.post('/admin/upload', async (ctx) => {
  try {
    const { name, price } = ctx.request.body
    const { photo } = ctx.request.files
    const { name: photoName, size, path: tempFilePath } = photo
    const uploadDir = path.join(process.cwd(), '/public/assets/img/products')

    try {
      await access(uploadDir)
    } catch (e) {
      await mkdir(uploadDir)
    }
    if (!name || !price || !photoName) {
      await unlink(tempFilePath)
      ctx.flash.set({msgfile: 'All fields are required'})
      return ctx.redirect('/admin')
    }

    if (!photoName || !size) {
      await unlink(tempFilePath)
      ctx.flash.set({msgfile: 'File not saved'})
      return ctx.redirect('/admin')
    }

    await rename(tempFilePath, path.join(uploadDir, photoName))

    db.get('products').push({
      'src': '/assets/img/products/' + photoName,
      'name': name,
      'price': price
    }).write()

    ctx.flash.set({msgfile: 'Item added'})
    ctx.redirect('/admin')

  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

router.post('/admin/skills', async (ctx) => {
  try {
    const { age, concerts, cities, years } = ctx.request.body

    if (!age || !concerts || !cities || !years) {
      ctx.flash.set({msgskill: 'All fields are required'})
      return ctx.redirect('/admin')
    }
    let skills = db.get('skills').value()
    skills.age.number = age
    skills.concerts.number = concerts
    skills.cities.number = cities
    skills.years.number = years
    db.set('skills', skills).write()
    ctx.flash.set({msgskill: 'Skills updated'})
    ctx.redirect('/admin')

  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

router.get('/login', async (ctx) => {
  try {
    const data = {
      msgslogin: helpers.getMessageHelper(ctx, 'msgslogin')
    }
    ctx.render('login', data)
  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

router.post('/login', async (ctx) => {
  try {
    const { email, password } = ctx.request.body
    if (email !== 'admin@admin.com' || password !== 'admin') {
      errorText = 'Incorrect credemtials'
    } else {
      ctx.session.isAuth = true
      return ctx.redirect('/admin')
    }

    if (!email || !password)
      errorText = 'Email and password are required'

    ctx.flash.set({msgslogin: errorText})
    return ctx.redirect('/login')
  } catch (err) {
    console.log('err', err)
    ctx.status = 404
  }
})

module.exports = router
