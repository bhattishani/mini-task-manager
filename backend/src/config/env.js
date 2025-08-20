const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  mongoRootUri: process.env.MONGO_ROOT_URI,
  mongoAppDb: process.env.MONGO_APP_DB,
  mongoAppUser: process.env.MONGO_APP_USER,
  mongoAppPass: process.env.MONGO_APP_PASS,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  security: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10),
    lockTime: parseInt(process.env.LOCK_TIME_MINUTES, 10) * 60 * 1000,
  },
  clientUrl: process.env.CLIENT_URL,
}
