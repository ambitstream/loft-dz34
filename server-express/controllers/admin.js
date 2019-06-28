const fs = require('fs')
const path = require('path')
const util = require('util')
const access = util.promisify(fs.access)
const mkdir = util.promisify(fs.mkdir)
const unlink = util.promisify(fs.unlink)
const rename = util.promisify(fs.rename)
const db = require('../db/index.js')
const helpers = require('../utils/helpers')

module.exports = {
  getAdmin: (req, res) => {
    if (!req.session.isAuth) return res.redirect('/login')
    const skills = db.get('skills').value()
    res.render('admin', {
      msgfile: helpers.getMessageHelper(req, 'msgfile'),
      msgskill: helpers.getMessageHelper(req, 'msgskill'),
      skills
    })
  },
  updateSkills: (req, res) => {
    const { age, concerts, cities, years } = req.body

    if (!age || !concerts || !cities || !years) {
      req.flash('msgskill', 'All fields are required')
      return res.redirect('/admin')
    }
    let skills = db.get('skills').value()
    skills.age.number = age
    skills.concerts.number = concerts
    skills.cities.number = cities
    skills.years.number = years
    db.set('skills', skills).write()
    req.flash('msgskill', 'Skills updated')
    return res.redirect('/admin')
  },
  upload: async (req, res) => {
    const { name, price } = req.body
    const { photo } = req.files

    const { name: photoName, size, tempFilePath } = photo
    const uploadDir = path.join(process.cwd(), '/public/assets/img/products')
    const skills = db.get('skills').value()

    try {
      await access(uploadDir)
    } catch (e) {
      await mkdir(uploadDir)
    }

    if (!name || !price) {
      await unlink(tempFilePath)
      req.flash('msgfile', 'All fields are required')
      return res.redirect('/admin')
    }

    if (!photoName || !size) {
      await unlink(tempFilePath)
      req.flash('msgfile', 'File not saved')
      return res.redirect('/admin')
    }

    await rename(tempFilePath, path.join(uploadDir, photoName))

    db.get('products').push({
      'src': path.join('/assets/img/products', photoName),
      'name': name,
      'price': price
    }).write()

    req.flash('msgfile', 'Item added')
    return res.redirect('/admin')
  }
}
