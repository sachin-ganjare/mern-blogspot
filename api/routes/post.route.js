import express from 'express';
import { verifyToken } from '../utils/verifyUser.js'
import { create, deletepost, updatePost } from '../controllers/post.controller.js'
import { getposts } from '../controllers/post.controller.js'

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/update/:postId', verifyToken, updatePost);

export default router;
