module.exports = {
  apps: [
    {
      name: 'se2-backend-23',
      script: 'npm',
      args: 'start',
      env: {PORT: 3023,
           SERVER_SECRET: "E0E9216DB2930B84D90C0EC8C6E36A3E2EBF6201978EDDE6FF3C5E59EBBA1D",
           MONGODB_URI: "mongodb+srv://seii:seii@seii.r6skzxe.mongodb.net/group_23?retryWrites=true&w=majority",
           PLATFORM_URI: "http://localhost:3023",
           SERVER_URI: "http://localhost:3023",
           SERVER_EMAIL: "karanikio@auth.gr",
           SENDGRID_API_KEY: "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"
           },
    },
  ],
};
