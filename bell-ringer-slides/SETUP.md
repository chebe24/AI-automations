# Journal du Matin - Full Year Bell Ringer Generator

## What It Does

Generates **weekly** Google Slides presentations for the entire EBR 2025-26 school year (177 instructional days). Each week gets one presentation with one slide per school day, populated from spiral content sheets.

**Key features:**
- Full EBR 2025-26 school calendar (holidays, breaks, PD days excluded)
- Spiral content from `FrenchSpiral` and `MathSpiral` sheets
- French error introduction engine (starts Feb 2, 2026)
- Batch generation (5 weeks per run to avoid Apps Script time limits)
- Drive folder organization by week
- French vocabulary extraction from Drive folders

---

## Prerequisites

- Google account with access to Sheets, Slides, and Drive
- A Google Slides template with placeholders (see below)
- A Google Drive output folder for generated presentations

---

## Step 1: Create Spiral Content Sheets

In your Google Sheet, create two tabs:

### FrenchSpiral

| A: DayNumber | B: Theme | C: CorrectSentence | D: ErrorType |
|---|---|---|---|
| 1 | Greeting | Bonjour, je m'appelle Cary. | none |
| 2 | Calendar | Aujourd'hui c'est lundi. | none |
| 43 | Location | J'habite a Baton Rouge, en Louisiane. | capital |
| 82 | Culture | L'arbre de la Louisiane est le cypres. | accent |

- **DayNumber**: Instructional day 1-177 (matches the school calendar)
- **Theme**: Content category
- **CorrectSentence**: The correct French sentence
- **ErrorType**: `none`, `capital`, `accent`, `missing_word`, `agreement`, or `punctuation`. Leave blank to use the automatic default (no errors before Feb 2, mixed errors after).

### MathSpiral

| A: DayNumber | B: Strand | C: Problem1 | D: Problem2 | E: Problem3 |
|---|---|---|---|---|
| 1 | Add10 | 5 + 3 = ? | 2 + 6 = ? | 7 + 1 = ? |
| 31 | PlaceVal | 14 = ___ tens ___ ones | | |

- **DayNumber**: Instructional day 1-177
- **Strand**: Math topic (Add10, Sub10, PlaceVal, etc.)
- **Problem1-3**: Up to 3 math problems per day. Leave blank if fewer.

---

## Step 2: Create Google Slides Template

Design a single-slide template with these placeholders in text boxes:

| Placeholder | Replaced With |
|---|---|
| `{{FrenchDate}}` | French date (e.g., "mercredi 12 fevrier") |
| `{{FrenchSentence}}` | French sentence (with errors after Feb 2) |
| `{{FrenchCorrect}}` | Correct sentence (for teacher/answer key) |
| `{{MathProblem1}}` | First math problem |
| `{{MathProblem2}}` | Second math problem |
| `{{MathProblem3}}` | Third math problem |
| `{{DayNumber}}` | Instructional day number (1-177) |
| `{{WeekNumber}}` | Week number (1-36) |
| `{{ErrorType}}` | Error type label (for teacher reference) |

Placeholders work inside text boxes, table cells, and grouped elements.

**Legacy placeholders** also supported for backward compatibility:
- `{{MathReviewProblem}}` (same as `{{MathProblem1}}`)
- `{{FrenchDWL}}` (same as `{{FrenchSentence}}`)

---

## Step 3: Install the Script

1. **Open your Google Sheet**
   - Sheet URL: https://docs.google.com/spreadsheets/d/1-23V3MDha24a_n-ZmrR7COgD0BpdWa3UQzALd32iz6E/edit

2. **Open the Script Editor**: Extensions > Apps Script

3. **Replace the default code**: Delete everything in `Code.gs`, paste the contents of `Code.gs` from this repository.

4. **Add the manifest** (recommended):
   - Click the gear icon (Project Settings)
   - Check "Show appsscript.json manifest file in editor"
   - Click `appsscript.json` in the sidebar
   - Replace its contents with the `appsscript.json` from this repository

5. **Save** (Ctrl+S / Cmd+S)

6. **Reload the spreadsheet** -- the **Admin** menu will appear.

---

## Step 4: Configure

1. Click **Admin > Setup Configuration...**
2. Paste your **Template Slides ID** when prompted
3. Paste your **Output Folder ID** when prompted
4. Click **Admin > Test Configuration** to verify

---

## Step 5: Build and Verify Calendar

1. Click **Admin > Build School Calendar**
2. Review the new "Calendar" sheet (177 rows, one per instructional day)
3. **Verify dates** against the official EBR 2025-26 calendar:
   https://ebrschools.org/wp-content/uploads/2025/03/2025-2026-EBRPSS-School-Year-Calendar.pdf
