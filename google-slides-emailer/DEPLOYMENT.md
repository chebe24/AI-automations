# Google Apps Script - Deployment Guide

This guide walks you through deploying the Weekly Student Slides Generator script to your Google Sheets.

## Deployment Methods

There are two ways to deploy this script:

1. **[Recommended] Bound Script** - Attached directly to your Google Sheets spreadsheet
2. **Standalone Script** - Independent script (more complex, not recommended for this use case)

We'll use the **Bound Script** method since it integrates seamlessly with your spreadsheet.

---

## Step-by-Step Deployment

### 1. Open Your Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Open the spreadsheet containing your student data (with the "masterconduct" sheet)
3. Make sure you're signed in to the Google account you want to use

### 2. Open Apps Script Editor

**Method A: Via Menu**
1. Click **Extensions** in the menu bar
2. Select **Apps Script**

**Method B: Via URL**
1. If your spreadsheet URL is `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
2. Go to `https://script.google.com/home/projects/CREATE_NEW_PROJECT`

A new browser tab will open with the Apps Script editor.

### 3. Set Up the Script Project

1. You'll see a default file named `Code.gs` with some placeholder code
2. **Delete all the existing code** in the editor
3. Copy the entire contents of our `Code.gs` file
4. Paste it into the Apps Script editor

### 4. Rename the Project (Optional but Recommended)

1. Click on "Untitled project" at the top
2. Rename it to something meaningful like:
   - `Weekly Slides Generator`
   - `Student Slides Automation`

### 5. Configure the Script

Find the `CONFIG` object at the top of the code (around line 15) and update it:

```javascript
const CONFIG = {
  TEMPLATE_ID: 'YOUR_ACTUAL_TEMPLATE_ID_HERE', // ← CHANGE THIS
  FOLDER_NAME: 'Inbox',                         // ← Optional: change folder name
  EMAIL_RECIPIENT: 'chebert4@ebrschools.org',   // ← Verify/change recipient
  SHEET_NAME: 'masterconduct',                  // ← Verify sheet name

  START_ROW: 7,        // ← First row with student data
  NUM_ROWS: 12,        // ← Number of students

  // Column indices (A=0, B=1, C=2, etc.)
  COL_FIRST_NAME: 1,   // ← Column B
  COL_LAST_NAME: 2,    // ← Column C
  COL_WEEK: 4,         // ← Column E
  COL_TEACHER: 10      // ← Column K
};
```

**To get your TEMPLATE_ID:**
1. Open your Google Slides template
2. Look at the URL: `https://docs.google.com/presentation/d/TEMPLATE_ID_HERE/edit`
3. Copy the long string between `/d/` and `/edit`
4. Paste it in place of `'YOUR_ACTUAL_TEMPLATE_ID_HERE'`

### 6. Save the Script

1. Click the **💾 Save** icon (or press `Ctrl+S` / `Cmd+S`)
2. The script is now saved to your spreadsheet

### 7. Test the Configuration

Before running the full script, test your configuration:

1. In the Apps Script editor, find the function dropdown (shows "Select function")
2. Select **`testConfiguration`** from the dropdown
3. Click the **▶️ Run** button

**First-time authorization:**
- You'll see "Authorization required" - click **Review permissions**
- Choose your Google account
- Click **Advanced** → **Go to Weekly Slides Generator (unsafe)**
- Click **Allow** to grant permissions:
  - View and manage your spreadsheets
  - View and manage your presentations
  - View and manage your Drive files
  - Send email as you

4. Check the results - it will show what's configured correctly and what needs fixing

### 8. Run the Script

**Option A: From Apps Script Editor**
1. Select **`generateAndEmailSlides`** from the function dropdown
2. Click **▶️ Run**
3. Check the **Execution log** at the bottom for status

**Option B: From Google Sheets (Recommended)**
1. Go back to your Google Sheets tab
2. **Refresh the page** (important - this loads the custom menu)
3. You should see a new menu: **📧 Weekly Slides**
4. Click **📧 Weekly Slides → Test Configuration** (test first)
5. If all checks pass, click **📧 Weekly Slides → Generate and Email Slides**

### 9. Verify the Results

After running the script:

1. **Check Google Drive:**
   - Look for a folder named "Inbox" (or your custom folder name)
   - Find a file named "Weekly Slides - YYYY-MM-DD"
   - Open it to verify the slides were created correctly

2. **Check Email:**
   - The recipient should receive an email with the PDF attachment
   - Check spam folder if not in inbox

