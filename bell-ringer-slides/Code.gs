/**
 * Journal du Matin - Full Year Bell Ringer Generator
 * Version: 2.0.0
 *
 * Generates weekly "Journal du Matin" Google Slides presentations for
 * EBR G1 French Immersion - 2025-26 School Year (177 Instructional Days).
 *
 * Features:
 *   - Full EBR 2025-26 school calendar (excludes holidays, breaks, PD days)
 *   - Spiral content from FrenchSpiral and MathSpiral sheets
 *   - French error introduction engine (Feb 2, 2026+)
 *   - Batch generation with automatic continuation (avoids 6-min limit)
 *   - Weekly presentations (one file per week, one slide per day)
 *   - Drive folder organization by week
 *   - French vocab extraction from Drive folder
 *
 * Standards: LA Immersion Novice High (A1), EBR Explicit Instruction bellringers
 */

// ================================================================
// CONFIGURATION
// ================================================================

/**
 * One-time setup: prompts for Google Drive/Slides IDs and saves them
 * to PropertiesService. Run this first, then verify with testConfiguration().
 */
function setupConfig() {
  var ui = SpreadsheetApp.getUi();

  var templateResult = ui.prompt(
    'Setup - Step 1 of 2',
    'Paste the Google Slides TEMPLATE ID:\n' +
    '(from the URL: docs.google.com/presentation/d/THIS_PART/edit)',
    ui.ButtonSet.OK_CANCEL
  );
  if (templateResult.getSelectedButton() !== ui.Button.OK) return;

  var outputResult = ui.prompt(
    'Setup - Step 2 of 2',
    'Paste the Google Drive OUTPUT FOLDER ID:\n' +
    '(from the URL: drive.google.com/drive/folders/THIS_PART)',
    ui.ButtonSet.OK_CANCEL
  );
  if (outputResult.getSelectedButton() !== ui.Button.OK) return;

  PropertiesService.getScriptProperties().setProperties({
    'TEMPLATE_SLIDES_ID': templateResult.getResponseText().trim(),
    'OUTPUT_FOLDER_ID': outputResult.getResponseText().trim(),
  });

  ui.alert(
    'Configuration Saved',
    'Template and Output Folder IDs saved.\n\nRun "Test Configuration" to verify.',
    ui.ButtonSet.OK
  );
}

/**
 * Returns saved configuration from script properties.
 * @returns {{templateId: string, outputFolderId: string}}
 * @private
 */
function getConfig_() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    templateId: props['TEMPLATE_SLIDES_ID'] || '',
    outputFolderId: props['OUTPUT_FOLDER_ID'] || '',
  };
}

// ================================================================
// MENU
// ================================================================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('\u26A1 Admin')
    .addItem('Generate Full Year', 'generateFullYearJournal')
    .addItem('Generate Next Week', 'generateNextWeek')
    .addItem('Generate Specific Week...', 'promptGenerateWeek')
    .addSeparator()
    .addItem('Build School Calendar', 'writeSchoolCalendar')
    .addItem('Scan French Folder...', 'scanFrenchFolderToSheet')
    .addItem('Organize into Week Folders', 'organizeIntoWeeks')
    .addSeparator()
    .addItem('Setup Configuration...', 'setupConfig')
    .addItem('Test Configuration', 'testConfiguration')
    .addToUi();
}

// ================================================================
// SCHOOL CALENDAR - EBR 2025-26
// ================================================================

/**
 * Returns an array of instructional day objects for the 2025-26 school year.
 *
 * *** IMPORTANT: Verify dates against the official EBR calendar:
 * https://ebrschools.org/wp-content/uploads/2025/03/2025-2026-EBRPSS-School-Year-Calendar.pdf
 *
 * @returns {Array<{date: Date, dayNum: number, weekNum: number}>}
 * @private
 */
