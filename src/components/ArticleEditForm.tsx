import { useState } from 'react';
import type { Article, ArticleStatus } from '../types';

interface ArticleEditFormProps {
  article: Article;
  onSave: (updatedArticle: Article) => Promise<void>;
  onCancel: () => void;
}

export function ArticleEditForm({ article, onSave, onCancel }: ArticleEditFormProps) {
  const [formData, setFormData] = useState<Article>(article);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.section.trim()) errors.section = "Section is required";
    if (!formData.summary.trim()) {
      errors.summary = "Summary is required";
    } else if (formData.summary.length < 10) {
      errors.summary = "Summary must be at least 10 characters long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!validate()) return;

    try {
      setIsSaving(true);
      await onSave(formData);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-form-container">
      <h2>Edit Article</h2>

      {saveError && <div className="error-state">Save Error: {saveError}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            disabled={isSaving}
            aria-invalid={!!validationErrors.title}
          />
          {validationErrors.title && <span className="validation-error">{validationErrors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="section">Section</label>
          <input
            id="section"
            name="section"
            type="text"
            value={formData.section}
            onChange={handleChange}
            disabled={isSaving}
            aria-invalid={!!validationErrors.section}
          />
          {validationErrors.section && <span className="validation-error">{validationErrors.section}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSaving}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            name="summary"
            rows={4}
            value={formData.summary}
            onChange={handleChange}
            disabled={isSaving}
            aria-invalid={!!validationErrors.summary}
          />
          {validationErrors.summary && <span className="validation-error">{validationErrors.summary}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isSaving} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn-save">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}