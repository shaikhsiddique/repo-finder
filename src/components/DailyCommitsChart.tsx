import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GITHUB_API_CONFIG } from '../config';

interface DailyCommitData {
  date: string;
  commits: number;
}

interface DailyCommitsChartProps {
  username: string;
}

type TimeRange = '1week' | '1month' | '1year' | 'all';

function DailyCommitsChart({ username }: DailyCommitsChartProps) {
  const [commitData, setCommitData] = useState<DailyCommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1month');

  const getDateRange = (range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case '1week':
        return new Date(now.setDate(now.getDate() - 7));
      case '1month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case '1year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case 'all':
        return new Date(0); // Beginning of time
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  };

  useEffect(() => {
    const fetchDailyCommits = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the user's repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
          { headers: GITHUB_API_CONFIG.headers }
        );
        
        if (!reposResponse.ok) {
          throw new Error(`Failed to fetch repos: ${reposResponse.status}`);
        }
        
        const repos = await reposResponse.json();
        
        // Get commits for the selected time range
        const startDate = getDateRange(timeRange);
        
        // Initialize commit data for the selected time range
        const dailyCommits: { [key: string]: number } = {};
        const now = new Date();
        let currentDate = new Date(startDate);
        
        while (currentDate <= now) {
          const dateStr = currentDate.toISOString().split('T')[0];
          dailyCommits[dateStr] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Fetch commit activity for each repo
        const commitPromises = repos.map(async (repo: any) => {
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/commits?since=${startDate.toISOString()}`,
            { headers: GITHUB_API_CONFIG.headers }
          );
          
          if (!commitsResponse.ok) {
            return [];
          }
          
          const commits = await commitsResponse.json();
          
          // Count commits by date
          commits.forEach((commit: any) => {
            const commitDate = commit.commit.author.date.split('T')[0];
            if (dailyCommits[commitDate] !== undefined) {
              dailyCommits[commitDate]++;
            }
          });
          
          return commits;
        });
        
        await Promise.all(commitPromises);
        
        // Convert to array format for the chart
        const chartData = Object.entries(dailyCommits)
          .map(([date, commits]) => ({ date, commits }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        setCommitData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchDailyCommits();
    }
  }, [username, timeRange]);

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
        <h2 className="card-title">Daily Commit Activity</h2>
        <div className="time-range-selector">
          <button 
            className={`time-range-button ${timeRange === '1week' ? 'active' : ''}`}
            onClick={() => setTimeRange('1week')}
          >
            1 Week
          </button>
          <button 
            className={`time-range-button ${timeRange === '1month' ? 'active' : ''}`}
            onClick={() => setTimeRange('1month')}
          >
            1 Month
          </button>
          <button 
            className={`time-range-button ${timeRange === '1year' ? 'active' : ''}`}
            onClick={() => setTimeRange('1year')}
          >
            1 Year
          </button>
          <button 
            className={`time-range-button ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                interval={timeRange === 'all' ? 30 : timeRange === '1year' ? 15 : 2}
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
              <Line 
                type="monotone" 
                dataKey="commits" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DailyCommitsChart; 