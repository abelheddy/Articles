const db = require('../config/db');

class Image {
  static async create({ url, type = 'URL', imageable_type, imageable_id }) {
    const [result] = await db.query(
      'INSERT INTO images (url, type, imageable_type, imageable_id) VALUES (?, ?, ?, ?)',
      [url, type, imageable_type, imageable_id]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM images WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByImageable(imageable_type, imageable_id) {
    const [rows] = await db.query(
      'SELECT * FROM images WHERE imageable_type = ? AND imageable_id = ?',
      [imageable_type, imageable_id]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM images WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async deleteByImageable(imageable_type, imageable_id) {
    const [result] = await db.query(
      'DELETE FROM images WHERE imageable_type = ? AND imageable_id = ?',
      [imageable_type, imageable_id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Image;