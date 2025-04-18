# GitHub Repository Explorer

A React application that allows users to explore GitHub repositories and analyze commit activity. Built with Vite, TypeScript, and Recharts.

[Live link](https://elegant-blini-81680b.netlify.app/)


## Features

- Search for GitHub users and view their repositories
- View commit activity over different time periods (1 week, 1 month, 1 year, all time)
- Interactive charts showing commit distribution
- Dark mode support
- Responsive design

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- A GitHub account (for API access)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/repo-finder.git
cd repo-finder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Edit the `.env` file and add your GitHub token:
```bash
cp .env.example .env
```

To get a GitHub token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select the following scopes:
   - `repo` (for private repositories)
   - `read:user` (for user information)
4. Copy the token and paste it in your `.env` file

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Variables

- `VITE_GITHUB_TOKEN`: Your GitHub personal access token (required)
- `VITE_GITHUB_API_URL`: Custom GitHub API URL (optional)
- `VITE_RATE_LIMIT_WARNING`: Rate limit warning threshold (optional)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