function getSchoolDays_() {
  var FIRST_DAY = new Date(2025, 7, 7);   // Aug 7, 2025 (Thu)
  var LAST_DAY  = new Date(2026, 4, 21);  // May 21, 2026 (Thu)

  // Non-instructional dates: [startDate, endDate] inclusive
  // Edit this array to match the official calendar exactly.
  var HOLIDAYS = [
    [new Date(2025, 8, 1),   new Date(2025, 8, 1)],    // Labor Day
    [new Date(2025, 9, 9),   new Date(2025, 9, 10)],   // Fall Break (Oct 9-10)
    [new Date(2025, 10, 11), new Date(2025, 10, 11)],  // Veterans Day
    [new Date(2025, 10, 24), new Date(2025, 10, 28)],  // Thanksgiving week
    [new Date(2025, 11, 19), new Date(2026, 0, 5)],    // Winter Break (Dec 19 - Jan 5)
    [new Date(2026, 0, 19),  new Date(2026, 0, 19)],   // MLK Day
    [new Date(2026, 1, 16),  new Date(2026, 1, 20)],   // Mardi Gras week (Feb 16-20)
    [new Date(2026, 2, 30),  new Date(2026, 3, 3)],    // Spring Break (Mar 30 - Apr 3)
    [new Date(2026, 3, 6),   new Date(2026, 3, 6)],    // Easter Monday
  ];

  // Build a Set of holiday date strings for fast lookup
  var holidaySet = {};
  for (var h = 0; h < HOLIDAYS.length; h++) {
    var cur = new Date(HOLIDAYS[h][0]);
    var end = new Date(HOLIDAYS[h][1]);
    while (cur <= end) {
      holidaySet[cur.toDateString()] = true;
      cur.setDate(cur.getDate() + 1);
    }
  }

  var schoolDays = [];
  var dayNum = 0;
  var currentDate = new Date(FIRST_DAY);

  while (currentDate <= LAST_DAY) {
    var dow = currentDate.getDay();
    if (dow !== 0 && dow !== 6 && !holidaySet[currentDate.toDateString()]) {
      dayNum++;
      schoolDays.push({
        date: new Date(currentDate),
        dayNum: dayNum,
        weekNum: Math.ceil(dayNum / 5),
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  Logger.log('School days calculated: ' + schoolDays.length);
  return schoolDays;
}

/**
 * Writes the full school calendar to a "Calendar" sheet for teacher review.
 */
function writeSchoolCalendar() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Calendar');
  if (!sheet) {
    sheet = ss.insertSheet('Calendar');
  } else {
    sheet.clear();
  }

  sheet.getRange(1, 1, 1, 4).setValues([['Day #', 'Week #', 'Date', 'French Date']]);
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold');

  var days = getSchoolDays_();
  var rows = [];
  for (var i = 0; i < days.length; i++) {
    rows.push([
      days[i].dayNum,
      days[i].weekNum,
      days[i].date,
      formatDateInFrench_(days[i].date),
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }

  ui.alert(
    'Calendar Built',
    days.length + ' instructional days written to the "Calendar" sheet.\n\n' +
    'Verify dates against the official EBR 2025-26 calendar before generating slides.',
    ui.ButtonSet.OK
  );
}

// ================================================================
// FRENCH DRIVE FOLDER SCANNER
// ================================================================

/**
 * Scans a Google Drive folder for French vocabulary documents
 * and extracts their text content to a "FrenchExtract" sheet.
 * The teacher then curates this into the FrenchSpiral sheet.
 */
function scanFrenchFolderToSheet() {
  var ui = SpreadsheetApp.getUi();

  var result = ui.prompt(
    'French Folder ID',
    'Paste the Google Drive folder ID containing French vocabulary documents\n' +
    '(Google Docs only):',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;

  var folderId = result.getResponseText().trim();
  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    ui.alert('Error', 'Cannot access folder: ' + e.message, ui.ButtonSet.OK);
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('FrenchExtract');
  if (!sheet) {
    sheet = ss.insertSheet('FrenchExtract');
  } else {
    sheet.clear();
  }

  sheet.getRange(1, 1, 1, 3).setValues([['Source File', 'Line #', 'Text']]);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold');

  var files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
  var allRows = [];
  var fileCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    fileCount++;
    try {
      var doc = DocumentApp.openById(file.getId());
      var text = doc.getBody().getText();
      var lines = text.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.length > 0) {
          allRows.push([file.getName(), i + 1, line]);
        }
      }
    } catch (e) {
      Logger.log('Could not read file: ' + file.getName() + ' - ' + e.message);
    }
  }

  if (allRows.length > 0) {
    sheet.getRange(2, 1, allRows.length, 3).setValues(allRows);
  }

  ui.alert(
    'Scan Complete',
    allRows.length + ' lines extracted from ' + fileCount + ' document(s) in "' +
    folder.getName() + '".\n\n' +
    'Review the "FrenchExtract" sheet, then copy relevant sentences\n' +
    'to the "FrenchSpiral" sheet (DayNumber, Theme, CorrectSentence, ErrorType).',
    ui.ButtonSet.OK
  );
}

// ================================================================
// ERROR INTRODUCTION ENGINE
// ================================================================

/** @private Date after which errors are introduced */
var ERROR_START_DATE_ = new Date(2026, 1, 2); // Feb 2, 2026

/**
 * Determines the default error type for a given instructional day.
 * Before ERROR_START_DATE_ returns 'none'. After, cycles through types
 * with weighted distribution favoring simpler errors early.
 *
 * If the FrenchSpiral sheet specifies an ErrorType, that takes precedence
 * over this default.
 *
 * @param {number} dayNum - Instructional day number (1-177)
 * @param {Date} date - The calendar date
 * @returns {string} Error type identifier
 * @private
 */
function getDefaultErrorType_(dayNum, date) {
  if (date < ERROR_START_DATE_) {
    return 'none';
  }
  // Weighted cycle: capital-heavy early, diversifies over time
  var types = [
    'capital', 'capital', 'accent', 'capital', 'missing_word',
    'accent', 'capital', 'agreement', 'accent', 'punctuation',
  ];
  return types[(dayNum - 1) % types.length];
}

/**
 * Introduces a specific error into a correct French sentence.
 *
 * Supported error types:
 *   none          - returns sentence unchanged
 *   capital       - lowercases the first letter
 *   accent        - strips one accent (e.g. e instead of e)
 *   missing_word  - removes the middle word
 *   agreement     - swaps le/la, un/une, mon/ma
 *   punctuation   - removes trailing punctuation
 *
 * @param {string} sentence - The correct French sentence
 * @param {string} errorType - The type of error to introduce
 * @returns {string} Sentence with the specified error
 * @private
 */
function introduceError_(sentence, errorType) {
  if (!sentence || !errorType || errorType === 'none') {
    return sentence;
  }

  switch (errorType) {
    case 'capital':
      return sentence.charAt(0).toLowerCase() + sentence.slice(1);

    case 'accent':
      var accentMap = {
        '\u00e9': 'e', '\u00e8': 'e', '\u00ea': 'e', '\u00eb': 'e',
        '\u00e0': 'a', '\u00e2': 'a',
        '\u00f9': 'u', '\u00fb': 'u', '\u00fc': 'u',
        '\u00ee': 'i', '\u00ef': 'i',
        '\u00f4': 'o',
        '\u00e7': 'c',
      };
      var chars = sentence.split('');
      for (var i = 0; i < chars.length; i++) {
        if (accentMap[chars[i]]) {
          chars[i] = accentMap[chars[i]];
          return chars.join('');
        }
      }
      // No accent found, fall back to capital error
      return sentence.charAt(0).toLowerCase() + sentence.slice(1);

    case 'missing_word':
      var words = sentence.split(' ');
      if (words.length > 2) {
        var idx = Math.floor(words.length / 2);
        words.splice(idx, 1);
        return words.join(' ');
      }
      return sentence.charAt(0).toLowerCase() + sentence.slice(1);

    case 'agreement':
      var swaps = [
        { pattern: /\ble\b/, replacement: 'la' },
        { pattern: /\bla\b/, replacement: 'le' },
        { pattern: /\bun\b/, replacement: 'une' },
        { pattern: /\bune\b/, replacement: 'un' },
        { pattern: /\bmon\b/, replacement: 'ma' },
        { pattern: /\bma\b/, replacement: 'mon' },
      ];
      for (var s = 0; s < swaps.length; s++) {
        if (swaps[s].pattern.test(sentence)) {
          return sentence.replace(swaps[s].pattern, swaps[s].replacement);
        }
      }
      return sentence.charAt(0).toLowerCase() + sentence.slice(1);

    case 'punctuation':
      return sentence.replace(/[.!?]+$/, '');

    default:
      return sentence;
  }
}

// ================================================================
// CORE GENERATORS
// ================================================================

/**
 * Generates weekly presentations for all unprocessed weeks.
 * Processes in batches of 5 weeks per run to stay within the
 * Apps Script 6-minute execution time limit. Re-run to continue.
 */
function generateFullYearJournal() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig_();

  if (!config.templateId) {
    ui.alert('Setup Required', 'Run "Setup Configuration" first.', ui.ButtonSet.OK);
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!validateSpiralSheets_(ss)) return;

  var schoolDays = getSchoolDays_();
  if (schoolDays.length === 0) {
    ui.alert('Error', 'No school days found. Run "Build School Calendar" first.', ui.ButtonSet.OK);
    return;
  }

  var totalWeeks = schoolDays[schoolDays.length - 1].weekNum;
  var generatedWeeks = getGeneratedWeeks_(ss);

  var BATCH_SIZE = 5;
  var weeksGenerated = 0;
  var startTime = new Date().getTime();
  var MAX_MS = 5 * 60 * 1000; // 5 min (1 min buffer before 6 min limit)

  for (var week = 1; week <= totalWeeks; week++) {
    if (generatedWeeks[week]) continue;
    if (new Date().getTime() - startTime > MAX_MS) {
      ui.alert(
        'Batch Complete',
        weeksGenerated + ' week(s) generated.\n' +
        'Run "Generate Full Year" again to continue with remaining weeks.',
        ui.ButtonSet.OK
      );
      return;
    }

    var weekDays = [];
    for (var d = 0; d < schoolDays.length; d++) {
      if (schoolDays[d].weekNum === week) weekDays.push(schoolDays[d]);
    }
    if (weekDays.length === 0) continue;

    var presId = generateWeekPresentation_(config, ss, week, weekDays);
    logGeneration_(ss, week, presId);
    weeksGenerated++;

    if (weeksGenerated >= BATCH_SIZE) {
      var remaining = totalWeeks - Object.keys(generatedWeeks).length - weeksGenerated;
      ui.alert(
        'Batch Complete',
        weeksGenerated + ' week(s) generated. ~' + remaining + ' remaining.\n\n' +
        'Run "Generate Full Year" again to continue.',
        ui.ButtonSet.OK
      );
      return;
    }
  }

  if (weeksGenerated === 0) {
    ui.alert('All Done', 'All ' + totalWeeks + ' weeks have been generated.', ui.ButtonSet.OK);
  } else {
    ui.alert(
      'Generation Complete!',
      weeksGenerated + ' week(s) generated. All ' + totalWeeks + ' weeks done.\n\n' +
      'Run "Organize into Week Folders" to create the Drive folder structure.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Generates only the next ungenerated week.
 */
function generateNextWeek() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig_();
  if (!config.templateId) {
    ui.alert('Setup Required', 'Run "Setup Configuration" first.', ui.ButtonSet.OK);
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!validateSpiralSheets_(ss)) return;

  var schoolDays = getSchoolDays_();
  var totalWeeks = schoolDays[schoolDays.length - 1].weekNum;
  var generatedWeeks = getGeneratedWeeks_(ss);

  for (var week = 1; week <= totalWeeks; week++) {
    if (generatedWeeks[week]) continue;

    var weekDays = [];
    for (var d = 0; d < schoolDays.length; d++) {
      if (schoolDays[d].weekNum === week) weekDays.push(schoolDays[d]);
    }
    if (weekDays.length === 0) continue;

    var presId = generateWeekPresentation_(config, ss, week, weekDays);
    logGeneration_(ss, week, presId);

    var presUrl = 'https://docs.google.com/presentation/d/' + presId + '/edit';
    ui.alert(
      'Week ' + week + ' Generated',
      weekDays.length + ' slide(s) created.\n\n' + presUrl,
      ui.ButtonSet.OK
    );
    return;
  }

  ui.alert('All Done', 'All weeks have been generated.', ui.ButtonSet.OK);
}

/**
 * Prompts for a specific week number and generates it.
 */
function promptGenerateWeek() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig_();
  if (!config.templateId) {
    ui.alert('Setup Required', 'Run "Setup Configuration" first.', ui.ButtonSet.OK);
    return;
  }

  var result = ui.prompt(
    'Generate Specific Week',
    'Enter the week number (1-36):',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;

  var weekNum = parseInt(result.getResponseText().trim(), 10);
  if (isNaN(weekNum) || weekNum < 1) {
    ui.alert('Invalid', 'Please enter a valid week number.', ui.ButtonSet.OK);
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!validateSpiralSheets_(ss)) return;

  var schoolDays = getSchoolDays_();
  var weekDays = [];
  for (var d = 0; d < schoolDays.length; d++) {
    if (schoolDays[d].weekNum === weekNum) weekDays.push(schoolDays[d]);
  }

  if (weekDays.length === 0) {
    ui.alert('Not Found', 'No school days found for week ' + weekNum + '.', ui.ButtonSet.OK);
    return;
  }

  var presId = generateWeekPresentation_(config, ss, weekNum, weekDays);
  logGeneration_(ss, weekNum, presId);

  var presUrl = 'https://docs.google.com/presentation/d/' + presId + '/edit';
  ui.alert(
    'Week ' + weekNum + ' Generated',
    weekDays.length + ' slide(s) created.\n\n' + presUrl,
    ui.ButtonSet.OK
  );
}

/**
 * Generates a single week's presentation.
 *
 * @param {Object} config - Config from getConfig_()
 * @param {Spreadsheet} ss - Active spreadsheet
 * @param {number} weekNum - Week number
 * @param {Array} weekDays - Day objects for this week
 * @returns {string} Presentation file ID
 * @private
 */
function generateWeekPresentation_(config, ss, weekNum, weekDays) {
  // Load spiral data once
  var frenchMap = loadFrenchSpiral_(ss);
  var mathMap = loadMathSpiral_(ss);

  // Build presentation title
  var firstDate = weekDays[0].date;
  var lastDate = weekDays[weekDays.length - 1].date;
  var weekLabel = 'Semaine ' + padNum_(weekNum) + ' (' +
    formatDateShort_(firstDate) + ' - ' + formatDateShort_(lastDate) + ')';
  var presTitle = 'Journal du Matin - ' + weekLabel;

  // Copy the template
  var templateFile = DriveApp.getFileById(config.templateId);
  var newFile = templateFile.makeCopy(presTitle);

  // Move to output folder
  if (config.outputFolderId) {
    try {
      var outputFolder = DriveApp.getFolderById(config.outputFolderId);
      outputFolder.addFile(newFile);
      var parents = newFile.getParents();
      while (parents.hasNext()) {
        var parent = parents.next();
        if (parent.getId() !== config.outputFolderId) {
          parent.removeFile(newFile);
        }
      }
    } catch (e) {
      Logger.log('Could not move to output folder: ' + e.message);
    }
  }

  var presentation = SlidesApp.openById(newFile.getId());
  var slides = presentation.getSlides();
  if (slides.length === 0) {
    newFile.setTrashed(true);
    throw new Error('Template has no slides');
  }

  var masterSlide = slides[0];

  // Duplicate master for each day beyond the first (BEFORE any replacements)
  for (var d = 1; d < weekDays.length; d++) {
    masterSlide.duplicate();
  }

  // Re-fetch slides in presentation order
  var allSlides = presentation.getSlides();

  // Replace placeholders on each slide
  for (var j = 0; j < weekDays.length; j++) {
    var day = weekDays[j];
    var slide = allSlides[j];
    var frenchDate = formatDateInFrench_(day.date);

    // Get spiral content for this day
    var french = frenchMap[day.dayNum] || { theme: '', sentence: '', errorType: '' };
    var math = mathMap[day.dayNum] || { strand: '', problem1: '', problem2: '', problem3: '' };

    // Determine error type (sheet value takes precedence, then default)
    var errorType = french.errorType || getDefaultErrorType_(day.dayNum, day.date);

    // Apply error to French sentence
    var displaySentence = introduceError_(french.sentence, errorType);

    // Replace all placeholders
    replaceTextInSlide_(slide, '{{FrenchDate}}', frenchDate);
    replaceTextInSlide_(slide, '{{FrenchSentence}}', displaySentence);
    replaceTextInSlide_(slide, '{{FrenchCorrect}}', french.sentence);
    replaceTextInSlide_(slide, '{{MathProblem1}}', String(math.problem1));
    replaceTextInSlide_(slide, '{{MathProblem2}}', String(math.problem2));
    replaceTextInSlide_(slide, '{{MathProblem3}}', String(math.problem3));
    replaceTextInSlide_(slide, '{{DayNumber}}', String(day.dayNum));
    replaceTextInSlide_(slide, '{{WeekNumber}}', String(day.weekNum));
    replaceTextInSlide_(slide, '{{ErrorType}}', errorType);

    // Legacy v1.0 placeholders (backward compatible)
    replaceTextInSlide_(slide, '{{MathReviewProblem}}', String(math.problem1));
    replaceTextInSlide_(slide, '{{FrenchDWL}}', displaySentence);
  }

  // Remove extra slides if template had more than one
  allSlides = presentation.getSlides();
  while (allSlides.length > weekDays.length) {
    allSlides[allSlides.length - 1].remove();
    allSlides = presentation.getSlides();
  }

  presentation.saveAndClose();
  Logger.log('Generated: ' + presTitle + ' (' + weekDays.length + ' slides) -> ' + newFile.getId());
  return newFile.getId();
}

// ================================================================
// DRIVE ORGANIZATION
// ================================================================

/**
 * Creates weekly subfolders inside the output folder and moves
 * generated presentations into the matching week folder.
 */
function organizeIntoWeeks() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig_();
  if (!config.outputFolderId) {
    ui.alert('Setup Required', 'Run "Setup Configuration" first.', ui.ButtonSet.OK);
    return;
  }

  var outputFolder;
  try {
    outputFolder = DriveApp.getFolderById(config.outputFolderId);
  } catch (e) {
    ui.alert('Error', 'Cannot access output folder: ' + e.message, ui.ButtonSet.OK);
    return;
  }

  var schoolDays = getSchoolDays_();
  var totalWeeks = schoolDays[schoolDays.length - 1].weekNum;

  // Build week label map: weekNum -> folder name
  var weekLabels = {};
  for (var d = 0; d < schoolDays.length; d++) {
    var day = schoolDays[d];
    if (!weekLabels[day.weekNum]) {
      weekLabels[day.weekNum] = { first: day.date, last: day.date };
    } else {
      weekLabels[day.weekNum].last = day.date;
    }
  }

  // Get existing subfolders
  var existingFolders = {};
  var subFolders = outputFolder.getFolders();
  while (subFolders.hasNext()) {
    var f = subFolders.next();
    existingFolders[f.getName()] = f;
  }

  // Get all files in the output folder
  var files = outputFolder.getFiles();
  var movedCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    // Match files named "Journal du Matin - Semaine XX (...)"
    var match = name.match(/Semaine\s+(\d+)/);
    if (!match) continue;

    var weekNum = parseInt(match[1], 10);
    var wl = weekLabels[weekNum];
    if (!wl) continue;

    var folderName = 'Week ' + padNum_(weekNum) + ' (' +
      formatDateShort_(wl.first) + ' - ' + formatDateShort_(wl.last) + ')';

    var weekFolder = existingFolders[folderName];
    if (!weekFolder) {
      weekFolder = outputFolder.createFolder(folderName);
      existingFolders[folderName] = weekFolder;
    }

    weekFolder.addFile(file);
    outputFolder.removeFile(file);
    movedCount++;
  }

  ui.alert(
    'Organization Complete',
    movedCount + ' presentation(s) organized into weekly folders.',
    ui.ButtonSet.OK
  );
}

// ================================================================
// SPIRAL DATA LOADERS
// ================================================================

/**
 * Loads the FrenchSpiral sheet into a lookup map.
 * Expected columns: DayNumber | Theme | CorrectSentence | ErrorType
 *
 * @param {Spreadsheet} ss
 * @returns {Object<number, {theme: string, sentence: string, errorType: string}>}
 * @private
 */
function loadFrenchSpiral_(ss) {
  var sheet = ss.getSheetByName('FrenchSpiral');
  if (!sheet) return {};

  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    var dayNum = data[i][0];
    if (dayNum) {
      map[dayNum] = {
        theme: String(data[i][1] || ''),
        sentence: String(data[i][2] || ''),
        errorType: String(data[i][3] || '').toLowerCase().trim(),
      };
    }
  }
  return map;
}

/**
 * Loads the MathSpiral sheet into a lookup map.
 * Expected columns: DayNumber | Strand | Problem1 | Problem2 | Problem3
 *
 * @param {Spreadsheet} ss
 * @returns {Object<number, {strand: string, problem1: string, problem2: string, problem3: string}>}
 * @private
 */
function loadMathSpiral_(ss) {
  var sheet = ss.getSheetByName('MathSpiral');
  if (!sheet) return {};

  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    var dayNum = data[i][0];
    if (dayNum) {
      map[dayNum] = {
        strand: String(data[i][1] || ''),
        problem1: data[i][2] !== undefined && data[i][2] !== '' ? String(data[i][2]) : '',
        problem2: data[i][3] !== undefined && data[i][3] !== '' ? String(data[i][3]) : '',
        problem3: data[i][4] !== undefined && data[i][4] !== '' ? String(data[i][4]) : '',
      };
    }
  }
  return map;
}

// ================================================================
// GENERATION LOG HELPERS
// ================================================================

/**
 * Returns a map of already-generated week numbers.
 * @param {Spreadsheet} ss
 * @returns {Object<number, boolean>}
 * @private
 */
function getGeneratedWeeks_(ss) {
  var sheet = ss.getSheetByName('GenerationLog');
  if (!sheet) return {};

  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === 'Done') {
      map[data[i][0]] = true;
    }
  }
  return map;
}

/**
 * Logs a successful generation to the GenerationLog sheet.
 * @param {Spreadsheet} ss
 * @param {number} weekNum
 * @param {string} presId
 * @private
 */
function logGeneration_(ss, weekNum, presId) {
  var sheet = ss.getSheetByName('GenerationLog');
  if (!sheet) {
    sheet = ss.insertSheet('GenerationLog');
    sheet.getRange(1, 1, 1, 4).setValues([['Week #', 'Status', 'Presentation ID', 'Timestamp']]);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  var row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 4).setValues([[weekNum, 'Done', presId, new Date()]]);
}

/**
 * Checks that FrenchSpiral and MathSpiral sheets exist.
 * @param {Spreadsheet} ss
 * @returns {boolean}
 * @private
 */
function validateSpiralSheets_(ss) {
  var ui = SpreadsheetApp.getUi();
  var missing = [];
  if (!ss.getSheetByName('FrenchSpiral')) missing.push('FrenchSpiral');
  if (!ss.getSheetByName('MathSpiral')) missing.push('MathSpiral');

  if (missing.length > 0) {
    ui.alert(
      'Missing Sheets',
      'Create the following sheet(s) first:\n\n' + missing.join(', ') + '\n\n' +
      'FrenchSpiral columns: DayNumber | Theme | CorrectSentence | ErrorType\n' +
      'MathSpiral columns: DayNumber | Strand | Problem1 | Problem2 | Problem3\n\n' +
      'See SETUP.md for details.',
      ui.ButtonSet.OK
    );
    return false;
  }
  return true;
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Replaces all occurrences of a placeholder in every text element on a slide.
 * Handles shapes, tables, and grouped elements.
 *
 * @param {Slide} slide
 * @param {string} placeholder
 * @param {string} replacement
 * @private
 */
function replaceTextInSlide_(slide, placeholder, replacement) {
  var elements = slide.getPageElements();
  for (var i = 0; i < elements.length; i++) {
    replaceInElement_(elements[i], placeholder, replacement);
  }
}

/**
 * Recursively replaces text in a page element (handles groups).
 * @private
 */
function replaceInElement_(element, placeholder, replacement) {
  var type = element.getPageElementType();

  if (type === SlidesApp.PageElementType.SHAPE) {
    element.asShape().getText().replaceAllText(placeholder, replacement);
  } else if (type === SlidesApp.PageElementType.TABLE) {
    var table = element.asTable();
    for (var r = 0; r < table.getNumRows(); r++) {
      for (var c = 0; c < table.getNumColumns(); c++) {
        table.getCell(r, c).getText().replaceAllText(placeholder, replacement);
      }
    }
  } else if (type === SlidesApp.PageElementType.GROUP) {
    var children = element.asGroup().getChildren();
    for (var g = 0; g < children.length; g++) {
      replaceInElement_(children[g], placeholder, replacement);
    }
  }
}

/**
 * Converts a Date into a French-formatted string.
 * e.g. "mercredi 12 f\u00e9vrier" or "samedi 1er mars"
 *
 * @param {Date|string} dateObj
 * @returns {string}
 * @private
 */
function formatDateInFrench_(dateObj) {
  if (!dateObj) return '(date manquante)';

  if (typeof dateObj === 'string') {
    dateObj = new Date(dateObj);
  }
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return String(dateObj);
  }

  var jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var mois = [
    'janvier', 'f\u00e9vrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'ao\u00fbt', 'septembre', 'octobre', 'novembre', 'd\u00e9cembre',
  ];

  var dayOfMonth = dateObj.getDate();
  var dayStr = (dayOfMonth === 1) ? '1er' : String(dayOfMonth);

  return jours[dateObj.getDay()] + ' ' + dayStr + ' ' + mois[dateObj.getMonth()];
}

