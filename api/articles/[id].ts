import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  try {
    // 🔹 ACTUALIZAR
    if (req.method === 'PUT') {
      const {
        authorName,
        authorLastname,
        authorPhoto,
        authorCargo,
        title,
        subtitle,
        date,
        body
      } = req.body;

      const { rows } = await pool.query(
        `UPDATE wff_peru.articles SET
          author_name = $1,
          author_lastname = $2,
          author_photo = $3,
          author_cargo = $4,
          title = $5,
          subtitle = $6,
          date = $7,
          body = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING *`,
        [
          authorName,
          authorLastname,
          authorPhoto,
          authorCargo,
          title,
          subtitle,
          date,
          body,
          id
        ]
      );

      return res.json(rows[0]);
    }

    // 🔹 ELIMINAR
    if (req.method === 'DELETE') {
      await pool.query(
        `DELETE FROM wff_peru.articles WHERE id = $1`,
        [id]
      );

      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}