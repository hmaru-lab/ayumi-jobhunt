const { isAuthed } = require('../lib/auth');

module.exports = async (req, res) => {
  return res.status(200).json({ authenticated: isAuthed(req) });
};
