require('dotenv').config();
const fetch = require('node-fetch');

async function testGitHubToken() {
  const token = process.env.VITE_GITHUB_TOKEN;
  
  if (!token) {
    console.error('GitHub token not found in .env file');
    return;
  }
  
  console.log('Testing GitHub token...');
  
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Token is valid!');
      console.log(`Authenticated as: ${data.login}`);
      console.log(`Rate limit remaining: ${response.headers.get('x-ratelimit-remaining')}`);
    } else {
      console.error(`Token validation failed: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.error('Error details:', errorData);
    }
  } catch (error) {
    console.error('Error testing token:', error.message);
  }
}

testGitHubToken(); 