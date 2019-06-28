module.exports = {
  getMessageHelper: (req, key) => {
    const messages = req.flash(key)
    return typeof messages === 'object' && messages.length ? messages[0] : null
  }
}
