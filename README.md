# Documentation Generator

A modern, feature-rich documentation site generator built with Next.js and MDX. This application allows you to create, organize, and present documentation with a beautiful, responsive interface.

## Features

- 📝 **MDX Support** - Write documentation using Markdown with JSX components
- 🌳 **Hierarchical Navigation** - Organized sidebar with folder structure
- 🔍 **Search Functionality** - Real-time search across documentation
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, accessible interface with dark mode support
- 🔄 **Live Updates** - Dynamic content loading without page refreshes
- 📍 **Breadcrumb Navigation** - Clear indication of current location
- ✨ **Syntax Highlighting** - Beautiful code formatting
- 📚 **Auto-generated TOC** - Automatic table of contents for each page

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lazarev-Cloud/docs.git
cd docs
```

2. Install dependencies:


```shellscript
npm install
# or
yarn install
```

3. Start the development server:


```shellscript
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser


### Adding Documentation

1. Create `.md` or `.mdx` files in the `docs` directory
2. Organize files in folders to create navigation structure
3. Use front matter for metadata:


```yaml
---
title: My Page Title
description: Page description
---
```

## Project Structure

```plaintext
docs-generator/
├── app/                # Next.js app directory
├── components/         # React components
├── docs/              # Documentation files
├── lib/               # Utility functions
├── public/            # Static assets
└── styles/            # Global styles
```

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [MDX](https://mdxjs.com/) - Markdown for the component era
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
