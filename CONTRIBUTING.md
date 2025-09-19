# 🤝 Contributing to Satoshi Faucet Bot

Thank you for your interest in contributing to the Satoshi Faucet Bot Chrome Extension! We welcome contributions from the community and appreciate your help in making this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- **Chrome Browser**: Version 88 or higher
- **Git**: For version control
- **Text Editor**: VS Code, Sublime Text, or any preferred editor
- **Basic Knowledge**: HTML, CSS, JavaScript, and Chrome Extension APIs

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
git clone https://github.com/ryustore69/Stshi-FCT.git
cd Stshi-FCT
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ryustore69/Stshi-FCT.git
   ```

## 🔧 Development Setup

### 1. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **"Load unpacked"**
4. Select the project folder
5. The extension should now appear in your extensions list

### 2. Development Workflow

1. Make your changes to the code
2. Reload the extension in Chrome (`chrome://extensions/` → Reload button)
3. Test your changes
4. Repeat as needed

### 3. File Structure

```
satoshi-faucet-bot/
├── assets/              # Static assets (icons, screenshots)
│   ├── icons/          # Extension icons
│   └── screenshots/    # Documentation screenshots
├── background.js       # Background script
├── content.js         # Content script
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── manifest.json      # Extension manifest
├── README.md          # Project documentation
├── INSTALL.md         # Installation guide
├── FEATURES.md        # Features documentation
├── CHANGELOG.md       # Version history
├── CONTRIBUTING.md    # This file
└── LICENSE            # MIT License
```

## 🎯 How to Contribute

### Types of Contributions

We welcome several types of contributions:

#### 🐛 Bug Reports
- Report bugs and issues
- Provide detailed reproduction steps
- Include system information and error logs

#### 💡 Feature Requests
- Suggest new features
- Propose improvements
- Discuss implementation ideas

#### 🔧 Code Contributions
- Fix bugs
- Implement new features
- Improve existing code
- Optimize performance

#### 📖 Documentation
- Improve existing documentation
- Add new guides and tutorials
- Fix typos and errors
- Translate documentation

#### 🎨 Design
- Improve UI/UX
- Create new icons and graphics
- Design new layouts
- Improve accessibility

### Contribution Process

1. **Check Existing Issues**: Look for existing issues or discussions
2. **Create Issue**: If no existing issue, create a new one
3. **Fork Repository**: Fork the repository to your GitHub account
4. **Create Branch**: Create a feature branch from `main`
5. **Make Changes**: Implement your changes
6. **Test Thoroughly**: Test your changes extensively
7. **Submit Pull Request**: Create a pull request with detailed description

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Changes are tested thoroughly
- [ ] Documentation is updated if needed
- [ ] No new bugs are introduced
- [ ] Performance is not negatively affected

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome 88+
- [ ] Tested on different screen sizes
- [ ] No console errors
- [ ] All features working as expected

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. **Automated Checks**: CI/CD checks will run automatically
2. **Code Review**: Maintainers will review your code
3. **Testing**: Changes will be tested by the team
4. **Feedback**: Address any feedback or requested changes
5. **Merge**: Once approved, your PR will be merged

## 🐛 Issue Guidelines

### Bug Reports

When reporting bugs, please include:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Screenshots**
If applicable, add screenshots

**System Information**
- Chrome Version: [e.g., 120.0.6099.109]
- Extension Version: [e.g., 2.0.0]
- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]

**Additional Context**
Any other context about the problem
```

### Feature Requests

When requesting features, please include:

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives**
Any alternative solutions considered

**Additional Context**
Any other context or screenshots
```

## 📝 Coding Standards

### JavaScript

- Use **ES6+** features
- Follow **camelCase** for variables and functions
- Use **const** and **let** instead of **var**
- Add **JSDoc** comments for functions
- Use **semicolons** consistently
- **2 spaces** for indentation

