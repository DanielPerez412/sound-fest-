const pool = require("../config/database");

class SubscriptionDAO {
  async getPlans() {
    const [rows] = await pool.execute("SELECT * FROM `SubscriptionPlan` ORDER BY price ASC");
    return rows;
  }

  async getPlanById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM `SubscriptionPlan` WHERE plan_id = ?",
      [id]
    );
    return rows[0] || null;
  }

  async createPlan({ name, price, durationDays, description }) {
    const [result] = await pool.execute(
      "INSERT INTO `SubscriptionPlan` (name, price, duration_days, description) VALUES (?, ?, ?, ?)",
      [name, price, durationDays, description || null]
    );
    return this.getPlanById(result.insertId);
  }

  async getActiveByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT us.*, sp.name AS plan_name, sp.price
       FROM \`UserSubscription\` us
       JOIN \`SubscriptionPlan\` sp ON sp.plan_id = us.plan_id
       WHERE us.user_id = ? AND us.status = 'active' AND us.end_date >= CURDATE()
       ORDER BY us.end_date DESC LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  async create({ userId, planId, startDate, endDate }) {
    const [result] = await pool.execute(
      `INSERT INTO \`UserSubscription\` (user_id, plan_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [userId, planId, startDate, endDate]
    );
    const [rows] = await pool.execute(
      "SELECT * FROM `UserSubscription` WHERE user_subscription_id = ?",
      [result.insertId]
    );
    return rows[0] || null;
  }

  async expireActive(userId) {
    await pool.execute(
      "UPDATE `UserSubscription` SET status = 'cancelled' WHERE user_id = ? AND status = 'active'",
      [userId]
    );
  }

  async cancel(id, userId) {
    const [result] = await pool.execute(
      "UPDATE `UserSubscription` SET status = 'cancelled' WHERE user_subscription_id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  async countActivePremium() {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM \`UserSubscription\` us
       JOIN \`SubscriptionPlan\` sp ON sp.plan_id = us.plan_id
       WHERE us.status = 'active' AND us.end_date >= CURDATE() AND LOWER(sp.name) != 'free'`
    );
    return rows[0].total;
  }

  async countActiveFree() {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM \`UserSubscription\` us
       JOIN \`SubscriptionPlan\` sp ON sp.plan_id = us.plan_id
       WHERE us.status = 'active' AND us.end_date >= CURDATE() AND LOWER(sp.name) = 'free'`
    );
    return rows[0].total;
  }
}

module.exports = new SubscriptionDAO();
