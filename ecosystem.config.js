module.exports = {
  apps: [{
    name: "red_book",
    script: "./dist/app.js",
    env: {
      "NODE_ENV": "production"
    }
  }]
}