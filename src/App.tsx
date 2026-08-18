import { useState, useEffect, useMemo } from 'react';
import type { Article, FilterCriteria } from './types';
import { fetchArticles, updateArticle } from './services/storage';
import { FilterBar } from './components/FilterBar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleEditForm } from './components/ArticleEditForm';
import './App.css';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean> (true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [filters, setFilters] = useState<FilterCriteria>({
    search: '',
    section: '',
    status: '',
    sortBy: 'date'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode])

  useEffect(() =>{
    let isMounted = true;

    const loadData = async () => {
      try{
        setIsLoading(true);
        const data = await fetchArticles();
        if(isMounted){
          setArticles(data);
          setError(null);
        }
      } catch(err){
        if(isMounted){
          setError(err instanceof Error ? err.message : "An unknown error ocurred");
        }
      } finally{
        if(isMounted){
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);


  const handleSaveArticle = async (updatedArticle: Article) => {
    const savedArticle = await updateArticle(updatedArticle);

    setArticles(prevArticles =>
      prevArticles.map(art => art.id === savedArticle.id ? savedArticle : art)
    );

    setSelectedArticleId(null);
    alert("Article saved successfully!");
  };

  // Derived Data
  // I used useMemo because it allows me to recalculate automatically the filtered list just when necessary
  // speeding up the app

  const availableStatuses = useMemo(() => {
    return Array.from(new Set(articles.map(a => a.status)));
  }, [articles]);

  const availableSections = useMemo(() => {
    return Array.from(new Set(articles.map(a => a.section)));
  }, [articles]);

  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles];

    if(filters.search){
      const lowerSearch = filters.search.toLowerCase();
      result = result.filter(
        a => a.title.toLowerCase().includes(lowerSearch) ||
             a.author.toLowerCase().includes(lowerSearch)
      );
    }

    if(filters.section){
      result = result.filter(a => a.section === filters.section);
    }

    if(filters.status){
      result = result.filter(a => a.status === filters.status);
    }

    result.sort((a, b) => {
      if(filters.sortBy === 'title'){
        return a.title.localeCompare(b.title);
      }
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;

      return dateB - dateA;
    });

    return result;
  }, [articles, filters]); // Recalculate if articles or filters change

  if(isLoading)
      return <div className="loading-state"> Loading articles...</div>;
  if(error)
      return <div className="error-state">Error: {error}</div>

  if (selectedArticleId) {
    const articleToEdit = articles.find(a => a.id === selectedArticleId);

    if (!articleToEdit) {
      return (
        <div className="error-state">
          <h2>Article not found</h2>
          <button onClick={() => setSelectedArticleId(null)}>Return to List</button>
        </div>
      );
    }

    return (
      <div className="app-container">
        <ArticleEditForm
          article={articleToEdit}
          onSave={handleSaveArticle}
          onCancel={() => setSelectedArticleId(null)}
        />
      </div>
    );
  }

  // RENDERING
  return (
    <div className="app-container">
      <header style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h1>Article Review App</h1>
        <button
          className="theme-toggle-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <main>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          availableSections={availableSections}
          availableStatuses={availableStatuses}
        />

        <p className="results-count">
          Showing {filteredAndSortedArticles.length} of {articles.length} articles
        </p>

        {filteredAndSortedArticles.length === 0 ? (
          <div className="empty-state">No articles match your criteria.</div>
        ) : (
          <div className="articles-grid">
            {filteredAndSortedArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={setSelectedArticleId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App