```javascript
/**
 * Example function with JSDoc
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, warning)
 * @returns {void}
 */
function showNotification(message, type) {
  // Implementation here
}
```

### CSS

- Use **BEM** methodology for class names
- Use **2 spaces** for indentation
- Group related properties together
- Use **meaningful** class names
- Add **comments** for complex styles

```css
/* Component: Currency Selector */
.currency-selector {
  /* Layout */
  display: flex;
  flex-direction: column;
  
  /* Spacing */
  margin-bottom: 16px;
  padding: 20px;
  
  /* Visual */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.currency-selector__label {
  font-weight: 700;
  color: #ffffff;
}
```

### HTML

- Use **semantic** HTML elements
- Add **alt** attributes to images
- Use **meaningful** class names
- Keep **indentation** consistent
- Add **comments** for complex sections

```html
<!-- Currency Selection Section -->
<div class="currency-selector">
  <label for="currencySelect" class="currency-selector__label">
    Select Currency:
  </label>
  <select id="currencySelect" class="currency-selector__select">
    <option value="btc">Bitcoin (BTC)</option>
  </select>
</div>
```

## 🧪 Testing

### Manual Testing

Before submitting a PR, please test:

- [ ] **Basic Functionality**: All core features work
- [ ] **Different Currencies**: Test with various cryptocurrencies
- [ ] **Error Handling**: Test error scenarios
- [ ] **Browser Compatibility**: Test on different Chrome versions
- [ ] **Performance**: No memory leaks or performance issues
- [ ] **UI/UX**: Interface works on different screen sizes

### Testing Checklist

```markdown
## Testing Checklist

### Core Features
- [ ] Faucet claims work correctly
- [ ] Shortlinks are completed automatically
- [ ] Daily challenges are detected and completed
- [ ] Statistics update in real-time
- [ ] Notifications work properly

### UI/UX
- [ ] Interface is responsive
- [ ] All buttons and controls work
- [ ] Settings can be changed and saved
- [ ] Logs display correctly
- [ ] No visual bugs or glitches

### Error Handling
- [ ] Network errors are handled gracefully
- [ ] Invalid inputs are rejected
- [ ] Extension recovers from crashes
- [ ] Error messages are clear and helpful

### Performance
- [ ] No memory leaks
- [ ] Extension doesn't slow down browser
- [ ] Statistics update efficiently
- [ ] Background processing is optimized
```

## 📚 Documentation

### Code Documentation

- Add **JSDoc** comments for all functions
- Include **parameter** and **return** type information
- Add **examples** for complex functions
- Document **API** usage and limitations

### User Documentation

- Update **README.md** for new features
- Add **screenshots** for UI changes
- Update **INSTALL.md** for installation changes
- Update **FEATURES.md** for new features

### API Documentation

- Document **Chrome Extension APIs** used
- Explain **message passing** between scripts
- Document **storage** structure and usage
- Include **permission** requirements

## 🏷️ Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

- [ ] Update version in `manifest.json`
- [ ] Update `CHANGELOG.md` with new features
- [ ] Test all functionality thoroughly
- [ ] Update documentation if needed
- [ ] Create release tag on GitHub
- [ ] Publish to Chrome Web Store (when available)

## 🆘 Getting Help

### Resources

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues for solutions
- **Discussions**: Join GitHub Discussions for help
- **Code Review**: Ask for code review on PRs

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Email**: [Your email] for private matters

## 🙏 Recognition

Contributors will be recognized in:

- **README.md**: Listed as contributors
- **CHANGELOG.md**: Mentioned in release notes
- **GitHub**: Listed in contributors section
- **Releases**: Thanked in release notes

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Thank you for contributing to the Satoshi Faucet Bot Chrome Extension! Your contributions help make this project better for everyone in the crypto community.

**Happy Contributing! 🚀**

---

[⬆ Back to Top](#-contributing-to-satoshi-faucet-bot)
