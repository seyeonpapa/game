// 국립국어원 표준국어대사전 API 프록시 (Netlify Function)
exports.handler = async (event) => {
  const API_KEY = process.env.STDICT_API_KEY;
  const API_URL = 'https://stdict.korean.go.kr/api/search.do';

  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'API key not configured' }),
    };
  }

  const params = event.queryStringParameters || {};
  const search = new URLSearchParams({
    key: API_KEY,
    q: params.q || '',
    req_type: 'json',
    advanced: params.advanced || 'y',
    method: params.method || 'exact',
    pos: params.pos || '1',
    num: params.num || '10',
  });

  try {
    const response = await fetch(`${API_URL}?${search}`);
    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
