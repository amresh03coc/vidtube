import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get All Comments for a Video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if the video exists
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // Pagination and fetching comments
    const comments = await Comment.find({ video: videoId })
        // .populate("user", "username email") // Populating user info
        .sort({ createdAt: -1 }) // Latest comments first
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// ✅ Add a Comment to a Video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content, parentComment } = req.body;

    // Validate input
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    // Check if the video exists
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    // Validate parent comment (for replies)
    let parent = null;
    if (parentComment) {
        if (!mongoose.isValidObjectId(parentComment)) {
            throw new ApiError(400, "Invalid parent comment ID");
        }
        parent = await Comment.findById(parentComment);
        if (!parent) {
            throw new ApiError(404, "Parent comment not found");
        }
    }

    // Create the comment
    const newComment = await Comment.create({
        content,
        user: req.user.id, // Authenticated user
        video: videoId,
        parentComment: parent ? parent._id : null,
    });

    res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// ✅ Update a Comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if (!content) {
        throw new ApiError(400, "Updated content is required");
    }

    // Find and update the comment
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, user: req.user.id }, // Ensure user can only update their comment
        { content },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// ✅ Delete a Comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate comment ID
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Find and delete the comment (only owner can delete)
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        user: req.user.id,
    });

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
