const pool = require("../config/database");

// The supplied schema has no Activity table. Plays are recorded in Song.play_count.
class ActivityDAO {
  async logPlay(_userId, songId) {
    const [result] = await pool.execute(
      "UPDATE `Song` SET play_count = COALESCE(play_count, 0) + 1 WHERE song_id = ?",
      [songId]
    );
    return result.affectedRows > 0;
  }

  async getTopSongsForUser(_userId, limit = 10) {
    return this.getTopSongsGlobal(limit);
  }

  async getTopSongsGlobal(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT Song.song_id AS id, Song.title, Artist.name AS artist_name, Song.play_count
       FROM \`Song\` Song LEFT JOIN \`Artist\` Artist ON Artist.artist_id = Song.artist_id
       ORDER BY Song.play_count DESC LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  }

  async getMonthlyStatsForUser(_userId) {
    return { tiempoMinutos: 0, canciones: 0, racha: 0 };
  }

  async getRecentActivity(limit = 10) {
    return this.getTopSongsGlobal(limit);
  }
}

module.exports = new ActivityDAO();
