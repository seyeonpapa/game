const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const API_HOST = 'stdict.korean.go.kr';

// API 키 로드: 환경변수 우선, 없으면 .env.local 파일에서 읽기
function loadApiKey() {
  if (process.env.STDICT_API_KEY) return process.env.STDICT_API_KEY;
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/STDICT_API_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  return null;
}

const API_KEY = loadApiKey();

if (!API_KEY) {
  console.error('⚠️  API 키가 없습니다!');
  console.error('   .env.local 파일에 STDICT_API_KEY=xxx 형식으로 추가하세요.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // API 프록시: /api/search?q=...
  if (parsed.pathname === '/api/search') {
    const query = parsed.query;
    const params = new URLSearchParams({
      key: API_KEY,
      q: query.q || '',
      req_type: 'json',
      advanced: query.advanced || 'y',
      method: query.method || 'exact',
      pos: query.pos || '1',
      num: query.num || '10',
    });

    const apiUrl = `https://${API_HOST}/api/search.do?${params}`;

    https.get(apiUrl, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(data);
      });
    }).on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 정적 파일 서빙
  let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`서버 시작: http://localhost:${PORT}`);
  console.log('국립국어원 API 프록시 활성화');
});
