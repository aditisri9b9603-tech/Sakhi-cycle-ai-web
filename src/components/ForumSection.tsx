import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForumPost } from '../types';
import {
  MessageCircle,
  Heart,
  Lightbulb,
  Smile,
  Send,
  Plus,
  AlertTriangle,
  Shield,
  Filter,
} from 'lucide-react';

export const ForumSection: React.FC = () => {
  const { forumPosts, addForumPost, addForumComment, toggleReaction, reportPost } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ForumPost['category']>('wellness');

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All Discussions' },
    { id: 'wellness', label: 'Cycle Wellness' },
    { id: 'nutrition', label: 'Nourishment' },
    { id: 'pcos', label: 'PCOS & Hormones' },
    { id: 'first-period', label: 'First Period Guidance' },
    { id: 'mood', label: 'Mood & PMS Care' },
  ];

  const filteredPosts = forumPosts.filter((post) => {
    if (post.isReported) return false;
    if (activeCategory === 'all') return true;
    return post.category === activeCategory;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    addForumPost(newTitle.trim(), newContent.trim(), newCategory);
    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    addForumComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Forum Header Banner */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#D9658B]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
              Safe Sanctuary Community Forum
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
            Anonymous, empathetic peer conversations. Protected by strict privacy and gentle moderation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-[0.98] self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Share a Thought or Question</span>
        </button>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-[#3D1E28] text-white shadow-xs'
                : 'bg-white text-[#7E5265] hover:bg-[#FFF0F3] border border-[#F4D5DC]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Post Feeds */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isCommentsOpen = Boolean(expandedComments[post.id]);
          return (
            <div
              key={post.id}
              className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4 hover:border-[#D9658B]/40 transition-colors"
            >
              {/* Author & Timestamp Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#F4D5DC] flex items-center justify-center text-sm">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3D1E28]">
                      {post.authorPseudonym}
                    </span>
                    <span className="text-[11px] text-[#7E5265] ml-2">
                      · {post.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9658B] bg-[#FFF0F3] px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Report this post for moderator review?')) {
                        reportPost(post.id);
                      }
                    }}
                    className="text-[#7E5265]/50 hover:text-rose-600 p-1"
                    title="Report post"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#7E5265] mt-1.5 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Reaction & Comment Action Bar */}
              <div className="pt-3 border-t border-[#FCECEF] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReaction(post.id, 'heart')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      post.userReactions.heart
                        ? 'bg-[#FCECEF] border-[#D9658B] text-[#D9658B] font-bold'
                        : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.userReactions.heart ? 'fill-[#D9658B]' : ''}`} />
                    <span className="tabular-nums">{post.reactions.heart}</span>
                  </button>

                  <button
                    onClick={() => toggleReaction(post.id, 'helpful')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      post.userReactions.helpful
                        ? 'bg-[#FFF9ED] border-[#E8A735] text-[#94580D] font-bold'
                        : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{post.reactions.helpful}</span>
                  </button>

                  <button
                    onClick={() => toggleReaction(post.id, 'hug')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      post.userReactions.hug
                        ? 'bg-[#F3FAF5] border-[#58B988] text-[#226947] font-bold'
                        : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{post.reactions.hug}</span>
                  </button>
                </div>

                <button
                  onClick={() =>
                    setExpandedComments((prev) => ({ ...prev, [post.id]: !isCommentsOpen }))
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#D9658B] hover:text-[#C54E74]"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>
                    {post.comments.length}{' '}
                    {post.comments.length === 1 ? 'Response' : 'Responses'}
                  </span>
                </button>
              </div>

              {/* Collapsible Responses Section */}
              {isCommentsOpen && (
                <div className="pt-3 border-t border-[#FCECEF]/80 space-y-3 bg-[#FFF8F8] p-4 rounded-2xl">
                  {post.comments.length === 0 ? (
                    <p className="text-xs text-[#7E5265]">No responses yet. Share a comforting note below.</p>
                  ) : (
                    <div className="space-y-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="p-3 bg-white rounded-xl border border-[#F4D5DC] space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#7E5265]">
                            <span className="font-semibold text-[#3D1E28]">{c.author}</span>
                            <span>{c.createdAt}</span>
                          </div>
                          <p className="text-xs text-[#3D1E28] leading-relaxed">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Response Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write an encouraging response..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl transition-colors shadow-2xs"
                      title="Post Response"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#F4D5DC] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCECEF]">
              <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
                Share with the Community
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#7E5265] hover:text-[#3D1E28] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                  Topic / Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                >
                  <option value="wellness">Cycle Wellness</option>
                  <option value="nutrition">Nourishment & Herbs</option>
                  <option value="pcos">PCOS & Hormonal Health</option>
                  <option value="first-period">First Period Experience</option>
                  <option value="mood">Mood & PMS Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., What helps you feel cozy on day 1?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience, gentle question, or loving affirmation..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                />
              </div>

              <div className="p-3 bg-[#FFF0F3] rounded-xl text-[11px] text-[#7E5265] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D9658B] shrink-0" />
                <span>
                  Posts appear under an automatic whimsical pseudonym (e.g., RosePetal_14). Your real name, cycle calendar, and logs are never exposed.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7E5265]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
