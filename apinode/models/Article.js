const db = require('../config/db');
const Image = require('./Image');

class Article {
  static async create({ nombre, descripcion, price, images = [] }) {
    const [result] = await db.query(
      'INSERT INTO articles (nombre, descripcion, price) VALUES (?, ?, ?)',
      [nombre, descripcion, price]
    );
    
    const article = await this.findById(result.insertId);
    
    // Agregar imágenes si se proporcionan
    if (images.length > 0) {
      await Promise.all(
        images.map(image => 
          Image.create({ ...image, imageable_type: 'Article', imageable_id: article.id })
        )
      );
      article.images = await Image.findByImageable('Article', article.id);
    }
    
    return article;
  }

  static async findAll() {
    const [articles] = await db.query('SELECT * FROM articles');
    return Promise.all(
      articles.map(async article => {
        article.images = await Image.findByImageable('Article', article.id);
        return article;
      })
    );
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (!rows[0]) return null;
    
    const article = rows[0];
    article.images = await Image.findByImageable('Article', id);
    return article;
  }

  static async update(id, { nombre, descripcion, price }) {
    await db.query(
      'UPDATE articles SET nombre = ?, descripcion = ?, price = ? WHERE id = ?',
      [nombre, descripcion, price, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const article = await this.findById(id);
    if (!article) return null;
    
    // Eliminar imágenes relacionadas
    await db.query(
      'DELETE FROM images WHERE imageable_type = ? AND imageable_id = ?',
      ['Article', id]
    );
    
    await db.query('DELETE FROM articles WHERE id = ?', [id]);
    return article;
  }
}

module.exports = Article;