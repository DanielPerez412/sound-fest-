const pool = require("../config/database");

class PlaylistDAO {
  async getPublic() {
    const [rows] = await pool.execute(
      `SELECT
         Playlist.playlist_id AS id, Playlist.name, Playlist.description, Playlist.is_public,
         User.username AS owner_username,
         COUNT(PlaylistSong.song_id) AS track_count
       FROM Playlist
       JOIN User ON Playlist.user_id = User.user_id
       LEFT JOIN PlaylistSong ON Playlist.playlist_id = PlaylistSong.playlist_id
       WHERE Playlist.is_public = TRUE
       GROUP BY Playlist.playlist_id
       ORDER BY Playlist.creation_date DESC`
    );
    return rows;
  }

  async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT
         Playlist.playlist_id AS id, Playlist.name, Playlist.description, Playlist.is_public,
         COUNT(PlaylistSong.song_id) AS track_count
       FROM Playlist
       LEFT JOIN PlaylistSong ON Playlist.playlist_id = PlaylistSong.playlist_id
       WHERE Playlist.user_id = ?
       GROUP BY Playlist.playlist_id
       ORDER BY Playlist.creation_date DESC`,
      [userId]
    );
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT
         Playlist.playlist_id AS id, Playlist.name, Playlist.description, Playlist.is_public,
         Playlist.user_id, User.username AS owner_username
       FROM Playlist
       JOIN User ON Playlist.user_id = User.user_id
       WHERE Playlist.playlist_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async getSongs(playlistId) {
    const [rows] = await pool.execute(
      `SELECT
         Song.song_id AS id, Song.title, Artist.name AS artist_name, Song.genre,
         Song.duration_seconds, Song.audio_url, Song.cover_image,
         PlaylistSong.position
       FROM PlaylistSong
       JOIN Song ON Song.song_id = PlaylistSong.song_id
       LEFT JOIN Artist ON Artist.artist_id = Song.artist_id
       WHERE PlaylistSong.playlist_id = ?
       ORDER BY PlaylistSong.position ASC`,
      [playlistId]
    );
    return rows;
  }

  async create({ userId, name, description, isPublic = true }) {
    const [result] = await pool.execute(
      "INSERT INTO Playlist (name, description, is_public, user_id) VALUES (?, ?, ?, ?)",
      [name, description || null, isPublic, userId]
    );
    return this.getById(result.insertId);
  }

  async update(id, { name, description, isPublic }) {
    const [result] = await pool.execute(
      `UPDATE Playlist SET
         name = COALESCE(?, name),
         description = COALESCE(?, description),
         is_public = COALESCE(?, is_public)
       WHERE playlist_id = ?`,
      [name || null, description || null, isPublic === undefined ? null : isPublic, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Playlist WHERE playlist_id = ?", [id]);
    return result.affectedRows > 0;
  }

  async addSong(playlistId, songId) {
    const [existingRows] = await pool.execute(
      "SELECT 1 FROM `PlaylistSong` WHERE playlist_id = ? AND song_id = ?",
      [playlistId, songId]
    );
    if (existingRows.length) return false;

    const [countRows] = await pool.execute(
      "SELECT COUNT(*) AS count FROM PlaylistSong WHERE playlist_id = ?",
      [playlistId]
    );
    await pool.execute(
      "INSERT INTO `PlaylistSong` (playlist_id, song_id, position) VALUES (?, ?, ?)",
      [playlistId, songId, countRows[0].count + 1]
    );
    return true;
  }

  async removeSong(playlistId, songId) {
    const [result] = await pool.execute(
      "DELETE FROM PlaylistSong WHERE playlist_id = ? AND song_id = ?",
      [playlistId, songId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new PlaylistDAO();
