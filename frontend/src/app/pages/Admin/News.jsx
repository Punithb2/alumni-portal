import React, { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import { useNews } from '../../hooks/useNews'

const DEFAULT_FORM = {
  title: '',
  summary: '',
  content: '',
  category: 'Campus',
  image: '',
  isPublished: false,
}

const formatDate = (value) => {
  if (!value) return 'Not published'
  const nextDate = new Date(value)
  if (Number.isNaN(nextDate.getTime())) return 'Not published'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(nextDate)
}

const AdminNews = () => {
  const { news, loading, error, createNews, updateNews, deleteNews } = useNews()
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [savedNotice, setSavedNotice] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const publishedCount = useMemo(
    () => news.filter((item) => item.is_published).length,
    [news]
  )

  const showNotice = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  const resetEditor = () => {
    setSelectedPost(null)
    setForm(DEFAULT_FORM)
    setSaveError('')
  }

  const handleCreateNew = () => {
    resetEditor()
    setIsEditing(true)
  }

  const handleEdit = (post) => {
    setSelectedPost(post)
    setForm({
      title: post.title || '',
      summary: post.summary || '',
      content: post.content || '',
      category: post.category_name || 'Campus',
      image: post.image || '',
      isPublished: Boolean(post.is_published),
    })
    setSaveError('')
    setIsEditing(true)
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setSaveError('Title and content are required.')
      return
    }

    setIsSaving(true)
    setSaveError('')
    try {
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        category: form.category,
        image: form.image.trim(),
        isPublished: form.isPublished,
      }

      if (selectedPost) {
        await updateNews(selectedPost.id, payload)
      } else {
        await createNews(payload)
      }

      setIsEditing(false)
      resetEditor()
      showNotice()
    } catch (err) {
      console.error('Failed to save article:', err)
      setSaveError('Failed to save article. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (postId) => {
    setIsDeleting(true)
    setSaveError('')
    try {
      await deleteNews(postId)
      if (selectedPost?.id === postId) {
        setIsEditing(false)
        resetEditor()
      }
    } catch (err) {
      console.error('Failed to delete article:', err)
      setSaveError('Failed to delete article. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {savedNotice && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-emerald-700 shadow-lg">
          <CheckCircle size={18} className="text-emerald-500" /> Article saved successfully!
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">News & Announcements</h2>
          <p className="mt-1 text-slate-500">
            Publish and manage campus news and announcements from the backend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            {publishedCount} published / {news.length} total
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            <Plus size={18} /> Post Article
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className={`w-full ${isEditing ? 'lg:w-1/3' : ''} space-y-4`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-800">Recent Posts ({news.length})</h3>
            </div>
            <div className="max-h-[800px] divide-y divide-slate-100 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" /> Loading articles...
                </div>
              )}
              {!loading && news.length === 0 && (
                <div className="p-10 text-center text-sm text-slate-400">
                  No articles yet. Click "Post Article" to create one.
                </div>
              )}
              {(news || []).map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleEdit(post)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-slate-50 ${
                    selectedPost?.id === post.id ? 'border-l-4 border-indigo-500 bg-indigo-50' : ''
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-2 text-sm font-semibold text-slate-800">{post.title}</h4>
                    <span
                      className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium ${
                        post.is_published
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                          : 'border-amber-100 bg-amber-50 text-amber-600'
                      }`}
                    >
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                    {post.summary || post.content || 'No summary yet.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(post.published_at)}
                    </span>
                    <span>{post.author_name || 'Admin'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-800">
                  {selectedPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                {selectedPost && (
                  <button
                    onClick={() => handleDelete(selectedPost.id)}
                    disabled={isDeleting}
                    className="rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50"
                    title="Delete this article"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                )}
              </div>

              <div className="space-y-5 p-6">
                {saveError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {saveError}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Article Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter a clear article title..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Campus</option>
                      <option>Alumni Success</option>
                      <option>Events</option>
                      <option>Careers</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1.5">
                    <label className="flex cursor-pointer items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.isPublished}
                          onChange={() => handleChange('isPublished', !form.isPublished)}
                        />
                        <div
                          className={`block h-6 w-10 rounded-full transition-colors ${
                            form.isPublished ? 'bg-indigo-500' : 'bg-slate-300'
                          }`}
                        />
                        <div
                          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            form.isPublished ? 'translate-x-4' : ''
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Publish immediately
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Cover Image URL
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
                      <ImageIcon size={16} className="text-slate-400" /> Use an image URL stored by
                      the backend
                    </div>
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => handleChange('image', e.target.value)}
                      placeholder="https://example.com/news-cover.jpg"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                    {form.image && (
                      <img
                        src={form.image}
                        alt="Article cover preview"
                        className="mt-4 h-40 w-full rounded-xl border border-slate-200 object-cover"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Summary
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    rows={3}
                    placeholder="Brief excerpt for lists and cards..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Content <span className="text-rose-500">*</span>
                  </label>
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <FileText size={14} /> Article body saved directly to the backend.
                  </div>
                  <textarea
                    value={form.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={12}
                    placeholder="Write the full announcement here..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-5">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    resetEditor()
                  }}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !form.title.trim() || !form.content.trim()}
                  className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </span>
                  ) : form.isPublished ? (
                    'Save & Publish'
                  ) : (
                    'Save Draft'
                  )}
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
