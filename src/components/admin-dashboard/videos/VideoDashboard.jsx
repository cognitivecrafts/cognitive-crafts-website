import React, { useState, useEffect } from 'react';
import pb from '../../../lib/pocketbase';
import { Link } from 'react-router-dom';
import { Plus, Video, BookCopy, Eye, Clock, CheckCircle, XCircle, Trash2, Edit, View, Power, PowerOff, ArrowLeft } from 'lucide-react';
import './VideoDashboard.css';

const VideoDashboard = () => {
    const [videos, setVideos] = useState([]);
    const [stats, setStats] = useState({
        totalVideos: 0,
        modulesLinked: 0,
        mostViewed: { title: 'N/A', views: 0 },
        totalWatchHours: 0,
    });

    // We only need one data-fetching function
    const fetchVideoData = async () => {
        try {
            // 1. Fetch the data just ONCE
            const videoRecords = await pb.collection('videos').getFullList({
                sort: '-created',
                expand: 'module'
            });

            // 2. Set the videos list for your table
            setVideos(videoRecords);

            // 3. Calculate stats from the SAME data
            const modules = new Set(videoRecords.filter(v => v.module).map(v => v.module));
            const mostViewed = videoRecords.length > 0
                ? videoRecords.reduce((prev, current) => (prev.views > current.views) ? prev : current)
                : { title: 'N/A', views: 0 };

            setStats({
                totalVideos: videoRecords.length,
                modulesLinked: modules.size,
                mostViewed: mostViewed,
                totalWatchHours: 0, // Placeholder
            });

        } catch (error) {
            // This will catch any error, including a cancelled request if it happens
            if (error.isAbort) {
                console.log("Request was cancelled. This is expected if another request was made.");
            } else {
                console.error("Failed to fetch video data:", error);
            }
        }
    };

    useEffect(() => {
        // Call the single function on component mount
        fetchVideoData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                await pb.collection('videos').delete(id);
                fetchVideoData(); // Refresh all data with one call
            } catch (error) {
                console.error("Failed to delete video:", error);
            }
        }
    };

    const handlePublishToggle = async (video) => {
        try {
            const newStatus = video.status === 'Active' ? 'Draft' : 'Active';
            await pb.collection('videos').update(video.id, { status: newStatus });
            fetchVideoData(); // Refresh all data with one call for consistency
        } catch (error) {
            console.error("Failed to toggle publish status:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <Link to="/admin-dashboard" className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 flex items-center">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-bold">Video Library & Management</h1>
                </div>
                <Link to="/admin-dashboard/videos/new" className="bg-gradient-to-r from-[#ff0000] via-[#ff7f00] to-[#ffff00] text-white px-4 py-2 rounded hover:bg-[#ff7f00] flex items-center">
                    <Plus size={20} className="mr-2"/> Upload New Video
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-transparent p-4 rounded-lg shadow border-2 border-#f9fafb60">
                    <h2 className="text-white text-sm flex items-center"><Video size={16} className="mr-2"/> Total Videos</h2>
                    <p className="text-2xl font-bold">{stats.totalVideos}</p>
                </div>
                <div className="bg-transparent p-4 rounded-lg shadow border-2 border-#f9fafb60">
                    <h2 className="text-white text-sm flex items-center"><BookCopy size={16} className="mr-2"/> Modules Linked</h2>
                    <p className="text-2xl font-bold">{stats.modulesLinked}</p>
                </div>
                <div className="bg-transparent p-4 rounded-lg shadow border-2 border-#f9fafb60">
                    <h2 className="text-white text-sm flex items-center"><Eye size={16} className="mr-2"/> Most Viewed Video</h2>
                    <p className="text-lg font-bold truncate">{stats.mostViewed.title}</p>
                    <p className="text-sm text-gray-300">{stats.mostViewed.views} views</p>
                </div>
                <div className="bg-transparent p-4 rounded-lg shadow border-2 border-#f9fafb60">
                    <h2 className="text-white text-sm flex items-center"><Clock size={16} className="mr-2"/> Total Watch Hours</h2>
                    <p className="text-2xl font-bold">{stats.totalWatchHours}</p>
                </div>
            </div>

            {/* Video Table */}
            <div className="bg-transparent p-4 rounded-lg shadow  overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Title</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Module</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Duration</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Upload Date</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Views</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-transperent text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map(video => (
                            <tr key={video.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <p className="text-white whitespace-no-wrap">{video.title}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <p className="text-white whitespace-no-wrap">{video.expand?.module?.title || 'N/A'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <p className="text-white whitespace-no-wrap">{video.duration}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <p className="text-white whitespace-no-wrap">{new Date(video.created).toLocaleDateString()}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <p className="text-white whitespace-no-wrap">{video.views}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${video.status === 'Active' ? 'text-green-900' : 'text-yellow-900'}`}>
                                        <span aria-hidden className={`absolute inset-0 ${video.status === 'Active' ? 'bg-green-100' : 'bg-yellow-100'} opacity-100 rounded-full`}></span>
                                        <span className="relative flex items-center">{video.status === 'Active' ? <CheckCircle size={14} className="mr-1"/> : <XCircle size={14} className="mr-1"/>}{video.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-transperent text-sm">
                                    <div className="flex items-center">
                                        <Link to={`/admin-dashboard/videos/${video.id}`} className="text-gray-200 hover:text-indigo-600 mr-2"><View size={20}/></Link>
                                        <Link to={`/admin-dashboard/videos/edit/${video.id}`} className="text-gray-200 hover:text-indigo-600 mr-2"><Edit size={20}/></Link>
                                        <button onClick={() => handleDelete(video.id)} className="text-gray-200 hover:text-red-600 mr-2"><Trash2 size={20}/></button>
                                        <button onClick={() => handlePublishToggle(video)} className="text-gray-200 hover:text-green-600">
                                            {video.status === 'Active' ? <PowerOff size={20}/> : <Power size={20}/>}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VideoDashboard;
