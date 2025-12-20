# Google Slides Email Automation

Automate the generation and distribution of personalized student slides from Google Sheets data.

## What This Does

This Google Apps Script automation:
1. ✅ Reads student data from a Google Sheets database (12 students, rows 7-18)
2. ✅ Creates a Google Slides presentation with one 8.5" x 11" slide per student
3. ✅ Populates each slide with student information using template placeholders
4. ✅ Saves the presentation to a Google Drive folder
5. ✅ Emails the presentation as a PDF to `chebert4@ebrschools.org`

## Files

- **`Code.gs`** - Main Apps Script code
- **`appsscript.json`** - Project manifest with OAuth scopes
- **`SETUP.md`** - Detailed setup and configuration guide

## Quick Start

1. **Read the Setup Guide:** [SETUP.md](./SETUP.md)
2. **Prepare your template:** Create a Google Slides file with placeholders
3. **Install the script:** Copy `Code.gs` into your Google Sheets Apps Script editor
4. **Configure:** Update the TEMPLATE_ID and other settings
5. **Test:** Run `testConfiguration()` to verify setup
6. **Run:** Use the custom menu `📧 Weekly Slides → Generate and Email Slides`

## Template Placeholders

Your Google Slides template should include these placeholders:

| Placeholder | Replaced With |
|-------------|---------------|
| `<<name>>` | Student's full name (First + Last) |
| `<<Teacher>>` | Teacher's name from column K |
| `<<week>>` | Week range from column E |

## Configuration

### Required Settings

```javascript
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE'; // Get from template URL
const EMAIL_RECIPIENT = 'chebert4@ebrschools.org';
const SHEET_NAME = 'masterconduct';
```

### Data Structure

| Row | Column B | Column C | Column E | Column K |
|-----|----------|----------|----------|----------|
| 7   | FirstName1 | LastName1 | Week 1-5 | Teacher1 |
| 8   | FirstName2 | LastName2 | Week 1-5 | Teacher2 |
| ... | ... | ... | ... | ... |
| 18  | FirstName12 | LastName12 | Week 1-5 | Teacher12 |

## Features

### Custom Menu
After installation, a custom menu appears in Google Sheets:
- `📧 Weekly Slides → Generate and Email Slides` - Run the main script
- `📧 Weekly Slides → View Logs` - Instructions for viewing execution logs

### Error Handling
- Validates configuration before running
- Skips empty rows automatically
- Shows user-friendly error messages
- Logs detailed execution information

### Testing
Run `testConfiguration()` to check:
- ✅ Template file is accessible
- ✅ Sheet exists and has data
- ✅ Configuration is complete

## Output

### Generated File
- **Name:** `Weekly Slides - YYYY-MM-DD`
- **Location:** Google Drive → Inbox folder
- **Format:** Google Slides (also sent as PDF)
- **Content:** 12 slides (one per student)

### Email
- **To:** chebert4@ebrschools.org
- **Subject:** Weekly Student Slides - YYYY-MM-DD
- **Attachment:** PDF version of slides
- **Body:** Summary with week range and student count

## Automation

Set up automatic weekly execution:
1. Apps Script editor → Triggers (clock icon)
2. Add trigger → Choose `generateAndEmailSlides`
3. Event source: Time-driven
4. Frequency: Week timer → Every Friday at 4 PM

## Troubleshooting

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Template not found" | Check TEMPLATE_ID is correct and you have access |
| "Sheet not found" | Verify SHEET_NAME matches exactly (case-sensitive) |
| Placeholders not replaced | Check spelling and case in template (`<<name>>`) |
| Email not sent | Check Gmail sending quota (100/day for free accounts) |

**View Logs:**
- Apps Script editor → Executions tab
- Or run `Logger.log()` statements in the code

## Code Improvements

This version includes several improvements over the original code:

1. ✅ **Fixed slide duplication logic** - Correctly handles the first slide
2. ✅ **Better error handling** - Try/catch with user-friendly messages
3. ✅ **Configuration validation** - Checks setup before running
4. ✅ **Skip empty rows** - Automatically ignores blank student records
5. ✅ **Enhanced logging** - Detailed execution logs for debugging
6. ✅ **Custom menu** - Easy access from Google Sheets UI
7. ✅ **Test function** - Validate configuration without sending email
8. ✅ **Better email content** - Includes summary and metadata

## Support

For detailed instructions, see [SETUP.md](./SETUP.md)

## License

MIT - Feel free to modify and adapt for your needs

## Version

Current version: 1.0.0
