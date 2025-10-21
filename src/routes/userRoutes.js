import express from 'express';
import upload from '../middleware/upload.js';
import { getUsers, uploadAvatar, updateProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/upload', upload.single('file'), uploadAvatar);
router.put('/update', updateProfile);

export default router;