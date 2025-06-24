// 環境変数設定例
// .envファイルをルートディレクトリに作成して以下の値を設定してください

export const configExample = {
  // Server Configuration
  NODE_ENV: 'development',
  PORT: 3000,

  // LINE Bot Configuration
  LINE_CHANNEL_SECRET: 'your_channel_secret_here',
  LINE_CHANNEL_ACCESS_TOKEN: 'your_channel_access_token_here',

  // Database Configuration
  DATABASE_URL: 'postgresql://user:password@localhost:5432/linebot_db',
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USERNAME: 'linebot_user',
  DB_PASSWORD: 'your_db_password',
  DB_NAME: 'linebot_db',

  // Redis Configuration (for caching)
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',

  // Frontend URL
  FRONTEND_URL: 'http://localhost:3001',

  // JWT Secret (for authentication if needed)
  JWT_SECRET: 'your_jwt_secret_here',

  // Webhook URL (for development)
  WEBHOOK_URL: 'https://your-domain.com/api/v1/webhook',
}; 