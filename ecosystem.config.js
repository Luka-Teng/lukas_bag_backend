module.exports = {
  apps: [{
    name: "lukas_bag",
    script: "ts-node src/app.ts",
    env: {
      "NODE_ENV": "production"
    }
  }]
}