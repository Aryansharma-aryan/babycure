require('dotenv').config({ quiet: true })

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

let server

const startServer = async () => {
  await connectDB()

  server = app.listen(PORT, () => {
    console.log(`BabyCure API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (error) => {
  console.error(`Unhandled rejection: ${error.message}`)
  if (server) {
    server.close(() => process.exit(1))
  } else {
    process.exit(1)
  }
})

process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.message}`)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully.')
  if (server) {
    server.close(() => process.exit(0))
  }
})
