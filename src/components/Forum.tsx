import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Send, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ForumPost, ForumComment, Profile } from '../lib/supabase';

type PostWithAuthor = ForumPost & {
  author: Profile;
  comments: (ForumComment & { author: Profile })[];
};

export default function Forum() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: author } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', post.user_id)
            .single();

          const { data: comments } = await supabase
            .from('forum_comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          const commentsWithAuthors = await Promise.all(
            (comments || []).map(async (comment) => {
              const { data: commentAuthor } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', comment.user_id)
                .single();

              return { ...comment, author: commentAuthor! };
            })
          );

          return {
            ...post,
            author: author!,
            comments: commentsWithAuthors,
          };
        })
      );

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newPostTitle || !newPostContent) return;

    try {
      const { error } = await supabase.from('forum_posts').insert({
        user_id: profile.id,
        title: newPostTitle,
        content: newPostContent,
      });

      if (error) throw error;

      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPostForm(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  const addComment = async (postId: string) => {
    if (!profile || !newComment) return;

    try {
      const { error } = await supabase.from('forum_comments').insert({
        post_id: postId,
        user_id: profile.id,
        content: newComment,
      });

      if (error) throw error;

      setNewComment('');
      loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading forum...</p>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Forum
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{selectedPost.title}</h1>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-600 rounded-full p-2">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{selectedPost.author.full_name}</p>
              <p className="text-sm text-gray-600">
                @{selectedPost.author.username} •{' '}
                {new Date(selectedPost.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Comments ({selectedPost.comments.length})
          </h2>

          <div className="space-y-4 mb-6">
            {selectedPost.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-green-100 rounded-full p-1">
                    <User className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="font-semibold text-sm text-gray-800">
                    {comment.author.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addComment(selectedPost.id);
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Forum</h1>
          <p className="text-gray-600">Share tips and discuss eco-friendly transportation</p>
        </div>
        <button
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Post</span>
        </button>
      </div>

      {showNewPostForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Post</h2>
          <form onSubmit={createPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter post title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Share your thoughts..."
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setShowNewPostForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {post.author.full_name}
                  </p>
                  <p className="text-xs text-gray-600">@{post.author.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments.length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No posts yet. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
}
