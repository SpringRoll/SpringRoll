# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.1] - 2021-07-06

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

