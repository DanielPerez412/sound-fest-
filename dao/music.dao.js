const pool = require("../config/database");

class MusicDAO {
  // ---------- Songs ----------

  async getAll({ search, genre } = {}) {
    const clauses = [];
    const params = [];

    if (search) {
      clauses.push("(Song.title LIKE ? OR Artist.name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (genre) {
      clauses.push("Song.genre = ?");
      params.push(genre);
    }

    const where = clauses.length ? "WHERE " + clauses.join(" AND ") : "";

    const sql = `
      SELECT
        Song.song_id AS id,
        Song.title,
        Artist.artist_id,
        Artist.name AS artist_name,
        Song.genre,
        Song.duration_seconds,
        Song.audio_url,
        Song.cover_image,
        Song.play_count
      FROM Song
      LEFT JOIN Artist ON Song.artist_id = Artist.artist_id
      ${where}
      ORDER BY Song.play_count DESC
      LIMIT 200`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT
         Song.song_id AS id, Song.title, Artist.artist_id, Artist.name AS artist_name,
         Song.genre, Song.duration_seconds, Song.audio_url, Song.cover_image, Song.play_count
       FROM Song
       LEFT JOIN Artist ON Song.artist_id = Artist.artist_id
       WHERE Song.song_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async getGenres() {
    const [rows] = await pool.execute(
      "SELECT DISTINCT genre FROM Song WHERE genre IS NOT NULL ORDER BY genre"
    );
    return rows.map((r) => r.genre);
  }

  async incrementPlayCount(id) {
    const [result] = await pool.execute(
      "UPDATE `Song` SET play_count = COALESCE(play_count, 0) + 1 WHERE song_id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  async create({ title, artistId, genre, durationSeconds, audioUrl, coverImage }) {
    const [result] = await pool.execute(
      `INSERT INTO \`Song\` (title, artist_id, genre, duration_seconds, audio_url, cover_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, artistId || null, genre || null, durationSeconds || 200, audioUrl || null, coverImage || null]
    );
    return this.getById(result.insertId);
  }

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM Song");
    return rows[0].total;
  }

  async getAllArtists() {
    const [rows] = await pool.execute("SELECT * FROM Artist ORDER BY name ASC");
    return rows;
  }

  async getArtistById(id) {
    const [rows] = await pool.execute("SELECT * FROM Artist WHERE artist_id = ?", [id]);
    return rows[0] || null;
  }

  async createArtist({ name, biography, imageUrl }) {
    const [result] = await pool.execute(
      "INSERT INTO Artist (name, biography, image_url) VALUES (?, ?, ?)",
      [name, biography || null, imageUrl || null]
    );
    return this.getArtistById(result.insertId);
  }

  async countArtists() {
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM Artist");
    return rows[0].total;
  }
}

module.exports = new MusicDAO();
