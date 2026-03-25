import React, { useState } from 'react'
import { Plus, Trash2, Calendar, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { useNews } from '../../hooks/useNews'

const AdminNews = () => {
  const { news, createNews, updateNews, deleteNews } = useNews()
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('Campus')
  const [isPublished, setIsPublished] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)

  const showNotice = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  const handleCreateNew = () => {
    setSelectedPost(null)
    setTitle('')
    setSummary('')
    setCategory('Campus')
    setIsPublished(false)
    setIsEditing(true)
  }

  const handleEdit = (post) => {
    setSelectedPost(post)
    setTitle(post.title || '')
    setSummary(post.content || '')
    setCategory(post.category_name || 'Campus')
    setIsPublished(true)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    try {
      if (selectedPost) {
        await updateNews(selectedPost.id, { title, summary, category })
      } else {
        await createNews({ title, summary, category })
      }
      setIsEditing(false)
      setSelectedPost(null)
      showNotice()
    } catch (err) {
      console.error('Failed to save article:', err)
    }
  }

  const handleDelete = async (postId) => {
    try {
      await deleteNews(postId)
      if (selectedPost?.id === postId) {
        setIsEditing(false)
        setSelectedPost(null)
      }
    } catch (err) {
      console.error('Failed to delete article:', err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Saved toast */}
      {savedNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl shadow-lg">
          <CheckCircle size={18} className="text-emerald-500" /> Article saved successfully!
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">News & Announcements</h2>
          <p className="text-slate-500 mt-1">Publish and manage campus news and announcements.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Post Article
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Post List */}
        <div className={`w-full ${isEditing ? 'lg:w-1/3' : ''} space-y-4`}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Recent Posts ({news.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[800px] overflow-y-auto">
              {news.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-sm">
                  No articles yet. Click "Post Article" to create one.
                </div>
              )}
              {(news || []).map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleEdit(post)}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${selectedPost?.id === post.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-semibold text-slate-800 text-sm line-clamp-2">
                      {post.title}
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium border border-emerald-100 shrink-0">
                      Published
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{' '}
                      {post.published_at
                        ? new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(new Date(post.published_at))
                        : 'N/A'}
                    </span>
                    <span>By Admin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        {isEditing && (
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">
                  {selectedPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                {selectedPost && (
                  <button
                    onClick={() => handleDelete(selectedPost.id)}
                    className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                    title="Delete this article"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Article Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a catchy title..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                    >
                      <option>Campus</option>
                      <option>Alumni Success</option>
                      <option>Events</option>
                      <option>Careers</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isPublished}
                          onChange={() => setIsPublished(!isPublished)}
                        />
                        <div
                          className={`block w-10 h-6 rounded-full transition-colors ${isPublished ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublished ? 'translate-x-4' : ''}`}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Publish immediately
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
                    <ImageIcon size={32} className="mb-2 text-slate-300" />
                    <span className="text-sm font-medium text-slate-500">
                      Click to upload image
                    </span>
                    <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Summary</label>
                  <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    placeholder="Brief excerpt for the news feed..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm transition-all"
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Content</label>
                  <div className="border border-slate-200 rounded-xl bg-slate-50 h-[200px] flex items-center justify-center text-slate-400 text-sm shadow-inner">
                    Rich Text Editor — coming soon
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedPost(null)
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPublished ? 'Save & Publish' : 'Save Draft'}
                  </button>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNews
