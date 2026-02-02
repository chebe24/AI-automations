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
1. [Deploy to Google Sheets](./google-slides-emailer/DEPLOYMENT.md)
2. Configure your template ID and data columns
3. Run from the custom menu: `📧 Weekly Slides → Generate and Email Slides`

**Documentation:**
- [🚀 Deployment Guide](./google-slides-emailer/DEPLOYMENT.md) - How to install and deploy
- [📖 Setup Guide](./google-slides-emailer/SETUP.md) - Configuration and usage
- [📄 README](./google-slides-emailer/README.md) - Quick reference

### Bell Ringer Slide Generator (Journal du Matin)
**Location:** `bell-ringer-slides/`

Full-year bell ringer slide generator for EBR G1 French Immersion (2025-26, 177 instructional days). Creates weekly Google Slides presentations from spiral content sheets.

**Features:**
- Full EBR 2025-26 school calendar with holiday exclusions
- Spiral content from `FrenchSpiral` and `MathSpiral` sheets
- French error introduction engine (capitalization, accents, agreement, etc.) starting Feb 2
- French date formatting (e.g., "mercredi 12 fevrier")
- Batch generation (5 weeks per run, avoids Apps Script time limits)
- Drive folder organization by week
- French vocabulary extraction from Drive folders
- Custom menu: `Admin > Generate Full Year / Generate Next Week`

**Quick Start:**
1. Create `FrenchSpiral` and `MathSpiral` sheets with content for days 1-177
2. [Install and configure](./bell-ringer-slides/SETUP.md) via Extensions > Apps Script
3. Run from the custom menu: `Admin > Generate Full Year`

**Documentation:**
- [Setup Guide](./bell-ringer-slides/SETUP.md) - Installation, configuration, spiral sheets, and full workflow

---

## Guides

- [npm Permissions Fix for macOS](./npm-permissions-fix.md) - Resolve EACCES errors when installing global npm packages