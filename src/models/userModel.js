import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async (username, email, password) => {
  const hashed = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, role, avatar_url, updated_at;
  `;
  const { rows } = await pool.query(query, [username, email, hashed]);
  return rows[0];
};

export const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const query = 'SELECT id, username, email, role, avatar_url, updated_at FROM users WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getAllUsers = async () => {
  const query = 'SELECT id, username, email, role, avatar_url, updated_at FROM users';
  const { rows } = await pool.query(query);
  return rows;
};

export const updateUserProfile = async (id, username, email, password) => {
  const hashed = password ? await bcrypt.hash(password, 10) : undefined;

  const query = `
    UPDATE users
    SET 
      username = COALESCE($1, username),
      email = COALESCE($2, email),
      password = COALESCE($3, password),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, username, email, role, avatar_url, updated_at;
  `;

  const { rows } = await pool.query(query, [username, email, hashed, id]);
  return rows[0];
};

export const updateUserAvatar = async (id, avatarUrl) => {
  const query = `
    UPDATE users
    SET avatar_url = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, username, email, role, avatar_url, updated_at;
  `;
  const { rows } = await pool.query(query, [avatarUrl, id]);
  return rows[0];
};