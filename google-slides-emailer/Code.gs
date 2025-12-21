/**
 * Google Apps Script: Weekly Student Slides Generator
 *
 * This script generates a Google Slides presentation with one slide per student,
 * populated with data from a Google Sheets database, and emails it as a PDF.
 *
 * @author AI Automations
 * @version 1.1.0
 */

// ========================================
// CENTRALIZED CONFIGURATION
// ========================================
// Edit these values to match your setup
const CONFIG = {
  TEMPLATE_ID: 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE', // The ID of your Google Slides template
  FOLDER_NAME: 'Inbox',
  EMAIL_RECIPIENT: 'chebert4@ebrschools.org',
  SHEET_NAME: 'masterconduct',
/**
 * Main function to generate slides and email them
 */
function generateAndEmailSlides() {
  // --- CONFIGURATION ZONE ---
  const TEMPLATE_ID = '1bvqkGOzNtprkWFh4STGnK2DvhVb563VeR4_qWWDORcU'; // The ID of your Google Slides template
  const FOLDER_NAME = 'Inbox';
  const EMAIL_RECIPIENT = 'chebert4@ebrschools.org';
  const SHEET_NAME = 'masterconduct';

  // Data Range settings (Rows 7 to 18 = 12 students)
  START_ROW: 7,
  NUM_ROWS: 12,

  // Column Indices (A=0, B=1, C=2, etc.)
  COL_FIRST_NAME: 1,  // Col B
  COL_LAST_NAME: 2,   // Col C
  COL_WEEK: 4,        // Col E (Week Range)
  COL_TEACHER: 10     // Col K
};
// ========================================

/**
 * Main function to generate slides and email them
 */
function generateAndEmailSlides() {

  try {
    // Validate Template ID
    if (CONFIG.TEMPLATE_ID === 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE') {
      throw new Error('Please configure CONFIG.TEMPLATE_ID with your Google Slides template ID');
    }

    Logger.log('Starting slide generation process...');

    // 1. Get spreadsheet data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + CONFIG.SHEET_NAME + '" not found. Please check the CONFIG.SHEET_NAME configuration.');
    }

    const data = sheet.getRange(CONFIG.START_ROW, 1, CONFIG.NUM_ROWS, sheet.getLastColumn()).getValues();
    Logger.log('Retrieved ' + data.length + ' rows of student data');

    // 2. Find or Create 'Inbox' Folder
    const folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
      Logger.log('Found existing folder: ' + CONFIG.FOLDER_NAME);
    } else {
      folder = DriveApp.createFolder(CONFIG.FOLDER_NAME);
      Logger.log('Created new folder: ' + CONFIG.FOLDER_NAME);
    }

    // 3. Validate template is a Google Slides file
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_ID);
    const templateMimeType = templateFile.getMimeType();

    if (templateMimeType !== 'application/vnd.google-apps.presentation') {
      throw new Error(
        'Template ID points to a ' + templateMimeType + ' file, not a Google Slides presentation. ' +
        'Please use a Google Slides file as your template. Current template: "' + templateFile.getName() + '"'
      );
    }

    // 4. Create the NEW Presentation from template
    const dateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const newFileName = "Weekly Slides - " + dateString;

    const newFile = templateFile.makeCopy(newFileName, folder);
    const newDeck = SlidesApp.openById(newFile.getId());

    Logger.log('Created new presentation: ' + newFileName);

    // 5. Get the template slide (first slide in the copied presentation)
    const slides = newDeck.getSlides();
    if (slides.length === 0) {
      throw new Error('Template presentation has no slides');
    }

    const templateSlide = slides[0];

    // 6. Generate slides for each student
    let processedCount = 0;
    let weekRangeValue = '';

    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      let firstName = row[CONFIG.COL_FIRST_NAME];
      let lastName = row[CONFIG.COL_LAST_NAME];
      let weekRange = row[CONFIG.COL_WEEK];
      let teacher = row[CONFIG.COL_TEACHER];

      // Skip empty rows
      if (!firstName || firstName.toString().trim() === '') {
        Logger.log('Skipping empty row ' + (CONFIG.START_ROW + i));
        continue;
      }

      // Store week range for email (use first non-empty value)
      if (!weekRangeValue && weekRange) {
        weekRangeValue = weekRange.toString();
      }

      Logger.log('Processing student ' + (i + 1) + ': ' + firstName + ' ' + lastName);

      // ALWAYS duplicate from the original template to get a clean copy
      // This ensures each slide is created from the unmodified template
      let currentSlide = templateSlide.duplicate();

      // Perform text replacements on the duplicate
      let fullName = firstName.toString() + " " + lastName.toString();
      currentSlide.replaceAllText("<<name>>", fullName);
      currentSlide.replaceAllText("<<Teacher>>", teacher ? teacher.toString() : "");
      currentSlide.replaceAllText("<<week>>", weekRange ? weekRange.toString() : "");

      processedCount++;
    }

    // Remove the original template slide (it's unmodified and no longer needed)
    templateSlide.remove();

    Logger.log('Processed ' + processedCount + ' student slides');

    // 7. Save the presentation
    newDeck.saveAndClose();
    Logger.log('Presentation saved successfully');

    // 8. Email the file as PDF
    const pdfBlob = newFile.getAs(MimeType.PDF);
    const emailSubject = "Weekly Student Slides - " + dateString;
    const emailBody =
      "Attached is the weekly slides document.\n\n" +
      "Week: " + (weekRangeValue || 'N/A') + "\n" +
      "Students processed: " + processedCount + "\n" +
      "Generated: " + dateString + "\n\n" +
      "This email was sent automatically by the Weekly Slides Generator script.";

    GmailApp.sendEmail(CONFIG.EMAIL_RECIPIENT, emailSubject, emailBody, {
      attachments: [pdfBlob],
      name: "Weekly Slides Generator"
    });

    Logger.log('Email sent successfully to ' + CONFIG.EMAIL_RECIPIENT);

    // Show success message
    SpreadsheetApp.getUi().alert(
      'Success!',
      'Generated ' + processedCount + ' slides and sent to ' + CONFIG.EMAIL_RECIPIENT,
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
  const menu = ui.createMenu('Slides Emailer');

  const menuItems = [
    { name: 'Generate and Email Slides', functionName: 'generateAndEmailSlides' },
    // add more items here as needed, e.g.:
    // { name: 'Test Configuration', functionName: 'testConfiguration' },
    // { separator: true },
    // { name: 'View Logs', functionName: 'viewLogs' }
  ];

  menuItems.forEach(item => {
    if (item.separator) {
      menu.addSeparator();
    } else {
      menu.addItem(item.name, item.functionName);
    }
  });

  menu.addToUi();
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
 * This function reads from the centralized CONFIG object
 */
function testConfiguration() {
  let errors = [];
  let warnings = [];
  let successes = [];

  Logger.log('Starting configuration test...');

  // Test 1: Template ID
  if (CONFIG.TEMPLATE_ID === 'ENTER_YOUR_TEMPLATE_SLIDE_ID_HERE') {
    errors.push('❌ Template ID not configured');
  } else {
    try {
      const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_ID);
      const templateName = templateFile.getName();
      successes.push('✅ Template file found: "' + templateName + '"');
      Logger.log('✅ Template file accessible: ' + templateName);

      // Check if it's actually a Google Slides file
      if (templateFile.getMimeType() !== 'application/vnd.google-apps.presentation') {
        warnings.push('⚠️ Template file is not a Google Slides presentation');
      }
    } catch (e) {
      errors.push('❌ Template file not accessible: ' + e.toString());
    }
  }

  // Test 2: Sheet exists
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (sheet) {
      successes.push('✅ Sheet "' + CONFIG.SHEET_NAME + '" found');
      Logger.log('✅ Sheet "' + CONFIG.SHEET_NAME + '" found');

      // Test 3: Data exists
      const data = sheet.getRange(CONFIG.START_ROW, 1, CONFIG.NUM_ROWS, sheet.getLastColumn()).getValues();
      successes.push('✅ Retrieved ' + data.length + ' rows of data (rows ' + CONFIG.START_ROW + '-' + (CONFIG.START_ROW + CONFIG.NUM_ROWS - 1) + ')');
      Logger.log('✅ Retrieved ' + data.length + ' rows of data');

      // Test 4: Check for student data
      let studentCount = 0;
      for (let i = 0; i < data.length; i++) {
        let firstName = data[i][CONFIG.COL_FIRST_NAME];
        if (firstName && firstName.toString().trim() !== '') {
          studentCount++;
        }
      }

      if (studentCount === 0) {
        warnings.push('⚠️ No student data found in specified rows');
      } else {
        successes.push('✅ Found ' + studentCount + ' students with data');
        Logger.log('✅ Found ' + studentCount + ' students');
      }

      // Test 5: Check column data
      let hasWeekData = false;
      let hasTeacherData = false;

      for (let i = 0; i < data.length; i++) {
        if (data[i][CONFIG.COL_WEEK] && data[i][CONFIG.COL_WEEK].toString().trim() !== '') {
          hasWeekData = true;
        }
        if (data[i][CONFIG.COL_TEACHER] && data[i][CONFIG.COL_TEACHER].toString().trim() !== '') {
          hasTeacherData = true;
        }
      }

      if (!hasWeekData) {
        warnings.push('⚠️ No week data found in column ' + String.fromCharCode(65 + CONFIG.COL_WEEK));
      }
      if (!hasTeacherData) {
        warnings.push('⚠️ No teacher data found in column ' + String.fromCharCode(65 + CONFIG.COL_TEACHER));
      }

    } else {
      errors.push('❌ Sheet "' + CONFIG.SHEET_NAME + '" not found');
    }
  } catch (e) {
    errors.push('❌ Error accessing sheet: ' + e.toString());
  }

  // Test 6: Folder access
  try {
    const folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
    if (folders.hasNext()) {
      successes.push('✅ Output folder "' + CONFIG.FOLDER_NAME + '" exists');
    } else {
      warnings.push('⚠️ Output folder "' + CONFIG.FOLDER_NAME + '" does not exist (will be created)');
    }
  } catch (e) {
    warnings.push('⚠️ Could not check folder: ' + e.toString());
  }

  // Test 7: Email recipient
  if (CONFIG.EMAIL_RECIPIENT && CONFIG.EMAIL_RECIPIENT.includes('@')) {
    successes.push('✅ Email recipient configured: ' + CONFIG.EMAIL_RECIPIENT);
  } else {
    errors.push('❌ Invalid email recipient');
  }

  // Build result message
  let message = '';

  if (successes.length > 0) {
    message += 'PASSED CHECKS:\n' + successes.join('\n') + '\n\n';
  }

  if (warnings.length > 0) {
    message += 'WARNINGS:\n' + warnings.join('\n') + '\n\n';
  }

  if (errors.length > 0) {
    message += 'ERRORS:\n' + errors.join('\n');
  }

  // Show results
  const ui = SpreadsheetApp.getUi();
  if (errors.length === 0) {
    ui.alert(
      'Configuration Test Passed ✅',
      message + '\nYou can now run the main script!',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Configuration Test Failed ❌',
      message + '\n\nPlease fix the errors before running the script.',
      ui.ButtonSet.OK
    );
  }

  Logger.log('Configuration test complete. Errors: ' + errors.length + ', Warnings: ' + warnings.length);
}
