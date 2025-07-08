const db = require('../config/db');
const bcrypt = require('bcrypt');
const Image = require('./Image');

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return this.findById(result.insertId);
  }

  static async findAll() {
    const [users] = await db.query('SELECT id, name, email, created_at FROM users');
    return Promise.all(users.map(async user => {
      user.image = await Image.findByImageable('User', user.id);
      return user;
    }));
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?', 
      [id]
    );
    if (!rows[0]) return null;
    
    const user = rows[0];
    user.image = await Image.findByImageable('User', id);
    return user;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async update(id, { name, email }) {
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return this.findById(id);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }

  static async delete(id) {
    const user = await this.findById(id);
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return user;
  }

  static async comparePassword(userId, candidatePassword) {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!rows[0]) return false;
    return bcrypt.compare(candidatePassword, rows[0].password);
  }
}

module.exports = User;