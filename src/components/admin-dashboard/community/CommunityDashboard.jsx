import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './CommunityDashboard.css';
import { Plus, Star, MessageSquare, Bell, ThumbsUp, Trash2, Eye, Users, Edit, Flag, Power, PowerOff } from 'lucide-react';

const StatCard = ({ title, value, icon, change }) => (
    <div className="stat-card">
        <div className="stat-card-header">
            <p>{title}</p>
            {icon}
        </div>
        <h2>{value}</h2>
        {change && <p className="stat-card-change">{change}</p>}
    </div>
);

const CommunityDashboard = () => {
    const [stats, setStats] = useState({ threads: 0, flagged: 0, announcements: 0, engagement: 0 });
    const [recentThreads, setRecentThreads] = useState([]);
    const [latestAnnouncements, setLatestAnnouncements] = useState([]);
    const [flaggedContent, setFlaggedContent] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch stats
            const threadsList = await pb.collection('forum_threads').getFullList({ fields: 'id,status' });
            const announcementsList = await pb.collection('announcements').getFullList({ fields: 'id,status' });
            const flaggedThreadsCount = threadsList.filter(t => t.status === 'flagged').length;

            setStats({
                threads: threadsList.length,
                flagged: flaggedThreadsCount,
                announcements: announcementsList.filter(a => a.status === 'published').length,
                engagement: 0, // Placeholder for now
            });

            // Fetch recent threads and their reply counts
            const threads = await pb.collection('forum_threads').getFullList({
                sort: '-created',
                expand: 'author',
                perPage: 5,
            });

            const threadsWithReplyCounts = await Promise.all(
                threads.map(async (thread) => {
                    const replies = await pb.collection('forum_replies').getList(1, 1, { 
                        filter: `thread = "${thread.id}"`,
                    });
                    return { ...thread, replyCount: replies.totalItems };
                })
            );
            setRecentThreads(threadsWithReplyCounts);

            // Fetch latest announcements
            const announcements = await pb.collection('announcements').getFullList({
                sort: '-created',
                expand: 'created_by',
                perPage: 5,
            });
            setLatestAnnouncements(announcements);
            
            // Fetch flagged content
            const flaggedThreads = await pb.collection('forum_threads').getFullList({
                filter: 'status = "flagged"',
                expand: 'author',
            });
            setFlaggedContent(flaggedThreads.map(f => ({ ...f, type: 'Thread' })));

        } catch (error) {
            console.error("Failed to fetch community data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModerate = async (collection, id, newStatus) => {
        if (!window.confirm(`Are you sure you want to set status to "${newStatus}"?`)) return;
        try {
            await pb.collection(collection).update(id, { status: newStatus });
            fetchData(); // Refresh all data
        } catch (error) {
            console.error("Moderation action failed:", error);
            alert("Action failed. Please try again.");
        }
    }

    const handleDelete = async (collection, id) => {
        if (!window.confirm('Are you sure you want to delete this item permanently?')) return;
        try {
            await pb.collection(collection).delete(id);
            fetchData(); // Refresh all data
        } catch (error) {
            console.error("Delete action failed:", error);
            alert("Delete failed. Please try again.");
        }
    }

    if (loading) {
        return <div className="community-dashboard"><p>Loading community data...</p></div>;
    }

    return (
        <div className="community-dashboard">
            <div className="header-bar">
                <div>
                    <h1>Community Hub</h1>
                    <p>Manage discussions and announcements across Cognitive Crafts</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary"><Plus size={16} /> New Announcement</button>
                    <button className="btn btn-secondary"><Star size={16} /> Featured Threads</button>
                </div>
            </div>

            <div className="overview-widgets">
                <StatCard title="Total Threads" value={stats.threads} icon={<MessageSquare />} />
                <StatCard title="Flagged Content" value={stats.flagged} icon={<Bell />} />
                <StatCard title="Published Announcements" value={stats.announcements} icon={<Bell />} />
                <StatCard title="Engagement" value={`${stats.engagement}%`} icon={<Users />} />
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Discussions</h2>
                    <Link to="/admin-dashboard/community/threads" className="btn-link">View All Discussions</Link>
                </div>
                <table className="dashboard-table">
                     <thead>
                        <tr>
                            <th>Thread Title</th>
                            <th>Author</th>
                            <th>Replies</th>
                            <th>Created At</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentThreads.map(d => (
                            <tr key={d.id}>
                                <td>{d.title}</td>
                                <td>{d.expand?.author?.name || 'N/A'}</td>
                                <td>{d.replyCount}</td>
                                <td>{new Date(d.created).toLocaleDateString()}</td>
                                <td><span className={`status ${d.status.toLowerCase()}`}>{d.status}</span></td>
                                <td className="actions">
                                    <Link to={`/admin-dashboard/community/threads/${d.id}`} className="btn-action"><Eye size={16} /></Link>
                                    <button title="Edit"><Edit size={16} /></button>
                                    {d.status === 'active' && <button title="Flag" onClick={() => handleModerate('forum_threads', d.id, 'flagged')}><Flag size={16} /></button>}
                                    {d.status === 'flagged' && <button title="Approve" onClick={() => handleModerate('forum_threads', d.id, 'active')}><ThumbsUp size={16} /></button>}
                                    <button title="Delete" onClick={() => handleDelete('forum_threads', d.id)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Latest Announcements</h2>
                    <button className="btn-link">View All Announcements</button>
                </div>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Posted By</th>
                            <th>Date</th>
                            <th>Audience</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestAnnouncements.map(a => (
                            <tr key={a.id}>
                                <td>{a.title}</td>
                                <td>{a.expand?.created_by?.name || 'Admin'}</td>
                                <td>{new Date(a.created).toLocaleDateString()}</td>
                                <td>{a.audience}</td>
                                <td><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span></td>
                                <td className="actions">
                                    <button title="Edit"><Edit size={16} /></button>
                                    <button title={a.status === 'published' ? 'Unpublish' : 'Publish'} onClick={() => handleModerate('announcements', a.id, a.status === 'published' ? 'draft' : 'published')}>
                                        {a.status === 'published' ? <PowerOff size={16} /> : <Power size={16} />}
                                    </button>
                                    <button title="Delete" onClick={() => handleDelete('announcements', a.id)}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Quick Moderation Panel</h2>
                </div>
                <div className="flagged-content-list">
                    {flaggedContent.length > 0 ? flaggedContent.map(item => (
                        <div key={item.id} className="flagged-item">
                            <div>
                                <p><strong>{item.type}: "{item.title}"</strong></p>
                                <span>by {item.expand?.author?.name || 'N/A'} on {new Date(item.created).toLocaleDateString()}</span>
                            </div>
                            <div className="actions">
                                <button className="btn-approve" onClick={() => handleModerate('forum_threads', item.id, 'active')}>Mark Safe</button>
                                <button className="btn-delete" onClick={() => handleDelete('forum_threads', item.id)}>Delete</button>
                            </div>
                        </div>
                    )) : <p>No flagged content to review.</p>}
                </div>
            </div>
        </div>
    );
};

export default CommunityDashboard;
