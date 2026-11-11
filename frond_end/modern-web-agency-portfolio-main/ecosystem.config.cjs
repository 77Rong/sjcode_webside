module.exports = {
  apps: [
    {
      name: 'srweb',
      script: 'node_modules/next/dist/bin/next',
      args: 'dev',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
