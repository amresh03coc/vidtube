import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
        populate: "owner"
    };

    const videos = await Video.aggregatePaginate(Video.aggregate().match(filter), options);

    res.status(200).json(new ApiResponse(200, videos, "Videos retrieved successfully"));
});

// Publish a Video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;

    if (!req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required.");
    }

    const videoFile = await uploadOnCloudinary(req.files.videoFile[0].path);
    const thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Error uploading files to Cloudinary.");
    }

    //creating publish video in database
    const newVideo = await Video.create({
        title,
        description,
        duration,
        videoFile: videoFile.secure_url,
        thumbnail: thumbnail.secure_url,
        owner: req.user.id,
        isPublished: true
    });

    res.status(201).json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
});

// Get Video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner");
    if (!video) throw new ApiError(404, "Video not found");

    video.views += 1;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video retrieved successfully"));
});

// Update Video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updatedData = { title, description };

    if (req.file) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (!thumbnail) throw new ApiError(500, "Error uploading thumbnail");
        updatedData.thumbnail = thumbnail.secure_url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedData, { new: true });

    if (!updatedVideo) throw new ApiError(404, "Video not found");

    res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) throw new ApiError(404, "Video not found");

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

// Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) throw new ApiError(404, "Video not found");

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, { isPublished: video.isPublished }, "Video publish status updated"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
