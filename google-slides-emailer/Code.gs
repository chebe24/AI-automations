/**
 * Google Apps Script: Weekly Student Slides Generator
 *
 * This script generates a Google Slides presentation with one slide per student,
 * populated with data from a Google Sheets database, and emails it as a PDF.
 *
 * @author AI Automations
 * @version 1.0.0
 */

/**
 * Main function to generate slides and email them
 */
function generateAndEmailSlides() {
  // --- CONFIGURATION ZONE ---
  const TEMPLATE_ID = 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE'; // The ID of your Google Slides template
  const FOLDER_NAME = 'Inbox';
  const EMAIL_RECIPIENT = 'chebert4@ebrschools.org';
  const SHEET_NAME = 'masterconduct';

  // Data Range settings (Rows 7 to 18 = 12 students)
  const START_ROW = 7;
  const NUM_ROWS = 12;

  // Column Indices (A=0, B=1, C=2, etc.)
  const COL_FIRST_NAME = 1; // Col B
  const COL_LAST_NAME = 2;  // Col C
  const COL_WEEK = 4;       // Col E (Week Range)
  const COL_TEACHER = 10;   // Col K
  // --------------------------

  try {
    // Validate Template ID
    if (TEMPLATE_ID === 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE') {
      throw new Error('Please configure TEMPLATE_ID with your Google Slides template ID');
    }

    Logger.log('Starting slide generation process...');

    // 1. Get spreadsheet data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found. Please check the SHEET_NAME configuration.');
    }

    const data = sheet.getRange(START_ROW, 1, NUM_ROWS, sheet.getLastColumn()).getValues();
    Logger.log('Retrieved ' + data.length + ' rows of student data');

    // 2. Find or Create 'Inbox' Folder
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
      Logger.log('Found existing folder: ' + FOLDER_NAME);
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
      Logger.log('Created new folder: ' + FOLDER_NAME);
    }

    // 3. Create the NEW Presentation from template
    const dateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const newFileName = "Weekly Slides - " + dateString;

    const templateFile = DriveApp.getFileById(TEMPLATE_ID);
    const newFile = templateFile.makeCopy(newFileName, folder);
    const newDeck = SlidesApp.openById(newFile.getId());

    Logger.log('Created new presentation: ' + newFileName);

    // 4. Get the template slide (first slide in the copied presentation)
    const slides = newDeck.getSlides();
    if (slides.length === 0) {
      throw new Error('Template presentation has no slides');
    }

    const templateSlide = slides[0];

    // 5. Generate slides for each student
    let processedCount = 0;
    let weekRangeValue = '';

    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      let firstName = row[COL_FIRST_NAME];
      let lastName = row[COL_LAST_NAME];
      let weekRange = row[COL_WEEK];
      let teacher = row[COL_TEACHER];

      // Skip empty rows
      if (!firstName || firstName.toString().trim() === '') {
        Logger.log('Skipping empty row ' + (START_ROW + i));
        continue;
      }

      // Store week range for email (use first non-empty value)
      if (!weekRangeValue && weekRange) {
        weekRangeValue = weekRange.toString();
      }

      Logger.log('Processing student ' + (i + 1) + ': ' + firstName + ' ' + lastName);

      // Duplicate the template slide
      let currentSlide;
      if (i === 0) {
        // For the first student, use the existing template slide
        currentSlide = templateSlide;
      } else {
        // For subsequent students, duplicate the template
        currentSlide = templateSlide.duplicate();
      }

      // Perform text replacements
      let fullName = firstName.toString() + " " + lastName.toString();
      currentSlide.replaceAllText("<<name>>", fullName);
      currentSlide.replaceAllText("<<Teacher>>", teacher ? teacher.toString() : "");
      currentSlide.replaceAllText("<<week>>", weekRange ? weekRange.toString() : "");

      processedCount++;
    }

    Logger.log('Processed ' + processedCount + ' student slides');

    // 6. Save the presentation
    newDeck.saveAndClose();
    Logger.log('Presentation saved successfully');

    // 7. Email the file as PDF
    const pdfBlob = newFile.getAs(MimeType.PDF);
    const emailSubject = "Weekly Student Slides - " + dateString;
    const emailBody =
      "Attached is the weekly slides document.\n\n" +
      "Week: " + (weekRangeValue || 'N/A') + "\n" +
      "Students processed: " + processedCount + "\n" +
      "Generated: " + dateString + "\n\n" +
      "This email was sent automatically by the Weekly Slides Generator script.";

    GmailApp.sendEmail(EMAIL_RECIPIENT, emailSubject, emailBody, {
      attachments: [pdfBlob],
      name: "Weekly Slides Generator"
    });

    Logger.log('Email sent successfully to ' + EMAIL_RECIPIENT);

    // Show success message
    SpreadsheetApp.getUi().alert(
      'Success!',
      'Generated ' + processedCount + ' slides and sent to ' + EMAIL_RECIPIENT,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    Logger.log('ERROR: ' + error.toString());

    // Show error to user
    SpreadsheetApp.getUi().alert(
      'Error',
      'Failed to generate slides: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    throw error;
  }
}

/**
 * Creates a custom menu in Google Sheets for easy access
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Weekly Slides')
    .addItem('Generate and Email Slides', 'generateAndEmailSlides')
    .addSeparator()
    .addItem('View Logs', 'viewLogs')
    .addToUi();
}

/**
 * Opens the Apps Script logs in a new window
 */
function viewLogs() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'View Logs',
    'To view logs:\n\n' +
    '1. Click Extensions > Apps Script\n' +
    '2. Click "Executions" in the left sidebar\n' +
    '3. Click on any execution to see its logs',
    ui.ButtonSet.OK
  );
}

/**
 * Test function to validate configuration without sending email
 */
function testConfiguration() {
  const TEMPLATE_ID = 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE';
  const SHEET_NAME = 'masterconduct';
  const START_ROW = 7;
  const NUM_ROWS = 12;

  let errors = [];

  // Test 1: Template ID
  if (TEMPLATE_ID === 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE') {
    errors.push('❌ Template ID not configured');
  } else {
    try {
      DriveApp.getFileById(TEMPLATE_ID);
      Logger.log('✅ Template file found');
    } catch (e) {
      errors.push('❌ Template file not accessible: ' + e.toString());
    }
  }

  // Test 2: Sheet exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet) {
      Logger.log('✅ Sheet "' + SHEET_NAME + '" found');

      // Test 3: Data exists
      const data = sheet.getRange(START_ROW, 1, NUM_ROWS, sheet.getLastColumn()).getValues();
      Logger.log('✅ Retrieved ' + data.length + ' rows of data');
    } else {
      errors.push('❌ Sheet "' + SHEET_NAME + '" not found');
    }
  } catch (e) {
    errors.push('❌ Error accessing sheet: ' + e.toString());
  }

  // Show results
  const ui = SpreadsheetApp.getUi();
  if (errors.length === 0) {
    ui.alert(
      'Configuration Test Passed ✅',
      'All configuration checks passed! You can now run the main script.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Configuration Test Failed ❌',
      'Please fix the following issues:\n\n' + errors.join('\n'),
      ui.ButtonSet.OK
    );
  }
}
