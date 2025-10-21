import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';
import { updateUserAvatar } from '../models/userModel.js';

export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, avatar_url, updated_at FROM users'
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { username, email, password } = req.body;

    const hashed = password ? await bcrypt.hash(password, 10) : undefined;
    const query = `
      UPDATE users
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          password = COALESCE($3, password),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING id, username, email, avatar_url, updated_at;
    `;
    const { rows } = await pool.query(query, [username, email, hashed, id]);
    res.json({ message: 'Profile updated', user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    } 

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: 'uploads' 
          }, 
          (err, result) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();
    
    res.status(201).json({
      message: 'Upload successful',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};