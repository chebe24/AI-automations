/**
 * Journal du Matin - Bell Ringer Slide Generator
 * Version: 1.0.0
 *
 * Generates daily "Journal du Matin" Google Slides presentations
 * from a Google Sheet for French Immersion bell ringer activities.
 *
 * Supports the Explicit Instruction model (Spiral review, strict timing).
 */

// ============================================================
// CONFIGURATION - Update these values before first use
// ============================================================
const CONFIG = {
  // The ID of your Google Slides template.
  // Find it in the URL: docs.google.com/presentation/d/THIS_PART/edit
  TEMPLATE_ID: '1f7z8OTSxXc8GTaf1bggIdzBq5rsgV9xZBR8NXvFeX2U',

  // Column headers (1-indexed column numbers)
  // Adjust these if your sheet layout differs.
  COL_DATE: 1,           // Column A: Date
  COL_MATH_PROBLEM: 2,   // Column B: MathProblem
  COL_FRENCH_SKILL: 3,   // Column C: FrenchSkill
  COL_GENERATED: 4,       // Column D: Generated?

  // Row where data starts (after header row)
  START_ROW: 2,

  // Placeholders used in the Slides template
  PLACEHOLDER_DATE: '{{FrenchDate}}',
  PLACEHOLDER_MATH: '{{MathReviewProblem}}',
  PLACEHOLDER_FRENCH: '{{FrenchDWL}}',
};

// ============================================================
// MENU
// ============================================================

/**
 * Creates a custom menu in the Google Sheets UI when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('\u26A1 Admin')
    .addItem('Generate Slides', 'generateSlides')
    .addItem('Test Configuration', 'testConfiguration')
    .addToUi();
}

// ============================================================
// MAIN FUNCTION
// ============================================================

/**
 * Reads unprocessed rows from the active sheet, duplicates template slides
 * into a new presentation, replaces placeholders, and marks rows as done.
 */
