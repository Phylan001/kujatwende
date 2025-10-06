# Contributing to Kuja Twende 🤝

Thank you for your interest in contributing to Kuja Twende! We welcome contributions from developers of all skill levels. This document provides guidelines and information to help you contribute effectively.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [FAQ](#faq)

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- Git installed and configured
- Basic understanding of React/Next.js
- MongoDB knowledge (helpful but not required)
- Familiarity with Tailwind CSS

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kujatwende.git
   cd kujatwende
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Phylan001/kujatwende.git
   ```

## 🔄 How to Contribute

### Types of Contributions

We welcome several types of contributions:

1. **🐛 Bug Fixes**

   - Fix existing issues
   - Improve error handling
   - Performance optimizations

2. **✨ New Features**

   - New destination filters
   - Enhanced booking flow
   - Additional animations
   - Admin dashboard improvements

3. **📚 Documentation**

   - Improve README
   - Add code comments
   - Create tutorials
   - Update API documentation

4. **🎨 UI/UX Improvements**

   - Design enhancements
   - Mobile responsiveness
   - Animation improvements
   - Accessibility features

5. **🧪 Testing**
   - Unit tests
   - Integration tests
   - E2E tests

### What We Need Help With

Check our [Issues](https://github.com/DonArtkins/kujatwende/issues) page for:

- `good first issue` - Perfect for newcomers
- `help wanted` - We'd love community input
- `bug` - Something isn't working
- `enhancement` - New feature requests
- `documentation` - Docs need improvement

## 🔧 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
# or
git checkout -b docs/documentation-improvement
```

### Branch Naming Convention

- `feature/` - New features (`feature/search-filters`)
- `fix/` - Bug fixes (`fix/booking-form-validation`)
- `docs/` - Documentation (`docs/api-documentation`)
- `refactor/` - Code refactoring (`refactor/auth-middleware`)
- `test/` - Testing improvements (`test/booking-flow`)

### 2. Make Your Changes

- Keep commits focused and atomic
- Write clear, descriptive commit messages
- Test your changes locally
- Follow coding standards (see below)

### 3. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add destination search functionality"
git commit -m "fix: resolve booking form validation issue"
git commit -m "docs: update API documentation"
git commit -m "style: improve mobile responsiveness"
git commit -m "test: add booking form tests"
```

**Commit Types:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style/formatting
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📝 Coding Standards

### JavaScript/TypeScript

```javascript
// ✅ Good
const fetchDestinations = async () => {
  try {
    const response = await fetch("/api/destinations");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching destinations:", error);
    throw error;
  }
};

// ❌ Avoid
const fetchDestinations = async () => {
  const response = await fetch("/api/destinations");
  const data = await response.json();
  return data;
};
```

### React Components

```jsx
// ✅ Good - Functional component with proper naming
import { useState, useEffect } from "react";

const DestinationCard = ({ destination, onBook }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    setIsLoading(true);
    try {
      await onBook(destination.id);
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{destination.title}</h3>
      <button
        onClick={handleBooking}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? "Booking..." : "Book Now"}
      </button>
    </div>
  );
};

export default DestinationCard;
```

### CSS/Tailwind

- Use Tailwind utilities consistently
- Group related classes logically
- Use custom CSS sparingly
- Follow mobile-first approach

```jsx
// ✅ Good
<div className="
  flex flex-col
  bg-white rounded-lg shadow-md
  p-4 md:p-6
  hover:shadow-lg transition-shadow
">
  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
    {title}
  </h2>
</div>

// ❌ Avoid
<div className="flex flex-col bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
```

### File Naming

- Use PascalCase for components: `DestinationCard.tsx`
- Use camelCase for utilities: `authHelpers.js`
- Use kebab-case for pages: `booking-confirmation.tsx`
- Use lowercase for API routes: `destinations.js`

## 🧪 Testing Guidelines

### Manual Testing

Before submitting your PR, test:

1. **Core Functionality**

   - User registration/login
   - Destination browsing
   - Booking creation
   - Admin functions

2. **Responsive Design**

   - Mobile (320px+)
   - Tablet (768px+)
   - Desktop (1024px+)

3. **Browser Compatibility**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

### Automated Testing

If adding tests (encouraged!):

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Testing Checklist

- [ ] All existing tests pass
- [ ] New features have tests
- [ ] Edge cases are covered
- [ ] No console errors
- [ ] Responsive design works

## 📤 Pull Request Process

### Before Submitting

1. **Update your branch**:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks**:

   ```bash
   npm run lint        # Check code style
   npm run build       # Ensure builds successfully
   npm run test        # Run tests
   ```

3. **Push your branch**:
   ```bash
   git push origin your-branch-name
   ```

### PR Template

When creating a PR, include:

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Testing

- [ ] Manual testing completed
- [ ] Automated tests added/updated
- [ ] Responsive design verified

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added to hard-to-understand areas
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainer(s)
3. **Changes requested** (if any)
4. **Approval** and merge

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for known limitations
3. **Test with latest version**

### Bug Reports

Use this template:

```markdown
**Describe the Bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node version: [e.g., 18.0.0]
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Additional context**
Any other context or screenshots.
```

## 🏗 Project Structure

Understanding the project structure helps you contribute effectively:

```
kujatwende/
├── app/                 # Next.js App Router
│   ├── api/            # API endpoints
│   ├── (auth)/         # Auth pages
│   ├── destinations/   # Destination pages
│   └── dashboard/      # Admin dashboard
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── forms/         # Form components
│   └── layout/        # Layout components
├── lib/               # Utilities & configs
├── models/            # Database models
└── public/            # Static assets
```

### Key Files

- `app/layout.tsx` - Root layout
- `components/ui/` - Reusable UI components
- `lib/db.js` - Database connection
- `models/` - Mongoose schemas

## 💻 Development Setup

### Environment Setup

1. **Copy environment variables**:

   ```bash
   cp .env.example .env.local
   ```

2. **Update variables** with your values
3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Lint code
npm run lint:fix     # Fix lint issues
npm run format       # Format code with Prettier
npm run seed         # Seed database
```

## ❓ FAQ

### Q: I'm new to open source. Where should I start?

A: Look for issues labeled `good first issue`. These are designed for newcomers and usually include detailed instructions.

### Q: How do I set up the database?

A: Create a MongoDB Atlas account (free tier) and use the connection string in your `.env.local` file. Alternatively, install MongoDB locally.

### Q: Can I contribute UI designs?

A: Yes! Create mockups, improve existing designs, or suggest UX improvements. Open an issue to discuss your ideas first.

### Q: What if my PR conflicts with main branch?

A: Rebase your branch on the latest main:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease origin your-branch
```

### Q: How do I add new dependencies?

A: Discuss it in an issue first. If approved, add with:

```bash
npm install package-name
```

### Q: My tests are failing. What should I do?

A: Check the test output, fix the issues, and run tests locally before pushing. If stuck, ask for help in the PR comments.

## 📞 Need Help?

- **GitHub Issues** - Technical questions
- **Discussions** - General questions and ideas
- **Email** - Direct contact with maintainers

Thank you for contributing to Kuja Twende! Your efforts help make this project better for everyone. 🎉
