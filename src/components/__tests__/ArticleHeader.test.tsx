import { render, screen } from '@testing-library/react';
import ArticleHeader from '../ArticleHeader';

test('renders article title', () => {
  render(<ArticleHeader article={{ title: 'Test Title', source: { name: 'مصدر', id: null }, author: '', description: '', url: '', urlToImage: '', publishedAt: '', content: '', slug: '', category: '' }} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
}); 