import express from 'express'
import { discoverUser, followUser, getUserData, unFollowUser, updateUserData } from '../controller/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { acceptConnections, getUserConnections, getUserProfiles, sendConnectionRequest } from '../controller/connectionController.js';
import { getUserRecentMessages } from '../controller/messageController.js';


const userRouter = express.Router()

userRouter.get('/data',protect,getUserData)
userRouter.post('/update',upload.fields([{name:'profile',maxCount:1},{name:'cover',maxCount:1}]),protect,updateUserData)
userRouter.post('/discover',protect,discoverUser)
userRouter.post('/follow',protect,followUser)
userRouter.post('/unfollow',protect,unFollowUser)
userRouter.post('/connect',protect, sendConnectionRequest)
userRouter.post('/accept',protect ,acceptConnections)
userRouter.post('/connections',protect, getUserConnections)
userRouter.get('/connections',protect, getUserConnections)
userRouter.post('/profiles',protect,getUserProfiles)
userRouter.get('/recent-messages', protect,getUserRecentMessages)


export default userRouter;