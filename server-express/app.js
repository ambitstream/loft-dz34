const express = require('express')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const flash = require('express-flash')

const app = express()

app.set('views', path.join(process.cwd(), '/source/template/pages/'))
app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(process.cwd(), '/public')
}))
app.use(session({
  key: 'user_sid',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000
  }
}))
app.use(flash())
app.use(express.static(path.join(process.cwd(), '/public')))

app.use('/', require('./routes/index'))

app.use((req, res, next) => {
    let err = new Error('Not Found')

    err.status = 404
    next(err)
});

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', { status: res.statusCode, error: err.message })
})

app.listen('3000', () => {
  console.log('Server running on port 3000')
})
