const fs = require('fs');
const path = require('path');

// Ensure the correct PostCSS config is used
const postcssConfigPath = process.env.POSTCSS_CONFIG_PATH || 'postcss.config.cjs';
const postcssConfigContent = `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`;

// Write the PostCSS config file
fs.writeFileSync(path.join(process.cwd(), postcssConfigPath), postcssConfigContent);

console.log(`Created PostCSS config at ${postcssConfigPath}`);

// Execute the build command
const { execSync } = require('child_process');
execSync('npm run build', { stdio: 'inherit' }); 