import type { BlogEntry, BlogEntryInput, BlogCategory, User, AuthTokens, LoginCredentials } from './types';
import blogData from '../mock-data/blogEntries.json';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to extract category IDs from BlogCategory objects or numbers
const extractCategoryIds = (categories: (BlogCategory | number)[]): number[] => {
  return categories.map(cat => typeof cat === 'number' ? cat : cat.id);
};

// Mock storage for blog entries (will be lost on page refresh)
const mockBlogEntries: BlogEntry[] = [...blogData.entries];
let nextId = Math.max(...mockBlogEntries.map(e => e.id)) + 1;

// Mock users
const mockUsers = blogData.users as User[];

// Mock categories
const mockCategories: BlogCategory[] = [...blogData.categories];

// Mock tokens
const MOCK_ACCESS_TOKEN = 'mock-access-token-12345';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-67890';

export const mockApiService = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<{ tokens?: AuthTokens; user: User }> {
    await delay(500);
    
    // Check credentials (simple mock validation)
    const user = mockUsers.find(u => u.username === credentials.username);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // In a real app, we'd validate the password
    // For mock, accept any password for demo purposes
    if (credentials.password.length < 3) {
      throw new Error('Invalid credentials');
    }
    
    return {
      tokens: {
        access: MOCK_ACCESS_TOKEN,
        refresh: MOCK_REFRESH_TOKEN,
      },
      user,
    };
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    await delay(300);
    
    if (refreshToken !== MOCK_REFRESH_TOKEN) {
      throw new Error('Invalid refresh token');
    }
    
    return {
      access: MOCK_ACCESS_TOKEN,
    };
  },

  async getCurrentUser(): Promise<User> {
    await delay(300);
    
    // Return the admin user by default
    return mockUsers[0];
  },

  // Blog
  async getBlogEntries(): Promise<BlogEntry[]> {
    await delay(500);
    return [...mockBlogEntries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getBlogEntry(id: number): Promise<BlogEntry> {
    await delay(400);
    const entry = mockBlogEntries.find(e => e.id === id);
    
    if (!entry) {
      throw new Error('Blog entry not found');
    }
    
    return entry;
  },

  async createBlogEntry(entry: BlogEntryInput): Promise<BlogEntry> {
    await delay(600);
    
    // Get categories from entry
    let categoryIds: number[] = [];
    if (entry.categories && entry.categories.length > 0) {
      categoryIds = extractCategoryIds(entry.categories);
    } else if (entry.category) {
      categoryIds = [entry.category];
    }
    
    const category = categoryIds.length > 0 ? mockCategories.find(c => c.id === categoryIds[0]) : undefined;
    
    // Convert File to URL for mock purposes
    let featuredImageUrl = entry.featured_image;
    if (entry.featured_image instanceof File) {
      // For mock purposes, create a placeholder URL
      featuredImageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(entry.featured_image.name)}`;
    }
    
    const newEntry: BlogEntry = {
      id: nextId++,
      title: entry.title,
      slug: entry.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      content: entry.content,
      author: 1, // Admin user
      author_name: 'Admin User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published: entry.published,
      excerpt: entry.excerpt || '',
      featured_image: typeof featuredImageUrl === 'string' ? featuredImageUrl : '',
      categories: categoryIds,
      category: categoryIds.length > 0 ? categoryIds[0] : undefined,
      category_name: category?.name,
    };
    
    mockBlogEntries.push(newEntry);
    return newEntry;
  },

  async getBlogCategories(): Promise<BlogCategory[]> {
    await delay(300);
    return [...mockCategories];
  },

  async createCategory(categoryName: string): Promise<BlogCategory> {
    await delay(400);
    const newCategory: BlogCategory = {
      id: Math.max(...mockCategories.map(c => c.id)) + 1,
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  async updateCategory(id: number, categoryName: string): Promise<BlogCategory> {
    await delay(400);
    const index = mockCategories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    mockCategories[index] = {
      ...mockCategories[index],
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
    };
    return mockCategories[index];
  },

  async deleteCategory(id: number): Promise<void> {
    await delay(400);
    const index = mockCategories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    mockCategories.splice(index, 1);
  },

  async updateBlogEntry(id: number, entry: Partial<BlogEntryInput>): Promise<BlogEntry> {
    await delay(600);
    
    const index = mockBlogEntries.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Blog entry not found');
    }
    
    // Get categories from entry
    let categoryIds: number[] | undefined;
    if (entry.categories && entry.categories.length > 0) {
      categoryIds = extractCategoryIds(entry.categories);
    } else if (entry.category) {
      categoryIds = [entry.category];
    }
    
    const category = categoryIds && categoryIds.length > 0 ? mockCategories.find(c => c.id === categoryIds[0]) : undefined;
    
    // Convert File to URL for mock purposes
    let featuredImageUrl = entry.featured_image;
    if (entry.featured_image instanceof File) {
      // For mock purposes, create a placeholder URL
      featuredImageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(entry.featured_image.name)}`;
    }
    
    const updatedEntry: BlogEntry = {
      ...mockBlogEntries[index],
      ...entry,
      featured_image: typeof featuredImageUrl === 'string' ? featuredImageUrl : mockBlogEntries[index].featured_image,
      categories: categoryIds || mockBlogEntries[index].categories,
      category: categoryIds && categoryIds.length > 0 ? categoryIds[0] : mockBlogEntries[index].category,
      category_name: category?.name || mockBlogEntries[index].category_name,
      updated_at: new Date().toISOString(),
    };
    
    mockBlogEntries[index] = updatedEntry;
    return updatedEntry;
  },

  async deleteBlogEntry(id: number): Promise<void> {
    await delay(500);
    
    const index = mockBlogEntries.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Blog entry not found');
    }
    
    mockBlogEntries.splice(index, 1);
  },
};
