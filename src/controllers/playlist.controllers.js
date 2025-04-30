import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) { 
        throw new ApiError(400, "Name and description are required");
    }

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user.id, // Assuming user is authenticated
    });

    res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});

// Get User Playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId }).populate("videos");
    res.status(200).json(new ApiResponse(200, playlists, "User playlists retrieved successfully"));
});

// Get Playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
});

// Add Video to Playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // Check if the video already exists in the playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

// Remove Video from Playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist not found");

    playlist.videos = playlist.videos.filter(
        (id) => id.toString() !== videoId.toString()
    );

    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

// Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) throw new ApiError(404, "Playlist not found");

    res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

// Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    );

    if (!updatedPlaylist) throw new ApiError(404, "Playlist not found");

    res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