function generateSlides() {
  var ui = SpreadsheetApp.getUi();

  // --- Validate configuration ---
  if (!CONFIG.TEMPLATE_ID || CONFIG.TEMPLATE_ID === 'INSERT_YOUR_TEMPLATE_ID_HERE') {
    ui.alert(
      'Configuration Required',
      'Please set your TEMPLATE_ID in the script before running.\n\n' +
      'Open Extensions > Apps Script, then update the CONFIG object.',
      ui.ButtonSet.OK
    );
    return;
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.START_ROW) {
    ui.alert('No Data', 'The sheet has no data rows to process.', ui.ButtonSet.OK);
    return;
  }

  var dataRange = sheet.getRange(CONFIG.START_ROW, 1, lastRow - CONFIG.START_ROW + 1, CONFIG.COL_GENERATED);
  var data = dataRange.getValues();

  // --- Collect rows that need processing ---
  var rowsToProcess = [];
  for (var i = 0; i < data.length; i++) {
    var generatedFlag = data[i][CONFIG.COL_GENERATED - 1];
    if (generatedFlag === true || generatedFlag === 'TRUE' || generatedFlag === 'Done') {
      continue; // Already processed
    }

    var dateVal = data[i][CONFIG.COL_DATE - 1];
    var mathProblem = data[i][CONFIG.COL_MATH_PROBLEM - 1];
    var frenchSkill = data[i][CONFIG.COL_FRENCH_SKILL - 1];

    // Skip completely empty rows
    if (!dateVal && !mathProblem && !frenchSkill) {
      continue;
    }

    rowsToProcess.push({
      rowIndex: i,                          // 0-based index into data array
      sheetRow: CONFIG.START_ROW + i,       // actual sheet row number
      date: dateVal,
      mathProblem: mathProblem ? String(mathProblem) : '',
      frenchSkill: frenchSkill ? String(frenchSkill) : '',
    });
  }

  if (rowsToProcess.length === 0) {
    ui.alert('Nothing to Generate', 'All rows have already been processed or the sheet is empty.', ui.ButtonSet.OK);
    return;
  }

  // --- Open the template and create a new presentation ---
  var template;
  try {
    template = SlidesApp.openById(CONFIG.TEMPLATE_ID);
  } catch (e) {
    ui.alert(
      'Template Error',
      'Could not open the template presentation.\n\n' +
      'Verify the TEMPLATE_ID is correct and you have access.\n\n' +
      'Error: ' + e.message,
      ui.ButtonSet.OK
    );
    return;
  }

  var todayFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var newTitle = 'Journal du Matin - Generated ' + todayFormatted;

  // Copy the entire template to create the new presentation
  var templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_ID);
  var newFile = templateFile.makeCopy(newTitle);
  var newPresentation = SlidesApp.openById(newFile.getId());

  // The template has one master slide; we'll duplicate it for each row.
  // Get the first slide as our master layout.
  var slides = newPresentation.getSlides();
  if (slides.length === 0) {
    ui.alert('Template Error', 'The template presentation has no slides.', ui.ButtonSet.OK);
    newFile.setTrashed(true);
    return;
  }

  var masterSlide = slides[0];

  // --- Step 1: Duplicate the master slide to create enough blank copies ---
  // We must duplicate BEFORE replacing any text, since duplicate() copies
  // the current content of the source slide.
  // duplicate() inserts the copy right after the source slide.
  // We duplicate (N-1) times so we end up with N identical template slides.
  for (var d = 1; d < rowsToProcess.length; d++) {
    masterSlide.duplicate();
  }

  // --- Step 2: Replace placeholders on each slide ---
  // Re-fetch slides after duplication to get the correct order.
  // duplicate() inserts after the source, so for multiple duplicates from the
  // same source they stack in reverse. Re-fetching gives the actual order.
  var allSlides = newPresentation.getSlides();

  for (var j = 0; j < rowsToProcess.length; j++) {
    var row = rowsToProcess[j];
    var frenchDate = formatDateInFrench(row.date);
    var slide = allSlides[j];

    replaceTextInSlide(slide, CONFIG.PLACEHOLDER_DATE, frenchDate);
    replaceTextInSlide(slide, CONFIG.PLACEHOLDER_MATH, row.mathProblem);
    replaceTextInSlide(slide, CONFIG.PLACEHOLDER_FRENCH, row.frenchSkill);
  }

  // Remove any extra slides beyond what we need (e.g., if template had multiple slides)
  allSlides = newPresentation.getSlides();
  while (allSlides.length > rowsToProcess.length) {
    allSlides[allSlides.length - 1].remove();
    allSlides = newPresentation.getSlides();
  }

  // --- Mark rows as Done in the sheet ---
  for (var k = 0; k < rowsToProcess.length; k++) {
    sheet.getRange(rowsToProcess[k].sheetRow, CONFIG.COL_GENERATED).setValue('Done');
  }

  // --- Show success message ---
  var presentationUrl = 'https://docs.google.com/presentation/d/' + newFile.getId() + '/edit';
  ui.alert(
    'Slides Generated!',
    rowsToProcess.length + ' slide(s) created successfully.\n\n' +
    'Presentation: ' + newTitle + '\n\n' +
    'Open it here:\n' + presentationUrl,
    ui.ButtonSet.OK
  );

  Logger.log('Generated ' + rowsToProcess.length + ' slides. Presentation ID: ' + newFile.getId());
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Replaces all occurrences of a placeholder string in every text element on a slide.
 *
 * @param {GoogleAppsScript.Slides.Slide} slide - The slide to process.
 * @param {string} placeholder - The placeholder text to find.
 * @param {string} replacement - The text to insert.
 */
function replaceTextInSlide(slide, placeholder, replacement) {
  var pageElements = slide.getPageElements();
  for (var i = 0; i < pageElements.length; i++) {
    var element = pageElements[i];
    if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
      var textRange = element.asShape().getText();
      textRange.replaceAllText(placeholder, replacement);
    } else if (element.getPageElementType() === SlidesApp.PageElementType.TABLE) {
      var table = element.asTable();
      for (var r = 0; r < table.getNumRows(); r++) {
        for (var c = 0; c < table.getNumColumns(); c++) {
          table.getCell(r, c).getText().replaceAllText(placeholder, replacement);
        }
      }
    }
  }
}

