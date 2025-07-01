module.exports = {
  apps: [{
    name: "lukas_bag",
    script: "npx ts-node --transpile-only src/app.ts",
    env: {
      "NODE_ENV": "production"
    }
  }]
}