'use client';

import { useState, useEffect, useRef } from 'react';
import { Blog } from '@/types';
import { blogsApi, categoriesApi } from '@/lib/api';
import { toast } from 'sonner';
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { TipTapEditor } from '@/components/shared/TipTapEditor';
import { useQuery } from '@tanstack/react-query';

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedPosts: string[];
  isPublished: boolean;
  faqs: { question: string; answer: string }[];
  faqsTitle: string;
  metaTitle: string;
  metaDescription: string;
}

interface BlogFormProps {
  blog?: Blog | null;
  existingBlogs: Blog[];
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#445df0] focus:border-transparent bg-white';

function Field({ label, children, span2 = false }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-1.5 ${span2 ? 'sm:col-span-2' : ''}`}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function BlogForm({ blog, existingBlogs, onSubmit, isSubmitting, onCancel }: BlogFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [readTime, setReadTime] = useState('');
  const [content, setContent] = useState('');
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [faqsTitle, setFaqsTitle] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const coverRef = useRef<HTMLInputElement>(null);
  const blogId = blog?._id ?? '';

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.getAll({ includeInactive: true });
      return res.data.data;
    },
  });

  const categories = categoriesData ?? [];

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug);
      setExcerpt(blog.excerpt);
      setCategory(typeof blog.category === 'object' ? blog.category._id : blog.category);
      setCoverImage(blog.coverImage ?? null);
      setTagsInput(blog.tags.join(', '));
      setReadTime(blog.readTime ?? '');
      setContent(blog.content ?? '');
      setRelatedPosts((blog.relatedPosts ?? []).map((p: any) => typeof p === 'string' ? p : p._id));
      setIsPublished(blog.isPublished);
      setFaqs(blog.faqs && blog.faqs.length > 0 ? blog.faqs : [{ question: '', answer: '' }]);
      setFaqsTitle(blog.faqsTitle ?? '');
      setMetaTitle(blog.metaTitle ?? '');
      setMetaDescription(blog.metaDescription ?? '');
    }
  }, [blog]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!blog) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!blogId) { toast.error('Save the blog first before uploading a cover image'); return; }
    setCoverUploading(true);
    try {
      const result = await blogsApi.uploadImage(file, blogId);
      setCoverImage(result.imageUrl);
      toast.success('Cover image uploaded');
    } catch (e: any) {
      toast.error(e.message || 'Cover upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!blogId) { toast.error('Save the blog first before uploading images'); throw new Error('No blogId'); }
    const result = await blogsApi.uploadImage(file, blogId);
    return result.imageUrl;
  };

  const toggleRelated = (id: string) =>
    setRelatedPosts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  const updateFaq = (index: number, field: 'question' | 'answer', val: string) =>
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: val } : f)));
  const addFaq = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  const removeFaq = (index: number) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error('Title, slug, excerpt and category are required');
      return;
    }
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const cleanFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    await onSubmit({
      title, slug, excerpt, category, coverImage, tags,
      readTime: readTime || undefined, content, relatedPosts,
      isPublished, faqs: cleanFaqs, faqsTitle, metaTitle, metaDescription,
    });
  };

  const otherBlogs = existingBlogs.filter((b) => b._id !== blog?._id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title *" span2>
            <input className={inputCls} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Blog title" />
          </Field>
          <Field label="Slug *">
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="blog-slug" />
          </Field>
          <Field label="Category *">
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Excerpt *" span2>
            <textarea className={inputCls} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description shown on listing page" rows={2} />
          </Field>
          <Field label="Tags (comma separated)">
            <input className={inputCls} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Fintech, Payments, Tips" />
          </Field>
          <Field label="Read Time">
            <input className={inputCls} value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="5 min read" />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cover Image</h2>
        {!blogId ? (
          <p className="text-xs text-slate-400">Save the blog first to enable cover image upload.</p>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={coverUploading}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              {coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {coverUploading ? 'Uploading...' : 'Upload Cover'}
            </button>
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCoverUpload(file); }} />
            {coverImage && <span className="text-xs text-green-600">✓ Cover uploaded</span>}
          </div>
        )}
        {coverImage && <img src={coverImage} alt="Cover" className="w-full max-h-60 object-cover rounded-lg mt-2" />}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Content</h2>
        {!blogId && <p className="text-xs text-slate-400">Save the blog first to enable inline image uploads.</p>}
        <TipTapEditor value={content} onChange={setContent} onImageUpload={handleEditorImageUpload} />
      </div>

      {otherBlogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Related Posts</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {otherBlogs.map((b) => (
              <label key={b._id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={relatedPosts.includes(b._id)}
                  onChange={() => toggleRelated(b._id)} className="accent-[#445df0]" />
                <span className="text-sm text-slate-700">{b.title}</span>
                <span className="text-xs text-slate-400 ml-auto capitalize">
                  {typeof b.category === 'object' ? b.category.name : b.category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">FAQs</h2>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Section Heading</label>
          <input className={inputCls} value={faqsTitle} onChange={(e) => setFaqsTitle(e.target.value)} placeholder="Frequently asked questions" />
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">FAQ {i + 1}</span>
              <button type="button" onClick={() => removeFaq(i)} disabled={faqs.length <= 1}
                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <input className={inputCls} value={faq.question} onChange={(e) => updateFaq(i, 'question', e.target.value)} placeholder="Question" />
            <textarea className={inputCls} value={faq.answer} onChange={(e) => updateFaq(i, 'answer', e.target.value)} placeholder="Answer" rows={3} />
          </div>
        ))}
        <button type="button" onClick={addFaq}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
          <Plus className="h-3 w-3" /> Add FAQ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">SEO</h2>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Meta Title</label>
          <input className={inputCls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Leave empty to use blog title" />
          <p className="text-xs text-slate-400">
            {metaTitle.length}/60 characters
            {metaTitle.length > 60 && <span className="text-red-500"> — too long</span>}
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Meta Description</label>
          <textarea className={inputCls} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Leave empty to use excerpt" rows={3} />
          <p className="text-xs text-slate-400">
            {metaDescription.length}/160 characters
            {metaDescription.length > 160 && <span className="text-red-500"> — too long</span>}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-[#445df0] w-4 h-4" />
          <span className="text-sm font-medium text-slate-700">Publish immediately</span>
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#445df0] hover:bg-[#2f44c9] text-white rounded-lg disabled:opacity-60 transition-colors">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {blog ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      </div>
    </div>
  );
}