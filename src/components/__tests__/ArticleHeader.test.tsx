import { render, screen } from '@testing-library/react';
import ArticleHeader from '../ArticleHeader';

// Mock the analytics module
jest.mock('@/utils/analytics', () => ({
  trackEvent: jest.fn(),
}));

// Mock the favorites service
jest.mock('@services/favorites', () => ({
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  isFavorite: jest.fn().mockResolvedValue(false),
}));

// Mock the auth hook
jest.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    timeout: false,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  }),
}));

test('renders article title', () => {
  const mockArticle = {
    title: 'Test Title',
          source: { name: 'Source', id: null },
    author: '',
    description: '',
    url: '',
    published_at: '2024-01-01T00:00:00Z',
    content: '',
    slug: 'test-article',
    category: 'test',
    image_url: ''
  };

  render(<ArticleHeader article={mockArticle} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
}); 