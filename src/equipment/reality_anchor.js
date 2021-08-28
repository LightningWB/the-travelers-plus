const {emit, players, util, chunks, options, generateTileAt} = require('../bullet');

module.exports.placed = function(reality_anchor, player) {
  reality_anchor.private.owner = player.public.username;
  player.private.respawnPoint = { x: reality_anchor.public.x, y: reality_anchor.public.y };
}

module.exports.broke = function(reality_anchor, _player) {
  const owner = players.getPlayerByUsername(reality_anchor.private.owner);
  if (owner && owner.private.respawnPoint.x === reality_anchor.public.x && owner.private.respawnPoint.y === reality_anchor.public.y)
  {
    owner.private.respawnPoint = undefined;
  }
}