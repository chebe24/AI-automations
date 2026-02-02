# Journal du Matin - Bell Ringer Slide Generator

## What It Does

This Google Apps Script reads rows from a Google Sheet and generates a Google Slides presentation with one slide per row. Each slide is populated with:

- A **French-formatted date** (e.g., "lundi 12 février")
- A **math/LEAP spiral review problem**
- A **French dictée or word-level skill**

After generation, each processed row is marked as "Done" in the sheet so it won't be regenerated.

---

## Prerequisites

- A Google account with access to Google Sheets, Slides, and Drive
- Your Google Slides template (ID already configured in the script)
- A Google Sheet with bell ringer data

---

## Google Sheet Layout

Your sheet must have this column structure starting from **Row 2** (Row 1 is the header):

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| **Date** | **MathProblem** | **FrenchSkill** | **Generated?** |
| 2/12/2025 | 3 × 7 = ? | Écrivez: le chat | |
| 2/13/2025 | 15 - 8 = ? | Dictée: la maison | |

- **Date** — Any valid date format Google Sheets recognizes.
- **MathProblem** — The spiral review / LEAP content (text string).
- **FrenchSkill** — The dictée or word-level work (text string).
- **Generated?** — Leave blank. The script fills in "Done" after processing.

---

## Google Slides Template

Your template slide must contain these exact placeholder strings:

| Placeholder | Replaced With |
|-------------|---------------|
| `{{FrenchDate}}` | French-formatted date (e.g., "mercredi 12 février") |
| `{{MathReviewProblem}}` | Content from the MathProblem column |
| `{{FrenchDWL}}` | Content from the FrenchSkill column |

Place these placeholders in text boxes on the first slide of your template. The script duplicates this slide for each data row.

---

## Installation

1. **Open your Google Sheet** containing the bell ringer data.
   - Sheet ID: `1-23V3MDha24a_n-ZmrR7COgD0BpdWa3UQzALd32iz6E`
   - URL: https://docs.google.com/spreadsheets/d/1-23V3MDha24a_n-ZmrR7COgD0BpdWa3UQzALd32iz6E/edit

2. **Open the Script Editor:**
   - Go to **Extensions > Apps Script**

3. **Replace the default code:**
   - Delete everything in `Code.gs`
   - Paste the entire contents of `Code.gs` from this repository

4. **Add the manifest** (optional but recommended):
   - In the Apps Script editor, click the gear icon (Project Settings)
   - Check **Show "appsscript.json" manifest file in editor**
   - Click on `appsscript.json` in the sidebar
   - Replace its contents with the `appsscript.json` from this repository

5. **Save the project** (Ctrl+S / Cmd+S)

6. **Reload the spreadsheet** — You should see the **⚡ Admin** menu appear.

---

## Usage

### First Run

1. Click **⚡ Admin > Test Configuration** to verify everything is set up.
2. Google will ask you to authorize the script — click through the permissions prompts.
3. Review the test results in the alert dialog.

### Generating Slides

1. Click **⚡ Admin > Generate Slides**
2. The script will:
   - Read all rows where "Generated?" is empty
   - Skip blank rows
   - Create a new presentation titled "Journal du Matin - Generated YYYY-MM-DD"
   - Replace placeholders on each slide with the row's data
   - Mark processed rows as "Done"
3. A dialog shows the number of slides created and a link to the new presentation.

---

## Configuration

The `CONFIG` object at the top of `Code.gs` can be adjusted:

```javascript
const CONFIG = {
  TEMPLATE_ID: '1f7z8OTSxXc8GTaf1bggIdzBq5rsgV9xZBR8NXvFeX2U',
  COL_DATE: 1,           // Column A
  COL_MATH_PROBLEM: 2,   // Column B
  COL_FRENCH_SKILL: 3,   // Column C
  COL_GENERATED: 4,      // Column D
  START_ROW: 2,          // First data row (after header)
  // Placeholder strings in the template:
  PLACEHOLDER_DATE: '{{FrenchDate}}',
  PLACEHOLDER_MATH: '{{MathReviewProblem}}',
  PLACEHOLDER_FRENCH: '{{FrenchDWL}}',
};
```

If your columns are in a different order, update the `COL_*` values accordingly (1 = A, 2 = B, etc.).

---

## French Date Formatting

The `formatDateInFrench()` helper converts dates like this:

| Input | Output |
|-------|--------|
| 2/12/2025 | mercredi 12 février |
| 3/1/2025 | samedi 1er mars |
| 12/25/2025 | jeudi 25 décembre |

Note: The 1st of any month uses "1er" (premier) per French convention.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **⚡ Admin menu doesn't appear** | Reload the spreadsheet. The `onOpen` trigger runs on page load. |
| **"Cannot access template" error** | Verify the template ID is correct and the template is shared with your account. |
| **Dates show as numbers** | Make sure the Date column is formatted as a Date in Google Sheets (Format > Number > Date). |
| **Placeholders not replaced** | Check that your template uses the exact strings: `{{FrenchDate}}`, `{{MathReviewProblem}}`, `{{FrenchDWL}}`. |
| **Authorization error** | Re-run and accept all permission prompts. The script needs access to Sheets, Slides, and Drive. |
| **"Nothing to Generate" message** | All rows already have "Done" in the Generated? column. Clear the column to regenerate. |

---

## Scheduling (Optional)

To run the script automatically on a schedule:

1. In Apps Script, go to **Triggers** (clock icon in the sidebar)
2. Click **+ Add Trigger**
3. Configure:
   - Function: `generateSlides`
   - Event source: Time-driven
   - Type: Day timer (e.g., 6:00 AM - 7:00 AM)
4. Click **Save**

The script will run daily and process any new rows.
