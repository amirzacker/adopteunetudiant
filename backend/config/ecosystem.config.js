module.exports = {
  apps: [{
    name: 'adopte-etudiant-api',
    script: '../www/app.js',
    instances: 3,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
