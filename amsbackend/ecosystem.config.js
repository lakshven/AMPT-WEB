
module.exports = {
  apps: [
    {
      name: "AMPT-backend",
      script: "dist/index.js",
      cwd: "/home/ECSL/AMPT-WEB/amsbackend",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        KEYVAULT_URL: "https://ecslkeyvault.vault.azure.net",
        PGSSL: "1"
      },
      error_file: "/root/.pm2/logs/AMPT-backend-error.log",
      out_file: "/root/.pm2/logs/AMPT-backend-out.log",
      merge_logs: true,
      max_memory_restart: "500M"
    }
  ]
};
