# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [2.4.2] - 2021-04-30

### Changed
- Bump ssri from 6.0.1 to 6.0.2
## [2.4.1] - 2021-03-31
- Update y18n version in package-lock.json

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

