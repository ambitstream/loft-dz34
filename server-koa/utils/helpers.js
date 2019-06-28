module.exports = {
  getMessageHelper: (ctx, key) => ctx.flash && ctx.flash.get() ? ctx.flash.get()[key] : null
}