/**
 * Converts a Date object into a French-formatted string.
 * Example: Date(2025, 1, 12) -> "mercredi 12 février"
 *
 * @param {Date|string} dateObj - The date value from the spreadsheet.
 * @returns {string} The formatted French date string, or a fallback.
 */
function formatDateInFrench(dateObj) {
  if (!dateObj) {
    return '(date manquante)';
  }

  // If the value is a string, try to parse it
  if (typeof dateObj === 'string') {
    dateObj = new Date(dateObj);
  }

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return String(dateObj);
  }

  var joursSemaine = [
    'dimanche', 'lundi', 'mardi', 'mercredi',
    'jeudi', 'vendredi', 'samedi'
  ];

  var moisAnnee = [
    'janvier', 'f\u00e9vrier', 'mars', 'avril',
    'mai', 'juin', 'juillet', 'ao\u00fbt',
    'septembre', 'octobre', 'novembre', 'd\u00e9cembre'
  ];

  var dayOfWeek = joursSemaine[dateObj.getDay()];
  var dayOfMonth = dateObj.getDate();
  var month = moisAnnee[dateObj.getMonth()];

  // In French, the first of the month uses "1er" (premier)
  var dayStr = (dayOfMonth === 1) ? '1er' : String(dayOfMonth);

  return dayOfWeek + ' ' + dayStr + ' ' + month;
}

// ============================================================
// CONFIGURATION TEST
// ============================================================

/**
 * Validates the script configuration and reports any issues.
 */
function testConfiguration() {
  var ui = SpreadsheetApp.getUi();
  var issues = [];

  // Check template ID
  if (!CONFIG.TEMPLATE_ID || CONFIG.TEMPLATE_ID === 'INSERT_YOUR_TEMPLATE_ID_HERE') {
    issues.push('TEMPLATE_ID has not been set.');
  } else {
    try {
      var file = DriveApp.getFileById(CONFIG.TEMPLATE_ID);
      Logger.log('Template found: ' + file.getName());
    } catch (e) {
      issues.push('Cannot access template. Check the TEMPLATE_ID and sharing permissions.');
    }
  }

  // Check sheet data
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.START_ROW) {
    issues.push('No data rows found. Data should start at row ' + CONFIG.START_ROW + '.');
  } else {
    var sampleDate = sheet.getRange(CONFIG.START_ROW, CONFIG.COL_DATE).getValue();
    if (!sampleDate) {
      issues.push('First data row has no Date value in column ' + CONFIG.COL_DATE + '.');
    } else {
      var formatted = formatDateInFrench(sampleDate);
      Logger.log('Sample date formatting: ' + sampleDate + ' -> ' + formatted);
    }

    // Count unprocessed rows
    var dataRange = sheet.getRange(CONFIG.START_ROW, 1, lastRow - CONFIG.START_ROW + 1, CONFIG.COL_GENERATED);
    var data = dataRange.getValues();
    var unprocessed = 0;
    for (var i = 0; i < data.length; i++) {
      var flag = data[i][CONFIG.COL_GENERATED - 1];
      if (flag !== true && flag !== 'TRUE' && flag !== 'Done') {
        if (data[i][CONFIG.COL_DATE - 1] || data[i][CONFIG.COL_MATH_PROBLEM - 1] || data[i][CONFIG.COL_FRENCH_SKILL - 1]) {
          unprocessed++;
        }
      }
    }
    Logger.log('Unprocessed rows: ' + unprocessed);
  }

  if (issues.length === 0) {
    var msg = 'All checks passed!\n\n';
    msg += 'Sheet: ' + sheet.getName() + '\n';
    msg += 'Data starts at row: ' + CONFIG.START_ROW + '\n';
    msg += 'Last row: ' + lastRow + '\n';
    if (typeof unprocessed !== 'undefined') {
      msg += 'Rows to process: ' + unprocessed + '\n';
    }
    if (typeof formatted !== 'undefined') {
      msg += 'Sample date: ' + formatted;
    }
    ui.alert('Configuration OK', msg, ui.ButtonSet.OK);
  } else {
    ui.alert('Configuration Issues', issues.join('\n\n'), ui.ButtonSet.OK);
  }
}
