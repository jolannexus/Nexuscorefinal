module.exports = {
  apps: [
    {
      name: 'nexuscore-api',
      script: 'node',
      args: 'dist/server.cjs',
      instances: 'max', // Scale dynamically to utilize all available CPU cores
      exec_mode: 'cluster', // Enables clustering for high performance/availability
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      exp_backoff_restart_delay: 100
    }
  ]
};
