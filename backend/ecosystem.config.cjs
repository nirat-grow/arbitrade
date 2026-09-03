module.exports = {
  apps: [{
    name: "ui-bot-backend",
    script: "./server.js",
    watch: false,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
