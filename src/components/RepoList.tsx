import React, { useEffect, useState } from 'react';
import { GITHUB_API_CONFIG } from '../config';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
  forks_count: number;
  updated_at: string;
}

interface RepoListProps {
  username: string;
}

function RepoList({ username }: RepoListProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRepos = async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=6&page=${pageNum}`,
        { headers: GITHUB_API_CONFIG.headers }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch repos: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if there are more pages
      const linkHeader = response.headers.get('Link');
      const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
      setHasMore(!!hasNextPage);
      
      if (append) {
        setRepos(prevRepos => [...prevRepos, ...data]);
      } else {
        setRepos(data);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchRepos(1);
    }
  }, [username]);

  const handleShowAll = () => {
    setShowAll(true);
    fetchRepos(2, true);
    setPage(2);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchRepos(nextPage, true);
    setPage(nextPage);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="error-message">
            <p className="error-text">Error: {error}</p>
            {error.includes('403') && (
              <p className="error-details">
                Rate limit exceeded. Please add a GitHub token to increase the rate limit.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="empty-message">
            <p>No repositories found for this user.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Repositories</h2>
      </div>
      <div className="card-content">
        <div className="repo-list">
          {repos.map((repo) => (
            <div key={repo.id} className="repo-item">
              <div className="repo-content">
                <h3 className="repo-name">
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="repo-link"
                  >
                    {repo.name}
                  </a>
                </h3>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
                <div className="repo-meta">
                  <div className="repo-stats">
                    <span className="repo-stat">
                      ⭐ {repo.stargazers_count}
                    </span>
                    <span className="repo-stat">
                      🍴 {repo.forks_count}
                    </span>
                  </div>
                  <div className="repo-info">
                    {repo.language && (
                      <span className="repo-language">
                        {repo.language}
                      </span>
                    )}
                    <span className="repo-updated">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!showAll && repos.length >= 6 && (
          <div className="show-more-container">
            <button 
              className="button show-more-button" 
              onClick={handleShowAll}
            >
              Show All Repositories
            </button>
          </div>
        )}
        
        {showAll && hasMore && (
          <div className="show-more-container">
            <button 
              className="button show-more-button" 
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepoList;