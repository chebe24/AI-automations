# Google Slides Email Automation - Setup Guide

This guide will help you set up the automated weekly student slides generator and emailer.

## Overview

This script automates the process of:
1. Reading student data from a Google Sheets database
2. Creating a Google Slides presentation with one slide per student
3. Populating each slide with student-specific information
4. Emailing the presentation as a PDF to a specified recipient

## Prerequisites

- Google Account with access to:
  - Google Sheets (for student database)
  - Google Slides (for the template)
  - Google Drive (for file storage)
  - Gmail (for sending emails)

## Step-by-Step Setup

### 1. Prepare Your Google Sheets Database

Your spreadsheet should have a sheet named **"masterconduct"** with the following structure:

| Column | Data | Description |
|--------|------|-------------|
| A | (Any) | First column (not used by default) |
| B | First Name | Student's first name |
| C | Last Name | Student's last name |
| E | Week Range | E.g., "Week 1-5" or "Jan 1-7" |
| K | Teacher | Teacher's name |

**Important:**
- Student data should start at **Row 7**
- The script will process **12 rows** (rows 7-18)
- Empty rows will be automatically skipped

### 2. Create Your Google Slides Template

1. Create a new Google Slides presentation
2. Set the page size to Letter (8.5" x 11"):
   - File → Page setup → Custom
   - Width: 8.5 inches
   - Height: 11 inches
3. Design your slide template with placeholders:
   - `<<name>>` - Will be replaced with student's full name
   - `<<Teacher>>` - Will be replaced with teacher's name
   - `<<week>>` - Will be replaced with week range
4. Save the presentation
5. Get the template ID from the URL:
   - URL format: `https://docs.google.com/presentation/d/TEMPLATE_ID_HERE/edit`
   - Copy the long string between `/d/` and `/edit`

### 3. Install the Script

1. Open your Google Sheets spreadsheet
2. Click **Extensions → Apps Script**
3. Delete any existing code in the editor
4. Copy the entire contents of `Code.gs` and paste it into the editor
5. Click **Save** (disk icon) and name your project (e.g., "Weekly Slides Generator")

### 4. Configure the Script

In the Apps Script editor, modify the configuration section at the top of the code:

```javascript
// --- CONFIGURATION ZONE ---
const TEMPLATE_ID = 'YOUR_ACTUAL_TEMPLATE_ID_HERE'; // Replace with your template ID
const FOLDER_NAME = 'Inbox'; // Change if you want a different folder name
const EMAIL_RECIPIENT = 'chebert4@ebrschools.org'; // Change recipient if needed
const SHEET_NAME = 'masterconduct'; // Change if your sheet has a different name

// Data Range settings
const START_ROW = 7;    // First row with student data
const NUM_ROWS = 12;    // Number of students to process

// Column Indices (adjust if your columns are different)
const COL_FIRST_NAME = 1; // Col B
const COL_LAST_NAME = 2;  // Col C
const COL_WEEK = 4;       // Col E
const COL_TEACHER = 10;   // Col K
```

### 5. Grant Permissions

The first time you run the script:

1. Click **Run** (play button) or use the custom menu in your spreadsheet
2. You'll see "Authorization required" - click **Review permissions**
3. Choose your Google account
4. Click **Advanced** → **Go to [Your Project Name] (unsafe)**
5. Click **Allow** to grant the necessary permissions:
   - View and manage spreadsheets
   - View and manage presentations
   - View and manage Drive files
   - Send email as you

### 6. Test the Configuration

Before running the full script:

1. In the Apps Script editor, select **testConfiguration** from the function dropdown
2. Click **Run** (play button)
3. Check the results - it will tell you if everything is configured correctly

### 7. Run the Script

#### Option A: From the Custom Menu (Recommended)

1. Go back to your Google Sheets spreadsheet
2. Refresh the page (you should see a new menu: "📧 Weekly Slides")
3. Click **📧 Weekly Slides → Generate and Email Slides**
4. Wait for the success message

#### Option B: From Apps Script Editor

1. In the Apps Script editor, select **generateAndEmailSlides** from the function dropdown
2. Click **Run** (play button)
3. Check the logs for execution details

## Output

### Generated Files

- A new Google Slides file will be created in the "Inbox" folder in your Google Drive
- File name format: `Weekly Slides - YYYY-MM-DD`
- The file contains one slide per student with their information

### Email

The recipient will receive an email with:
- **Subject:** "Weekly Student Slides - YYYY-MM-DD"
- **Body:** Summary including week range and number of students processed
- **Attachment:** PDF version of the slides (ready to print)

## Customization

### Adjusting Data Columns

If your spreadsheet has different column positions, update these constants:

```javascript
const COL_FIRST_NAME = 1; // Change to your First Name column (0-indexed)
const COL_LAST_NAME = 2;  // Change to your Last Name column
const COL_WEEK = 4;       // Change to your Week column
const COL_TEACHER = 10;   // Change to your Teacher column
```

**Column Index Reference:**
- A = 0, B = 1, C = 2, D = 3, E = 4, etc.

### Processing More or Fewer Students

Change these values:

```javascript
const START_ROW = 7;    // First row with data
const NUM_ROWS = 12;    // Number of students (change to your needs)
```

### Changing the Email Recipient

```javascript
const EMAIL_RECIPIENT = 'your.email@example.com';
```

### Adding More Placeholders

1. Add placeholders to your slide template (e.g., `<<grade>>`)
2. In the script, add the column index:
   ```javascript
   const COL_GRADE = 5; // Example: Column F
   ```
3. In the loop, add the replacement:
   ```javascript
   let grade = row[COL_GRADE];
   currentSlide.replaceAllText("<<grade>>", grade ? grade.toString() : "");
   ```

## Troubleshooting

### "Template file not accessible"
- Make sure the TEMPLATE_ID is correct
- Ensure you have access to the template file
- Try opening the template URL manually

### "Sheet not found"
- Check that SHEET_NAME matches your sheet's name exactly (case-sensitive)
- Make sure you're running the script from the correct spreadsheet

### Email not received
- Check spam/junk folder
- Verify EMAIL_RECIPIENT is correct
- Check Apps Script execution logs for errors

### Placeholders not replaced
- Make sure placeholders in the template match exactly (including `<<` and `>>`)
- Placeholders are case-sensitive: `<<name>>` ≠ `<<Name>>`

### View Execution Logs

1. Click **📧 Weekly Slides → View Logs** in your spreadsheet, or
2. In Apps Script editor: **Executions** tab in the left sidebar

## Automation with Triggers

To run this script automatically on a schedule:

1. In Apps Script editor, click **Triggers** (clock icon in left sidebar)
2. Click **+ Add Trigger**
3. Configure:
   - Choose function: `generateAndEmailSlides`
   - Event source: Time-driven
   - Type: Week timer (or Day timer)
   - Day/Time: Choose when you want it to run
4. Click **Save**

**Example:** Run every Friday at 4 PM

## Support

For issues or questions:
- Check the execution logs first
- Use the `testConfiguration()` function to diagnose problems
- Review this setup guide carefully

## Version History

- **v1.0.0** - Initial release
  - Generate slides from template
  - Email as PDF
  - Custom menu integration
  - Error handling and logging
