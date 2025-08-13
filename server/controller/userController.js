import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from 'fs';

export const getUserData = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "user not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const updateUserData = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        let { username, bio, location, full_name } = req.body;

        const tempUser = await User.findById(userId);
        !username && (username = tempUser.username);

        if (tempUser.username !== username) {
            const user = await User.findOne({ username });
            if (user) {
                username = tempUser.username;
            }
        }

        const updatedUser = {
            username,
            bio,
            location,
            full_name
        };

        const profile = req.files.profile && req.files.profile[0];
        const cover = req.files.cover && req.files.cover[0];

        if (profile) {
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            });

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '512' }
                ]
            })

            updatedUser.profile_picture = url;
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname,
            });

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            })

            updatedUser.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

        res.json({ success: true, user, message: 'Profile Updated successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


export const discoverUser = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { input } = req.body;

        const allUser = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
            ]
        });

    const filteredUser = allUser.filter(user => user.id !== userId);
    res.json({ success: true, users: filteredUser });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const followUser = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "Logged in user not found" });
        }

        if (user.following.includes(id)) {
            return res.json({ success: false, message: 'You are already following this user' });
        }

        user.following.push(id);
        await user.save();

        const toUser = await User.findById(id);

        if (!toUser) {
            return res.json({ success: false, message: "User to follow not found" });
        }

        toUser.followers.push(userId);
        await toUser.save();

        return res.json({ success: true, message: 'You are successfully following' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const unFollowUser = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        user.following = user.following.filter(followingId => followingId.toString() !== id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(followerId => followerId.toString() !== userId);
        await toUser.save();

        return res.json({ success: true, message: 'You are noLonger following this user' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
//newly added
export const getAllUsers = async (req, res, next) => {
    try {
        const { userId } = req.auth();

        const users = await User.find({ _id: { $ne: userId } })
            .select("-password") 
            .lean();

        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
