import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from 'fs';
import Connection from "../models/Connection.js";

export const sendConnectionRequest = async (req, res, next) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequest = await Connection.find({ from_user_id: userId, created_at: { $gt: last24Hours } })

        if(connectionRequest.length >= 20){
            return res.json({success:false,message:"try after 24 hours"})
        }

        const connection = await Connection.findOne({
            $or:[
                {from_user_id : userId , to_user_id : id},
                {from_user_id : id , to_user_id : userId}
            ]
        })

        if(!connection){
            await Connection.create({
                from_user_id : userId,
                to_user_id : id
            })
            return res.json({success : true , message : "user connected successfully"})
        }else if(connection && connection.status === "accepted"){
            return res.json({success : false , message : "user already connected"})
        }

        return res.json({success : true , message : "connection request pending"})

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getUserConnections = async (req, res, next) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId).populate('connections followers following')

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({to_user_id : userId , status : 'pending'}).populate('from_user_id')).map(connection => pendingConnections)

        res.json({success : true , connections , followers , following ,pendingConnections})

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const acceptConnections = async (req, res, next) => {
    try {
        const { userId } = req.auth()
        const {id} = req.body

        const connection = await Connection.findById({from_user_id : id , to_user_id : userId})

        if(!connection){
            return res.json({success : false , message : "connection not found"})
        }

        const user = await User.findById(userId)
        user.connections.push(id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.connections.push(userId)
        await user.save()

        connection.status = 'accepted'
        await connection.save()

        return res.json({success : true , message : "connection accepted successfully"})

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}