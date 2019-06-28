const helpers = require('../utils/helpers')
const db = require('../db/index.js')

module.exports = {
  getLogin: (req, res) => {
    // if (!req.session.isAuth) return res.redirect('/admin')
    res.render('login', {
      msgslogin: helpers.getMessageHelper(req, 'msgslogin')
    })
  },
  auth: (req, res) => {
    const { email, password } = req.body
    let errorText

    if (req.session.isAuth) {
      return res.redirect('/admin')
    }

    if (email !== 'admin@admin.com' || password !== 'admin') {
      errorText = 'Incorrect credemtials'
    } else {
      req.session.isAuth = true
      return res.redirect('/admin')
    }

    if (!email || !password)
      errorText = 'Email and password are required'

    req.flash('msgslogin', errorText)
    return res.redirect('/login')

  }
}
