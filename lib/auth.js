const crypto = require('crypto');

function expectedToken() {
  const p = process.env.SITE_PASSCODE;
  if (!p) return null;
  return crypto.createHmac('sha256', p).update('ayumi-job-board-auth-v1').digest('hex');
}

function getCookie(req, name) {
  const h = req.headers.cookie || '';
  const m = h.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function isAuthed(req) {
  const t = expectedToken();
  if (t && getCookie(req, 'ayumi_auth') === t) return true;
  const key = req.headers['x-api-key'];
  if (key && process.env.API_KEY && key === process.env.API_KEY) return true;
  return false;
}

module.exports = { isAuthed, expectedToken };
