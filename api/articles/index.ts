import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  
  if (req.method === 'GET') {
    const { rows } = await pool.query(
      'SELECT * FROM wff_peru.articles ORDER BY date DESC'
    );
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { author_name, author_lastname, author_photo, author_cargo, title, subtitle, date, body } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO wff_peru.articles 
        (author_name, author_lastname, author_photo, author_cargo, title, subtitle, date, body)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [author_name, author_lastname, author_photo, author_cargo, title, subtitle, date, body]
    );
    return res.status(201).json(rows[0]);
  }

  res.status(405).json({ error: 'Método no permitido' });
}