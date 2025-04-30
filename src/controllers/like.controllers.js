import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper function to toggle likes
const toggleLike = async (userId, targetId, field) => {
    if (!isValidObjectId(targetId)) throw new ApiError(400, "Invalid ID");

    const likeExists = await Like.findOne({
        [field]: targetId,
        likedBy: userId,
    });

    if (likeExists) {
        await Like.findByIdAndDelete(likeExists._id);
        return { liked: false };
    } else {
        await Like.create({
            [field]: targetId,
            likedBy: userId,
        });
        return { liked: true };
    }
};

// Toggle Like on a Video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { id: userId } = req.user;

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const result = await toggleLike(userId, videoId, "videos");
    res.status(200).json(new ApiResponse(200, result, "Video like status toggled"));
});

// Toggle Like on a Comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { id: userId } = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const result = await toggleLike(userId, commentId, "comment");
    res.status(200).json(new ApiResponse(200, result, "Comment like status toggled"));
});

// Toggle Like on a Tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { id: userId } = req.user;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    const result = await toggleLike(userId, tweetId, "tweet");
    res.status(200).json(new ApiResponse(200, result, "Tweet like status toggled"));
});

// Get All Liked Videos by the User
const getLikedVideos = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const likedVideos = await Like.find({ likedBy: userId, videos: { $exists: true } })
        .populate({
            path: "videos",
            populate: { path: "owner", select: "name email" },
        })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};
