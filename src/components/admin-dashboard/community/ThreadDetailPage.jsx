import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import pb from '../../../lib/pocketbase';
import './ThreadDetailPage.css';
import {
    Edit, Trash2, Lock, Unlock, Pin, PinOff, ThumbsUp, MessageSquare, Eye, Users, Send,
    Paperclip, Bold, Italic, Code, Smile
} from 'lucide-react';

const ThreadDetailPage = () => {
    const { threadId } = useParams();
    const [thread, setThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuthors = async (authorIds) => {
            if (!authorIds || authorIds.length === 0) {
                return {};
            }
            const uniqueAuthorIds = [...new Set(authorIds.filter(id => id))];
            if (uniqueAuthorIds.length === 0) {
                return {};
            }

            const filter = uniqueAuthorIds.map(id => `id="${id}"`).join(' || ');

            try {
                const users = await pb.collection('users').getFullList({ filter });
                const admins = await pb.collection('admins').getFullList({ filter });
                const allAuthors = [...users, ...admins];
                
                return allAuthors.reduce((acc, author) => {
                    acc[author.id] = author;
                    return acc;
                }, {});
            } catch (error) {
                console.error("Failed to fetch authors:", error);
                return {}; // Return empty object on failure
            }
        };

        const fetchThreadAndReplies = async () => {
            setLoading(true);
            setError(null);
            try {
                // Step 1: Fetch the main thread using getFullList to prevent 404 throws
                const threadRecords = await pb.collection('forum_threads').getFullList({
                    filter: `id = "${threadId}"`,
                    maxItems: 1,
                });

                if (threadRecords.length === 0) {
                    // Throw a custom error that the catch block can handle
                    throw { status: 404, message: "Thread not found or permission denied." };
                }
                const threadData = threadRecords[0];

                // Step 2: Fetch replies for the thread without expanding authors
                const repliesData = await pb.collection('forum_replies').getFullList({
                    filter: `thread = "${threadId}"`,
                    sort: '+created',
                });

                // Step 3: Aggregate all unique author IDs
                const authorIds = [threadData.author, ...repliesData.map(r => r.author)];
                
                // Step 4: Fetch all author records in batch
                const authorMap = await fetchAuthors(authorIds);

                // Step 5: Manually "expand" the author data on the frontend
                threadData.expand = { author: authorMap[threadData.author] };
                repliesData.forEach(reply => {
                    reply.expand = { author: authorMap[reply.author] };
                });

                setThread(threadData);
                setReplies(repliesData);

            } catch (err) {
                if (err.status === 404) {
                    setError('Failed to load thread. It may not exist or you may not have permission to view it.');
                } else {
                    setError('An unexpected error occurred.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchThreadAndReplies();
    }, [threadId]);

    const handleThreadAction = async (action) => {
        if (!thread) return;
        let newStatus = {};
        let confirmMessage = '';

        switch (action) {
            case 'lock':
                newStatus = { status: 'locked' };
                confirmMessage = 'Are you sure you want to lock this thread?';
                break;
            case 'unlock':
                newStatus = { status: 'active' };
                confirmMessage = 'Are you sure you want to unlock this thread?';
                break;
            case 'pin':
                newStatus = { is_featured: true };
                confirmMessage = 'Are you sure you want to pin this thread?';
                break;
            case 'unpin':
                newStatus = { is_featured: false };
                confirmMessage = 'Are you sure you want to unpin this thread?';
                break;
            default: return;
        }

        if (window.confirm(confirmMessage)) {
            try {
                const updatedThread = await pb.collection('forum_threads').update(thread.id, newStatus);
                setThread(updatedThread);
            } catch (error) {
                console.error(`Failed to ${action} thread:`, error);
                alert(`Error: Could not ${action} the thread.`);
            }
        }
    };

    if (loading) return <div className="thread-detail-page"><p>Loading thread...</p></div>;
    if (error) return <div className="thread-detail-page error-message"><p>{error}</p></div>;
    if (!thread) return null;

    return (
        <div className="thread-detail-page">
            <div className="thread-header-container">
                <div className="thread-header">
                    <div className="thread-title-section">
                        <h1 className="thread-title">{thread.title}</h1>
                        <span className={`status-badge status-${thread.status}`}>{thread.status}</span>
                    </div>
                    <div className="thread-meta">
                        <span>By: {thread.expand?.author?.name || 'Unknown Author'} ({thread.expand?.author?.role || 'Student'})</span>
                        <span>Created: {new Date(thread.created).toLocaleDateString()}</span>
                        <span>Last Activity: {new Date(thread.updated).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="thread-admin-actions">
                    <button><Edit size={16} /> Edit</button>
                    {thread.status === 'locked' ? 
                        <button onClick={() => handleThreadAction('unlock')}><Unlock size={16} /> Unlock</button> :
                        <button onClick={() => handleThreadAction('lock')}><Lock size={16} /> Lock</button>
                    }
                    <button><Trash2 size={16} /> Delete</button>
                     {thread.is_featured ? 
                        <button onClick={() => handleThreadAction('unpin')}><PinOff size={16} /> Unpin</button> :
                        <button onClick={() => handleThreadAction('pin')}><Pin size={16} /> Pin</button>
                    }
                </div>
            </div>

            <div className="thread-body-container">
                <div className="thread-main-content">
                    <div className="thread-description">
                        <p>{thread.content}</p>
                        {/* Add attachments and reactions here */}
                    </div>

                    <div className="replies-section">
                        <h2>Replies ({replies.length})</h2>
                        <div className="reply-box">
                            <textarea placeholder="Post your reply..."></textarea>
                            <div className="reply-box-actions">
                                <div className="formatting-tools">
                                    <button><Bold size={16} /></button>
                                    <button><Italic size={16} /></button>
                                    <button><Code size={16} /></button>
                                    <button><Paperclip size={16} /></button>
                                    <button><Smile size={16} /></button>
                                </div>
                                <button className="btn-submit-reply"><Send size={16} /> Post Reply</button>
                            </div>
                        </div>
                        <div className="replies-list">
                            {replies.map(reply => (
                                <div key={reply.id} className="reply-item">
                                    <div className="reply-author">
                                        {/* Avatar placeholder */}
                                        <div className="avatar-placeholder"></div> 
                                        <div>
                                            <strong>{reply.expand?.author?.name || 'Unknown Author'}</strong>
                                            <span>{reply.expand?.author?.role || 'Student'}</span>
                                        </div>
                                    </div>
                                    <div className="reply-content">
                                        <p>{reply.content}</p>
                                        <div className="reply-meta">
                                            <span>Posted: {new Date(reply.created).toLocaleString()}</span>
                                            <div className="reply-actions">
                                                <button><ThumbsUp size={14} /> Approve</button>
                                                <button><Edit size={14} /> Edit</button>
                                                <button><Trash2 size={14} /> Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="thread-sidebar">
                    <div className="sidebar-widget">
                        <h3>Thread Insights</h3>
                        <p><MessageSquare size={16} /> {replies.length} Replies</p>
                        <p><Users size={16} /> {new Set(replies.map(r => r.expand?.author?.id).filter(Boolean)).size + (thread.expand?.author ? 1 : 0)} Participants</p>
                        <p><Eye size={16} /> 0 Views</p> {/* Placeholder */}
                    </div>
                    <div className="sidebar-widget">
                        <h3>Related Threads</h3>
                        {/* Placeholder for related threads */}
                        <ul>
                            <li><Link to="#">Related Thread 1</Link></li>
                            <li><Link to="#">Related Thread 2</Link></li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ThreadDetailPage;
