import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a Tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user.id,
    });

    res.status(201).json(new ApiResponse(201, newTweet, "Tweet created successfully"));
});

// Get Tweets by User ID
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.status(200).json(new ApiResponse(200, tweets, "User tweets retrieved successfully"));
});

// Update a Tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user.id) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }

    tweet.content = content || tweet.content;
    await tweet.save();

    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

// Delete a Tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user.id) {
        throw new ApiError(403, "Unauthorized to delete this tweet");
    }

    await tweet.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};
