const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 8001 });
    console.log("Tunnel URL:", tunnel.url);
    fs.writeFileSync('backend_url.txt', tunnel.url);
  } catch (err) {
    console.error(err);
  }
})();
