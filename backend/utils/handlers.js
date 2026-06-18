const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.error(err && err.stack ? err.stack : err)
  } else {
    console.error(err)
  }
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  res.status(status).json({ message })
}

module.exports = { asyncHandler, errorHandler }
