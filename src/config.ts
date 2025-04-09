// GitHub API configuration
export const GITHUB_API_CONFIG = {
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    // Add your GitHub token here
    'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
  },
}; 