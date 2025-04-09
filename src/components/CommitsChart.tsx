import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GITHUB_API_CONFIG } from '../config';

interface CommitData {
  name: string;
  commits: number;
}

interface CommitsChartProps {
  username: string;
}

function CommitsChart({ username }: CommitsChartProps) {
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommitData = async () => {
      try {
        setLoading(true);
        // First, get the user's repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
          { headers: GITHUB_API_CONFIG.headers }
        );
        
        if (!reposResponse.ok) {
          throw new Error(`Failed to fetch repos: ${reposResponse.status}`);
        }
        
        const repos = await reposResponse.json();
        
        // For each repo, get the commit count
        const commitPromises = repos.slice(0, 5).map(async (repo: any) => {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`,
            { headers: GITHUB_API_CONFIG.headers }
          );
          
          if (!commitsResponse.ok) {
            return { name: repo.name, commits: 0 };
          }
          
          // GitHub API returns a Link header with the total count
          const linkHeader = commitsResponse.headers.get('Link');
          let commitCount = 0;
          
          if (linkHeader) {
            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (match) {
              commitCount = parseInt(match[1], 10);
            }
          } else {
            // If no Link header, count is 1 or less
            commitCount = 1;
          }
          
          return { 
            name: repo.name.length > 15 ? repo.name.substring(0, 12) + '...' : repo.name, 
            commits: commitCount 
          };
        });
        
        const results = await Promise.all(commitPromises);
        
        // Sort by commit count
        const sortedData = results.sort((a, b) => b.commits - a.commits);
        
        setCommitData(sortedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCommitData();
    }
  }, [username]);

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

  if (commitData.length === 0) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="empty-message">
            <p>No commit data available for this user.</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {payload[0].value} commits
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Top Repositories by Commits</h2>
      </div>
      <div className="card-content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={commitData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                interval={0}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                label={{ 
                  value: 'Commits', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#6b7280'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="commits" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default CommitsChart;