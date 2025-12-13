import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { apiService } from '../../utils/apiService';
import type { BlogEntryInput, BlogCategory } from '../../utils/types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<BlogCategory[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState<BlogEntryInput>({
    title: '',
    content: '',
    excerpt: '',
    published: false,
    featured_image: '',
    categories: [],
  });

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    editable: !saving,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({
        ...prev,
        content: html,
      }));
    },
  });

  // Update editor content when formData.content changes (e.g., when loading an entry)
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

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
      
      // Find selected categories
      const selected: BlogCategory[] = [];
      if (entry.categories && entry.categories.length > 0) {
        const allCategories = await apiService.getBlogCategories();
        entry.categories.forEach(catId => {
          const cat = allCategories.find(c => c.id === catId);
          if (cat) selected.push(cat);
        });
      } else if (entry.category) {
        // Fallback for old single category format
        const allCategories = await apiService.getBlogCategories();
        const cat = allCategories.find(c => c.id === entry.category);
        if (cat) selected.push(cat);
      }
      
      setSelectedCategories(selected);
      setFormData({
        title: entry.title,
        content: entry.content,
        excerpt: entry.excerpt || '',
        published: entry.published,
        featured_image: entry.featured_image || '',
        categories: selected,
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

  const handleCategoryToggle = (category: BlogCategory) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some(c => c.id === category.id);
      const newSelected = isSelected
        ? prev.filter(c => c.id !== category.id)
        : [...prev, category];
      
      // Update formData with the new selection
      setFormData((prevForm) => ({
        ...prevForm,
        categories: newSelected,
      }));
      
      return newSelected;
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Nazwa kategorii nie może być pusta');
      return;
    }

    try {
      const newCategory = await apiService.createCategory(newCategoryName.trim());
      setCategories([...categories, newCategory]);
      // Auto-select the newly created category
      const updatedCategories = [...selectedCategories, newCategory];
      setSelectedCategories(updatedCategories);
      setFormData((prev) => ({
        ...prev,
        categories: updatedCategories,
      }));
      setNewCategoryName('');
      setShowCategoryInput(false);
      setError('');
    } catch (err) {
      setError('Nie udało się utworzyć kategorii');
      console.error(err);
    }
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategorie
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryInput(!showCategoryInput)}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj kategorię</span>
            </button>
          </div>
          
          {showCategoryInput && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nazwa nowej kategorii"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Utwórz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryInput(false);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
          
          {/* Multi-select dropdown */}
          <MultiSelectDropdown
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleCategoryToggle}
            disabled={saving}
            placeholder="Wybierz kategorie..."
          />
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Możesz wybrać wiele kategorii dla tego wpisu. Slug kategorii (np. "{(categories && categories.length > 0) ? categories[0].slug : 'relacje-z-meczy'}") jest używany w adresach URL.
          </p>
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
            Treść * (edytor HTML)
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('bold') ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('italic') ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('strike') ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                <s>S</s>
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                H3
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                1. Lista
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-500 mx-1"></div>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                disabled={saving}
                className={`px-3 py-1 rounded ${editor?.isActive('blockquote') ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200'} border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50`}
              >
                Cytat
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                disabled={saving}
                className="px-3 py-1 rounded bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                ─ Linia
              </button>
            </div>
            
            {/* Editor */}
            <div className="prose prose-lg dark:prose-invert max-w-none p-4 min-h-[400px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <EditorContent editor={editor} />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Używaj paska narzędzi do formatowania tekstu w HTML
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
