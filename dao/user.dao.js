const pool = require("../config/database");

class UserDAO {
  async create({ username, email, passwordHash, firstName, lastName }) {
    const [result] = await pool.execute(
      `INSERT INTO \`User\` (username, email, password, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, firstName || null, lastName || null]
    );
    return this.getById(result.insertId);
  }

  async getByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM `User` WHERE email = ?", [email]);
    return rows[0] || null;
  }

  async getByUsername(username) {
    const [rows] = await pool.execute("SELECT * FROM `User` WHERE username = ?", [username]);
    return rows[0] || null;
  }

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT user_id, username, email, first_name, last_name, profile_picture,
              registration_date, is_active, role
       FROM \`User\` WHERE user_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async updateProfile(id, { username, email, firstName, lastName, profilePicture }) {
    await pool.execute(
      `UPDATE \`User\` SET
         username = COALESCE(?, username),
         email = COALESCE(?, email),
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         profile_picture = COALESCE(?, profile_picture)
       WHERE user_id = ?`,
      [username || null, email || null, firstName || null, lastName || null, profilePicture || null, id]
    );
    return this.getById(id);
  }

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM `User`");
    return rows[0].total;
  }
}

module.exports = new UserDAO();
