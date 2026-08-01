# Contributing

## Commit messages — Conventional Commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org). Commit messages drive the release version automatically via [semantic-release](https://semantic-release.gitbook.io) — there is no manual version bumping.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types and their release impact

| Type | Use for | Version bump |
| --- | --- | --- |
| `feat` | A new feature | **minor** (`x.Y.0`) |
| `fix` | A bug fix | **patch** (`x.y.Z`) |
| `perf` | A performance improvement | **patch** |
| `docs` | Documentation only | none |
| `refactor` | Code change that neither fixes a bug nor adds a feature | none |
| `test` | Adding or fixing tests | none |
| `build` | Build system, packaging, or dependencies | none |
| `ci` | CI configuration | none |
| `chore` | Anything else that doesn't touch shipped behavior | none |
| `style` | Formatting only (whitespace, semicolons) | none |

### Breaking changes → major bump

Append `!` after the type/scope, **or** add a `BREAKING CHANGE:` footer. Either triggers a **major** bump (`X.0.0`):

```
feat!: drop support for single-file split mode

BREAKING CHANGE: exports now require a TBA-imported event.
```

### Examples

```
feat(timeline): add ctrl+scroll zoom to the event timeline
fix(ffmpeg): clip matches that overrun the recording edge
docs: rewrite README for v4 and add screenshots
chore(release): 4.0.0 [skip ci]
```

### Enforcement

A [commitlint](https://commitlint.js.org) `commit-msg` git hook (installed via [husky](https://typicode.github.io/husky)) rejects non-conforming messages before the commit is created. The hook is set up automatically on `pnpm install` (via the `prepare` script). Configuration lives in `commitlint.config.js`.

## Releases

`semantic-release` computes the next version from the commits since the last tag:

- **Stable** releases are cut from `main`.
- **Prereleases** are cut from `beta` and `alpha` branches (e.g. `4.0.0-beta.1`).

Configuration is in `release.config.js`. Because this is a packaged desktop app rather than an npm package, semantic-release bumps `package.json` and commits it back but does **not** publish to the npm registry.
