/// <reference types="@testing-library/jest-dom" />
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import App from './App';
import { ArticleEditForm } from './components/ArticleEditForm';

vi.mock('./services/storage', () => ({
  fetchArticles: vi.fn(() => Promise.resolve([
    {
      id: '1',
      title: 'React Testing Guide',
      author: 'Jane Doe',
      section: 'Technology',
      status: 'published',
      summary: 'A comprehensive guide to testing React applications.',
      publishedAt: '2026-01-01'
    },
    {
      id: '2',
      title: 'Advanced CSS',
      author: 'John Smith',
      section: 'Design',
      status: 'draft',
      summary: 'Learning modern CSS layouts and variables.',
      publishedAt: null
    }
  ])),
  updateArticle: vi.fn((article) => Promise.resolve(article))
}));

describe('Article Review App Requirements', () => {

  // Test 1: Filtering
  it('1. filters the article list correctly based on search input', async () => {
    render(<App />);

    // Wait for the mock data to load
    expect(await screen.findByText('React Testing Guide')).toBeInTheDocument();

    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'CSS' } });

    // Verify the list is filtered
    expect(screen.queryByText('React Testing Guide')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced CSS')).toBeInTheDocument();
  });

  // Test 2: Missing-article behavior (Empty State)
  it('2. displays an empty state message when no articles match the filters', async () => {
    render(<App />);
    expect(await screen.findByText('React Testing Guide')).toBeInTheDocument();

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentGibberishValue' } });

    // Verify the empty state renders
    expect(screen.getByText('No articles match your criteria.')).toBeInTheDocument();
  });

  // Test 3: Validation
  it('3. prevents submission and shows validation error when title is empty', () => {
    const mockSave = vi.fn();
    const mockArticle = {
      id: '1', title: 'Valid Title', author: 'Me', section: 'Tech', status: 'draft', summary: 'This summary is definitely long enough.', publishedAt: null
    };

    // Render the form directly for isolated testing
    render(
      <ArticleEditForm
        article={mockArticle as any}
        onSave={mockSave}
        onCancel={() => {}}
      />
    );

    // Clear the title input
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: '' } });

    // Attempt to submit
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Verify error is shown and save was not called
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockSave).not.toHaveBeenCalled();
  });

  // Test 4: Successful update
  it('4. calls the save handler successfully with updated form data', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    const mockArticle = {
      id: '1', title: 'Old Title', author: 'Me', section: 'Tech', status: 'draft', summary: 'This summary is definitely long enough.', publishedAt: null
    };

    render(
      <ArticleEditForm
        article={mockArticle as any}
        onSave={mockSave}
        onCancel={() => {}}
      />
    );

    // Change the title
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Brand New Title' } });

    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Verify the parent function was called with the new title
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Brand New Title'
      }));
    });
  });

});