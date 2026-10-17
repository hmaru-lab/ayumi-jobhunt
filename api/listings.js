const { isAuthed } = require('../lib/auth');
const { loadListings, saveListings } = require('../lib/store');

function newId(listings) {
  const n = listings.length;
  return `u${Date.now().toString(36)}-${n}`;
}

module.exports = async (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: 'unauthorized' });

  if (req.method === 'GET') {
    try {
      const data = await loadListings();
      return res.status(200).json(data);
    } catch (e) {
      if (e.code === 'NO_BLOB') return res.status(503).json({ error: 'storage not configured' });
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.company || !b.position) {
      return res.status(400).json({ error: 'company and position are required' });
    }
    try {
      const data = await loadListings();
      const item = {
        id: newId(data.listings),
        category: b.category || '新着ウォッチ',
        company: b.company || '',
        business: b.business || '',
        position: b.position || '',
        salary: b.salary || '',
        location: b.location || '',
        remote: b.remote || '',
        requirements: b.requirements || '',
        fit: b.fit || '',
        url: b.url || '',
        status: '未検討',
        starred: false,
        caution: !!b.caution,
        memo: b.memo || '',
        addedAt: new Date().toISOString(),
      };
      data.listings.unshift(item);
      const saved = await saveListings(data.listings);
      return res.status(200).json({ ok: true, item, updatedAt: saved.updatedAt });
    } catch (e) {
      if (e.code === 'NO_BLOB') return res.status(503).json({ error: 'storage not configured' });
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'method not allowed' });
};
