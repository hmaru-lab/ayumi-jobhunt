const { expectedToken } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const passcode = (req.body && req.body.passcode) || '';
  const configured = process.env.SITE_PASSCODE;
  if (!configured) return res.status(500).json({ error: 'SITE_PASSCODE is not configured' });
  if (passcode !== configured) return res.status(401).json({ error: 'wrong passcode' });
  const token = expectedToken();
  res.setHeader(
    'Set-Cookie',
    `ayumi_auth=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`
  );
  return res.status(200).json({ ok: true });
};
