# AI-automations

Collection of guides, scripts, and fixes for common automation and development tasks.

## Automations

### Google Slides Email Automation
**Location:** `google-slides-emailer/`

Automatically generate personalized Google Slides presentations from student data and email them as PDFs.

**Features:**
- Creates one slide per student from a Google Sheets database
- Customizable slide templates with placeholder replacement
- Automatic PDF conversion and email delivery
- Built-in error handling and logging
- Custom menu integration in Google Sheets

**Quick Start:**
1. Follow the [Setup Guide](./google-slides-emailer/SETUP.md)
2. Configure your template ID and data columns
3. Run from the custom menu: `📧 Weekly Slides → Generate and Email Slides`

[📖 Full Documentation](./google-slides-emailer/SETUP.md)

## Guides

- [npm Permissions Fix for macOS](./npm-permissions-fix.md) - Resolve EACCES errors when installing global npm packages