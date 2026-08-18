const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3004,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    console.log('Testing /api/health endpoint...');
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.status}`);
    console.log(`Response: ${health.body}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
