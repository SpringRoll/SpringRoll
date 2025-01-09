# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- Updated captions RendererDOM to clear out CC text when caption stops.

## [2.7.0] - 2024-11-04

### Changed
- Updated base Node version in `nvmrc` and workflows to 20
- Dependabot update: Bump follow-redirects from 1.15.2 to 1.15.6
- Bellhop updated to 3.6.0

## [2.6.0] - 2024-01-05

### Changed

- Updated Node version to 18
- Updated Bellhop from 3.3.1 to 3.4.0
- Dependabot updates:
  - Updated @babel/traverse from 7.22.8 to 7.23.7
  - Updated postcss from 8.4.23 to 8.4.31
  - Updated word-wrap from 1.2.3 to 1.2.4

## [2.5.1] - 2023-07-07

### Changed

- Moved Application's `stateDefaults` to a class property to make them accessible to plugins
- Update npm-deploy.yml node version to 16

## [2.5.0] - 2023-04-21

### Changed

- Updated Rollup to 3.20.2
- Brought all Rollup plugins to latest version to match
- Dependabot updates:
  - Removed glob-parent
  - Removed ansi-html
  - Updated documentation from 13.2.5 to 14.0.1
  - Updated parse-path from 4.0.3 to 7.0.0
  - Updated nanoid from 3.1.12 to 3.3.3
  - Updated mocha from 8.2.1 to 10.2.0
  - Updated minimatch from 3.0.4 to 3.1.2
  - Updated parse-url from 6.0.5 to 8.1.0
  - Updated webpack from 5.75.0 to 5.76.0

## [2.4.5] - 2023-03-07

### Changed

- Dependency updates
- Update NPM Deploy Github Action trigger to released to avoid pre-releases being deployed to NPM

## [2.4.4] - 2022-06-06

### Changed

- Updated Bellhop version to 3.3.0

### Fixed

- Fixed duplicate UserData API typings

## [2.4.3] - 2022-04-06

### Changed

- Bump minimist from 1.2.5 to 1.2.6
- Bump ansi-regex from 3.0.0 to 3.0.1

## [2.4.2] - 2022-03-10

### Changed

- minor dependency bumps

## [2.4.1] - 2021-07-19

## Added

- add fullScreen feature to typings

### Changed

- Bump ssri from 6.0.1 to 6.0.2
- Bump lodash from 4.17.20 to 4.17.21
- Bump hosted-git-info from 2.8.8 to 2.8.9
- Bump elliptic from 6.5.3 to 6.5.4
- Bump browserslist from 4.14.0 to 4.16.6
- Update y18n version in package-lock.json
- Bump socket.io-parser from 3.3.1 to 3.3.2
- add FullScreen Feature to typings

## [2.4.0] - 2021-02-19

### Added

- Built in FullScreen support
- Initial IndexedDB functionality for creating, updated, deleting, and reading databases, stores, and records.

## [2.3.3] - 2021-01-29

### Added

- This CHANGELOG

### Fixed

- `ResizeHelpers`'s iOS screen size reporting function updated to never return `window.screen.width` and `height` as they were reporting incorrect values when moving from portrait to landscape orientation.
- Typings for caption classes were slightly off, and have now been corrected.
- npm modules updated to remove security vulnerabilities.
