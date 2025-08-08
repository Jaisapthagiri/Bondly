import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js';
import { addpost, getFeedPost, likePost } from '../controller/PostController.js';

const postRouter = express.Router()

postRouter.post('/add',upload.array('images',4),protect,addpost)
postRouter.get('/feed',upload.array('images',4),protect,getFeedPost)
postRouter.post('/like',upload.array('images',4),protect,likePost)

export default postRouter;