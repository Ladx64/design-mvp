# Gitignore Update

## Changes Made
- Added `/public/uploads/*` to .gitignore to prevent uploaded files from being tracked
- Kept `.keep` file using `!public/uploads/.keep` to maintain directory structure in git

## Why
- Uploaded files should not be tracked in version control as they are user-generated content
- The .keep file ensures the uploads directory exists in the repository while ignoring its contents
