module.exports = {
  apps: [
    {
      name: 'foodhub',
      script: 'backend/server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      kill_timeout: 10000,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