/**
 * Short date format for folder/file labels: "Aug 7" or "Feb 16"
 * @param {Date} dateObj
 * @returns {string}
 * @private
 */
function formatDateShort_(dateObj) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[dateObj.getMonth()] + ' ' + dateObj.getDate();
}

/**
 * Zero-pads a number to 2 digits: 1 -> "01", 12 -> "12"
 * @param {number} n
 * @returns {string}
 * @private
 */
function padNum_(n) {
  return (n < 10 ? '0' : '') + n;
}

// ================================================================
// CONFIGURATION TEST
// ================================================================

/**
 * Validates the full configuration: template access, output folder,
 * spiral sheets, and school calendar.
 */
function testConfiguration() {
  var ui = SpreadsheetApp.getUi();
  var config = getConfig_();
  var issues = [];
  var info = [];

  // Check template
  if (!config.templateId) {
    issues.push('Template Slides ID not set. Run "Setup Configuration".');
  } else {
    try {
      var tf = DriveApp.getFileById(config.templateId);
      info.push('Template: ' + tf.getName());
      var tp = SlidesApp.openById(config.templateId);
      info.push('Template slides: ' + tp.getSlides().length);
    } catch (e) {
      issues.push('Cannot access template: ' + e.message);
    }
  }

  // Check output folder
  if (!config.outputFolderId) {
    issues.push('Output Folder ID not set. Run "Setup Configuration".');
  } else {
    try {
      var outFolder = DriveApp.getFolderById(config.outputFolderId);
      info.push('Output folder: ' + outFolder.getName());
    } catch (e) {
      issues.push('Cannot access output folder: ' + e.message);
    }
  }

  // Check spiral sheets
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var frenchSheet = ss.getSheetByName('FrenchSpiral');
  var mathSheet = ss.getSheetByName('MathSpiral');

  if (!frenchSheet) {
    issues.push('Missing "FrenchSpiral" sheet.');
  } else {
    var frenchRows = frenchSheet.getLastRow() - 1;
    info.push('FrenchSpiral rows: ' + frenchRows);
  }

  if (!mathSheet) {
    issues.push('Missing "MathSpiral" sheet.');
  } else {
    var mathRows = mathSheet.getLastRow() - 1;
    info.push('MathSpiral rows: ' + mathRows);
  }

  // Check calendar
  var schoolDays = getSchoolDays_();
  info.push('School days: ' + schoolDays.length);
  if (schoolDays.length > 0) {
    info.push('First day: ' + formatDateInFrench_(schoolDays[0].date));
    info.push('Last day: ' + formatDateInFrench_(schoolDays[schoolDays.length - 1].date));
    info.push('Total weeks: ' + schoolDays[schoolDays.length - 1].weekNum);
  }

  // Check generation progress
  var generated = getGeneratedWeeks_(ss);
  var genCount = Object.keys(generated).length;
  info.push('Weeks generated: ' + genCount);

  // Show results
  if (issues.length === 0) {
    ui.alert('Configuration OK', info.join('\n'), ui.ButtonSet.OK);
  } else {
    ui.alert(
      'Configuration Issues',
      'ISSUES:\n' + issues.join('\n') + '\n\n' +
      'INFO:\n' + info.join('\n'),
      ui.ButtonSet.OK
    );
  }
}
