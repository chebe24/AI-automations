# Alternative Solutions to Google Apps Script

This document explores alternatives to the current Google Apps Script solution for generating and emailing student slides.

## Current Approach: Google Apps Script

**Pros:**
- ✅ Free and built into Google Workspace
- ✅ Direct integration with Google Sheets and Slides
- ✅ No additional software needed
- ✅ Can run on schedule automatically
- ✅ Works on any platform (cloud-based)

**Cons:**
- ❌ Requires coding knowledge
- ❌ Can be difficult to debug
- ❌ 6-minute execution time limit
- ❌ Learning curve for JavaScript

---

## Alternative 1: Mac Automator

### Overview
Mac's built-in Automator can automate tasks, but it's **not ideal** for this specific use case.

### How It Would Work
1. Use AppleScript to read data from a CSV file
2. Open Google Slides in a browser
3. Use UI automation to interact with Google Slides
4. Export as PDF
5. Send email via Mail app

### Pros
- ✅ No coding required (visual workflow)
- ✅ Built into macOS
- ✅ Can integrate with other Mac apps

### Cons
- ❌ **Only works on Mac** (not portable)
- ❌ **Can't directly access Google Sheets API** - would need export to CSV
- ❌ **Brittle** - breaks if Google changes their UI
- ❌ **Slow** - relies on UI automation
- ❌ **Harder to schedule** - requires Mac to be running
- ❌ **Can't create/modify Google Slides programmatically** - would need manual template duplication

### Verdict
**Not Recommended** - Too many limitations for this task.

---

## Alternative 2: Google Slides Add-ons (No-Code)

### Mail Merge Add-ons

Popular options:
- **[Autocrat](https://cloudlab.newvisions.org/autocrat)** - Free, merge Google Docs/Slides
- **[Yet Another Mail Merge](https://gsuite.google.com/marketplace/app/yet_another_mail_merge/78888472542)** - Popular for emails
- **[Form Publisher](https://gsuite.google.com/marketplace/app/form_publisher/394948002981)** - Forms to Slides

### How It Works
1. Install add-on from Google Workspace Marketplace
2. Configure data source (your Google Sheet)
3. Set up template with merge fields
4. Run merge to create slides
5. Email automatically

### Pros
- ✅ **No coding required**
- ✅ Visual interface
- ✅ Proven solutions
- ✅ Support available

### Cons
- ⚠️ Some are paid ($$ - can range from $5-$50/month)
- ⚠️ Less customization than custom scripts
- ⚠️ May have limits on number of merges

### Verdict
**Good Option** - Especially if you want no-code and are willing to pay.

---

## Alternative 3: Python + Google APIs

### Overview
Write a Python script that uses Google's official APIs.

### How It Works
```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Authenticate
credentials = service_account.Credentials.from_service_account_file('credentials.json')

# Access Google Sheets
sheets_service = build('sheets', 'v4', credentials=credentials)
# Access Google Slides
slides_service = build('slides', 'v1', credentials=credentials)

# Read data, create slides, send emails
```

### Pros
- ✅ More powerful than Apps Script
- ✅ Better debugging tools
- ✅ Can run anywhere (Mac, Windows, Linux)
- ✅ More libraries available
- ✅ No execution time limits

### Cons
- ❌ **Requires Python knowledge**
- ❌ More complex setup (OAuth, credentials)
- ❌ Need to host somewhere for automation (cron job, cloud function)
- ❌ Not as tightly integrated

### Verdict
**Good for Advanced Users** - More flexible but more complex.

---

## Alternative 4: No-Code Automation Platforms

### Options
- **[Zapier](https://zapier.com/)** - Most popular, $20-$50/month
- **[Make.com (formerly Integromat)](https://www.make.com/)** - More affordable, $9+/month
- **[n8n](https://n8n.io/)** - Open source, self-hosted (free)

### How It Works
1. Trigger: New row in Google Sheets or scheduled time
2. Action: Create Google Slides from template
3. Action: Populate with data
4. Action: Send email with attachment

### Pros
- ✅ **No coding required** (visual workflow)
- ✅ Easy to set up
- ✅ Professional support
- ✅ Many integrations
- ✅ Can handle complex workflows

### Cons
- ❌ **Monthly cost** ($10-$50/month)
- ❌ May have limits on operations
- ❌ Less customization than code

### Verdict
**Best No-Code Option** - Worth the cost if you hate coding.

---

## Alternative 5: Google Apps Script (Improved Approach)

### What We're Currently Fixing
The issue you're experiencing is likely:
1. **Code not updated** - You need to copy the latest code to Apps Script
2. **Data reading issue** - Column indices might be wrong
3. **Template issue** - Template might not have correct placeholders

### Better Debugging Approach
Instead of rewriting, let's:
1. ✅ Use the diagnostic function to check data
2. ✅ Verify column positions
3. ✅ Add font size controls
4. ✅ Ensure text placement works

---

## Recommendation Matrix

| Your Priority | Recommended Solution |
|---------------|---------------------|
| **No coding** | Mail Merge Add-on OR Zapier/Make.com |
| **Free** | Google Apps Script (current approach) |
| **Most powerful** | Python + Google APIs |
| **Mac-specific** | Not recommended for this task |
| **Quick fix** | Fix current Apps Script implementation |

---

## Text Placement & Font Size: How It Works

### Current Approach (Template-Based)
Your Google Slides template controls placement:
- ✅ Design template with text boxes positioned exactly where you want
- ✅ Put placeholders (`<<name>>`, `<<Teacher>>`, etc.) in those text boxes
- ✅ Script finds and replaces the placeholders
- ✅ **Text stays exactly where you positioned it in the template**

### Font Size Control
I've added font size options to the CONFIG:
```javascript
const CONFIG = {
  // ... other settings ...
  FONT_SIZE_NAME: 24,      // Make student names 24pt
  FONT_SIZE_TEACHER: 18,   // Teacher names 18pt
  FONT_SIZE_WEEK: 14       // Week range 14pt
};
```

Set to `null` to keep template formatting:
```javascript
FONT_SIZE_NAME: null  // Keep whatever size is in template
```

### Best Practice for Placement
1. **Design your template first** in Google Slides
2. Position text boxes exactly where you want them
3. Add placeholders: `<<name>>`, `<<Teacher>>`, `<<week>>`
4. Script will preserve all positioning
5. Only the text content changes, not the layout

**Example Template Design:**
```
┌─────────────────────────────────┐
│                                 │
│   Student Name: <<name>>        │  ← Position this text box here
│                                 │
│   Teacher: <<Teacher>>          │  ← Position this here
│   Week: <<week>>                │  ← And this here
│                                 │
└─────────────────────────────────┘
```

---

## Next Steps: Let's Fix Your Issue

1. **Run the diagnostic:**
   - Copy the updated code to Apps Script
   - Refresh your spreadsheet
   - Click `📧 Weekly Slides → 🔍 Check Student Data`
   - This will show you exactly what data is being read

2. **Verify columns:**
   - Check if the diagnostic shows all 12 different student names
   - If not, adjust `COL_FIRST_NAME` and `COL_LAST_NAME`

3. **Test placement:**
   - Your template controls placement, not the code
   - Design template → Add placeholders → Run script

4. **Customize fonts:**
   - Add `FONT_SIZE_NAME: 24` (or your preferred size) to CONFIG

Would you like me to help you:
- A) Debug the current issue with the diagnostic tool
- B) Explore a specific alternative (like Zapier)
- C) Improve the template design guidance
