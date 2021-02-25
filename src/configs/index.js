import dotenv from 'dotenv'

const envFound = dotenv.config()

if (envFound.error) {
  throw new Error('Could not find .env file')
}

const hostConfig = {
  apiPrefix: process.env.API_PREFIX,
  apiPort: parseInt(process.env.HTTP_PORT, 10),
  proxyPort: parseInt(process.env.NGINX_PORT, 10),
  publicIp: process.env.PUBLIC_IP,
}

const databaseConfig = {
  databaseHost: process.env.MONGODB_HOST,
  databaseUsername: process.env.MONGODB_USERNAME,
  databasePassword: process.env.MONGODB_PASSWORD,
  databaseName: process.env.DATABASE_NAME,
}

const videoConfig = {
  pathVideo: process.env.VIDEO_FOLDER,
  replacePathVideo: process.env.VIDEO_FILE_PREFIX,
  limitPerPage: process.env.LIMIT_PER_PAGE,
}

export const config = {
  env: process.env.NODE_ENV,
  ...hostConfig,
  ...databaseConfig,
  ...videoConfig,
}
