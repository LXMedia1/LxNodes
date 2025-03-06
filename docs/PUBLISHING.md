# Publishing to GitHub and npm

This guide provides instructions for publishing the WebRequest nodes to GitHub and npm so that others can easily install and use them.

## GitHub Publication

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `n8n-nodes-webrequest`)
4. Add a description (e.g., "Custom n8n nodes for making web requests with a headless browser")
5. Choose public visibility
6. Initialize with a README (our existing README will replace this)
7. Click "Create repository"

### 2. Push Your Code

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: WebRequest and WebRequestPro nodes"

# Add the remote repository
git remote add origin https://github.com/yourusername/n8n-nodes-webrequest.git

# Push to GitHub
git push -u origin main
```

### 3. Create a Release

1. On your GitHub repository, click "Releases" in the right sidebar
2. Click "Create a new release"
3. Set the tag version (e.g., "v0.1.0")
4. Add a release title (e.g., "Initial Release")
5. Describe the features and usage
6. Click "Publish release"

## npm Publication

### 1. Prepare Your Package

1. Ensure your `package.json` is correctly configured:
   - Name is unique and follows n8n community node convention
   - Version is correct (starting with 0.1.0)
   - Description, keywords, and author information are complete

2. Build your package:
```bash
pnpm build
```

### 2. Login to npm

```bash
npm login
```

### 3. Publish the Package

```bash
npm publish
```

Or if using pnpm:

```bash
pnpm publish
```

## Publicizing Your Nodes

After publishing, make sure to:

1. Share in the [n8n community forum](https://community.n8n.io/)
2. Create a short demo video showing the nodes in action
3. Write a blog post about the capabilities and use cases
4. Share on social media with hashtags #n8n #automation #workflow

## Maintenance

Keep your nodes up to date:

1. Regularly check for issues reported by users
2. Update dependencies when new versions are available
3. Implement fixes and improvements based on feedback
4. Publish new versions following semantic versioning

## Monetization Ideas

If you want to monetize your premium "WebRequestPro" node:

1. **Freemium Model**: Offer the basic WebRequest node for free, but require payment for WebRequestPro
2. **Subscription Service**: Host the premium node on your own server with an API key system
3. **Support Services**: Offer paid support, customization, or workflow creation services
4. **Documentation**: Create premium documentation, tutorials, or courses 