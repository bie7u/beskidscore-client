import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { apiService } from '../../utils/apiService';
import type { BlogEntryInput, BlogCategory } from '../../utils/types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<BlogEntryInput>({
    title: '',
    content: '',
    excerpt: '',
    published: false,
    featured_image: '',
    category: undefined,
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getBlogCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadEntry = async () => {
    try {
      setLoading(true);
      const entry = await apiService.getBlogEntry(Number(id));
      setFormData({
        title: entry.title,
        content: entry.content,
        excerpt: entry.excerpt || '',
        published: entry.published,
        featured_image: entry.featured_image || '',
        category: entry.category,
      });
      // Set image preview if there's an existing featured image
      if (entry.featured_image) {
        setImagePreview(entry.featured_image);
      }
      setError('');
    } catch (err) {
      setError('Nie udało się załadować wpisu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await apiService.updateBlogEntry(Number(id), formData);
      } else {
        await apiService.createBlogEntry(formData);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError('Nie udało się zapisać wpisu');
      console.error(err);
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'category' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Proszę wybrać plik obrazu');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Plik jest za duży. Maksymalny rozmiar to 5MB');
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        featured_image: file,
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      featured_image: '',
    }));
    setImagePreview('');
  };

  const handleContentChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      content: value || '',
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/blog"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do listy</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isEditing ? 'Edytuj wpis' : 'Nowy wpis'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditing ? 'Zaktualizuj istniejący wpis blogowy' : 'Utwórz nowy wpis blogowy'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tytuł *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            placeholder="Wprowadź tytuł wpisu"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategoria
          </label>
          <select
            id="category"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="">Brak kategorii</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt (krótki opis)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            disabled={saving}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            placeholder="Krótki opis wpisu (opcjonalnie)"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Treść * (obsługuje Markdown i HTML)
          </label>
          <div data-color-mode={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}>
            <MDEditor
              value={formData.content}
              onChange={handleContentChange}
              preview="edit"
              height={400}
              textareaProps={{
                disabled: saving,
                placeholder: 'Wprowadź treść wpisu używając Markdown...'
              }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Obsługuje formatowanie Markdown: **pogrubienie**, *kursywa*, # nagłówki, [linki](url), ![obrazy](url)
          </p>
        </div>

        {/* Featured Image */}
        <div>
          <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Obraz wyróżniający
          </label>
          
          {imagePreview && (
            <div className="mb-4 relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-xs h-auto rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                title="Usuń obraz"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <label
              htmlFor="featured_image"
              className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>{imagePreview ? 'Zmień obraz' : 'Wybierz obraz'}</span>
            </label>
            <input
              id="featured_image"
              name="featured_image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={saving}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Dozwolone formaty: JPG, PNG, GIF. Maksymalny rozmiar: 5MB
          </p>
        </div>

        {/* Published */}
        <div className="flex items-center">
          <input
            id="published"
            name="published"
            type="checkbox"
            checked={formData.published}
            onChange={handleChange}
            disabled={saving}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Opublikuj wpis
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/admin/blog"
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Anuluj
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Zapisywanie...' : 'Zapisz'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;
