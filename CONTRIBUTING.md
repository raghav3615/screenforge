# Contributing to ScreenForge

Thanks for your interest in contributing — contributions are welcome.

## Ways to contribute

- Report bugs and UX issues
- Suggest features and improvements
- Improve documentation
- Submit pull requests (bug fixes, new features, refactors)

## Development setup

Prerequisites:

- Windows 10/11
- Node.js (LTS recommended)

Install dependencies:

```bash
npm install
```

Run in development (Vite + Electron):

```bash
npm run dev
```

Build:

```bash
npm run build
```

Package a Windows installer:

```bash
npm run dist
```

## Code quality

- Lint before submitting:

```bash
npm run lint
```

- Prefer small, focused PRs.
- Keep UI changes consistent with existing styling/theming patterns.

## Pull request guidelines

1. Create a branch from `main`.
2. Make your changes.
3. Ensure `npm run lint` passes.
4. Update docs/screenshots when relevant.
5. Open a PR with a clear description and any screenshots.

## Reporting bugs

Please include:

- Windows version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if UI-related)
- Any relevant logs (e.g., terminal output when running `npm run dev`)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