4. If any dates are wrong, edit the `HOLIDAYS` array in `getSchoolDays_()` and rebuild

---

## Step 6: Populate Spiral Sheets

### Option A: Manual
Fill in `FrenchSpiral` and `MathSpiral` row by row for days 1-177.

### Option B: Scan French Folder
1. Click **Admin > Scan French Folder...**
2. Paste a Google Drive folder ID containing French vocabulary Google Docs
3. Review the "FrenchExtract" sheet and copy relevant sentences into "FrenchSpiral"

Aim for ~80% automated, ~20% manual curation for standards gaps.

---

## Step 7: Generate Slides

### Generate Everything
1. Click **Admin > Generate Full Year**
2. The script processes **5 weeks per batch** (stays under the 6-minute limit)
3. A dialog shows progress. Click **Generate Full Year** again to continue.
4. Repeat until all 36 weeks are done.

### Generate One Week at a Time
- **Admin > Generate Next Week** -- generates the next unprocessed week
- **Admin > Generate Specific Week...** -- prompts for a week number

### Organize
After generation, click **Admin > Organize into Week Folders** to create:
```
Output Folder/
  Week 01 (Aug 7 - Aug 8)/
    Journal du Matin - Semaine 01 (Aug 7 - Aug 8).gslides
  Week 02 (Aug 11 - Aug 15)/
    Journal du Matin - Semaine 02 (Aug 11 - Aug 15).gslides
  ...
  Week 36 (May 18 - May 21)/
    Journal du Matin - Semaine 36 (May 18 - May 21).gslides
```

---

## Error Introduction Engine

Before Feb 2, 2026: All French sentences appear **correct** (no errors).

After Feb 2, 2026: The script **introduces errors** into the French sentence for students to identify and correct. Error types:

| Type | What It Does | Example |
|---|---|---|
| `none` | No error | Bonjour, je m'appelle Cary. |
| `capital` | Lowercases first letter | bonjour, je m'appelle Cary. |
| `accent` | Removes one accent | Bonjour, je m'appelle fev**r**ier. |
| `missing_word` | Removes middle word | J'habite Baton Rouge. |
| `agreement` | Swaps le/la, un/une | **la** chat est noir. |
| `punctuation` | Removes trailing punctuation | Bonjour, je m'appelle Cary |

**Priority**: If `FrenchSpiral` has an ErrorType value, that is used. Otherwise the automatic default rotation applies.

---

## Daily Teacher Workflow

```
1. Monday: Open this week's presentation from the Drive folder
2. Project the first slide (error visible to students)
3. Students correct independently (3 min)
4. Reveal correct: "La bonne phrase est..."
5. Math spiral review + correction
6. Advance to next slide
```

---

## Quarterly Maintenance

At the end of each 9-week period:
1. Update `FrenchSpiral` and `MathSpiral` with new content
2. Clear the relevant rows in the "GenerationLog" sheet
3. Re-run **Generate Specific Week...** for the updated weeks

---

## Sheets Created by the Script

| Sheet | Purpose | Created By |
|---|---|---|
| Calendar | 177 instructional days for review | "Build School Calendar" |
| FrenchExtract | Raw text from Drive folder scan | "Scan French Folder" |
| GenerationLog | Tracks which weeks have been generated | Auto-created on first generation |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **Admin menu missing** | Reload the spreadsheet |
| **"Setup Required" error** | Run Admin > Setup Configuration... |
| **"Missing Sheets" error** | Create FrenchSpiral and MathSpiral tabs |
| **Template not found** | Verify the Slides ID in Setup Configuration |
| **Slow generation** | Normal: ~1 min per week. Check Apps Script quotas if stuck. |
| **Wrong dates** | Edit the HOLIDAYS array in `getSchoolDays_()`, rebuild calendar |
| **Placeholders not replaced** | Ensure template uses exact `{{placeholder}}` strings |
| **Generation seems stuck** | Check the "GenerationLog" sheet. Clear rows to regenerate weeks. |
| **Permission errors** | Re-run and accept all OAuth prompts. Needs Sheets, Slides, Drive, Docs access. |

---

## Execution Checklist

```
[ ] Run setupConfig() -- save Template ID and Output Folder ID
[ ] Create FrenchSpiral and MathSpiral sheets with content for days 1-177
[ ] (Optional) Run scanFrenchFolderToSheet() to extract vocab from Drive
[ ] Run writeSchoolCalendar() -- verify 177 days against official calendar
[ ] Run testConfiguration() -- all checks pass
[ ] Run promptGenerateWeek() for week 1 -- test with a single week
[ ] Run generateFullYearJournal() repeatedly until all weeks are done
[ ] Run organizeIntoWeeks() -- creates weekly Drive folders
[ ] Share Week 01 folder and verify slides project correctly
```