3. **Check Logs:**
   - In Apps Script editor: Click **Executions** in the left sidebar
   - Or in Sheets: **📧 Weekly Slides → View Logs**

---

## Setting Up Automatic Triggers (Optional)

To run the script automatically on a schedule:

### 1. Create a Trigger

1. In Apps Script editor, click the **⏰ Triggers** icon (clock icon in left sidebar)
2. Click **+ Add Trigger** (bottom right)

### 2. Configure the Trigger

Set up the trigger with these settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| **Choose function** | `generateAndEmailSlides` | The function to run |
| **Deployment** | Head | Latest version |
| **Event source** | Time-driven | Run on schedule |
| **Type** | Week timer | Run weekly |
| **Day** | Friday | Day of week |
| **Time** | 4pm to 5pm | Time window |

### 3. Save the Trigger

1. Click **Save**
2. You may need to authorize again
3. The script will now run automatically every Friday between 4-5pm

### 4. Manage Triggers

To view, edit, or delete triggers:
1. Click **⏰ Triggers** in Apps Script editor
2. Click the three dots (**⋮**) next to any trigger
3. Choose Edit or Remove

---

## Updating the Script

If you need to make changes later:

### 1. Open Apps Script

1. Go to your Google Sheets
2. Click **Extensions → Apps Script**

### 2. Make Changes

1. Edit the `CONFIG` object or function code
2. Click **💾 Save**

### 3. Test Changes

1. Run `testConfiguration` again
2. Check the execution log

### 4. No Redeployment Needed

Changes are automatically available - just save and run!

---

## Troubleshooting Deployment

### "Script not authorized"
**Solution:** You need to authorize the script
1. Run any function (like `testConfiguration`)
2. Click "Review permissions"
3. Follow the authorization flow

### "Custom menu doesn't appear"
**Solution:** Refresh your spreadsheet
1. Close and reopen the spreadsheet, OR
2. Press `Ctrl+R` / `Cmd+R` to refresh

### "Cannot find function generateAndEmailSlides"
**Solution:** Make sure you saved the script
1. Go to Apps Script editor
2. Click **💾 Save**
3. Go back to Sheets and refresh

### "Template not found"
**Solution:** Check your TEMPLATE_ID
1. Verify the ID is correct
2. Make sure you have access to the template
3. Run `testConfiguration` to diagnose

### "Exceeded maximum execution time"
**Solution:** Your script ran too long (6-minute limit)
1. Process fewer students (reduce `NUM_ROWS`)
2. Simplify your template
3. Run multiple smaller batches

### "Service invoked too many times"
**Solution:** You hit quota limits
- Sheets API: 20,000 calls/day
- Gmail: 100 emails/day (free accounts)
- Wait 24 hours for quota reset

---

## Deployment Checklist

Use this checklist to ensure proper deployment:

- [ ] Opened Google Sheets with student data
- [ ] Opened Apps Script editor (Extensions → Apps Script)
- [ ] Pasted `Code.gs` code into editor
- [ ] Renamed project to "Weekly Slides Generator"
- [ ] Updated `CONFIG.TEMPLATE_ID` with actual template ID
- [ ] Verified other CONFIG settings (sheet name, columns, etc.)
- [ ] Saved the script (💾 icon)
- [ ] Ran `testConfiguration` function
- [ ] Authorized the script (granted permissions)
- [ ] Fixed any errors from test configuration
- [ ] Refreshed Google Sheets to see custom menu
- [ ] Ran "Test Configuration" from menu
- [ ] Ran "Generate and Email Slides" from menu
- [ ] Verified slides were created in Google Drive
- [ ] Verified email was received
- [ ] (Optional) Set up automatic trigger

---

## Next Steps

After successful deployment:

1. **Test with sample data** first before running on production data
2. **Set up automatic triggers** if you want weekly automation
3. **Monitor execution logs** for the first few runs
4. **Customize the template** to match your needs
5. **Adjust configuration** as needed (more/fewer students, different columns, etc.)

---

## Getting Help

If you encounter issues:

1. **Check execution logs** - Apps Script editor → Executions
2. **Run test configuration** - Diagnoses most common issues
3. **Review error messages** - They usually point to the problem
4. **Check quotas** - [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)

---

## Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Apps Script Authorization](https://developers.google.com/apps-script/guides/services/authorization)
- [Apps Script Triggers](https://developers.google.com/apps-script/guides/triggers)
- [Apps Script Quotas and Limits](https://developers.google.com/apps-script/guides/services/quotas)

---

**Congratulations!** Your script is now deployed and ready to use! 🎉
