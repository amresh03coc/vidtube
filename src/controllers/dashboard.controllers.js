import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get Channel Statistics (Total Videos, Views, Subscribers, Likes)
const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Fetch total videos, total views, and total likes
    const videoStats = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
            },
        },
    ]);

    // Fetch total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    // Fetch total likes
    const totalLikes = await Like.countDocuments({ videos: { $in: await Video.find({ owner: userId }).distinct("_id") } });

    // Combine all stats
    const channelStats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalSubscribers,
        totalLikes,
    };

    res.status(200).json(new ApiResponse(200, channelStats, "Channel statistics retrieved successfully"));
});

// Get Channel Videos (With Pagination and Sorting)
const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    // Set pagination and sorting options
    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit, 10),
        sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
    };

    // Get videos uploaded by the user
    const videos = await Video.find({ owner: userId }, null, options).populate("owner", "name email");

    res.status(200).json(new ApiResponse(200, videos, "Channel videos retrieved successfully"));
});

export {
    getChannelStats,
    getChannelVideos,
};
