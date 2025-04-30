import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle Subscription (Subscribe/Unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId === req.user.id) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);
    if (!channel) throw new ApiError(404, "Channel not found");

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user.id,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    await Subscription.create({ subscriber: req.user.id, channel: channelId });

    res.status(200).json(new ApiResponse(200, null, "Subscribed successfully"));
});

// Get Subscribers for a Channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email")
        .select("subscriber createdAt");

    res.status(200).json(new ApiResponse(200, subscribers, "Subscribers retrieved successfully"));
});

// Get Channels a User is Subscribed To
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email")
        .select("channel createdAt");

    res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels retrieved successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};
