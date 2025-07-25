import { render, screen } from '@testing-library/react';
import ArticleHeader from '../ArticleHeader';

test('renders article title', () => {
  render(<ArticleHeader article={{ title: 'Test Title', source: { name: 'مصدر', id: null }, author: '', description: '', url: '', published_at: '', content: '', slug: '', category: '', image_url: '' }} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
}); 