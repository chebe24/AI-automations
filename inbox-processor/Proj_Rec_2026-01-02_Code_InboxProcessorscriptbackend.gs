/**
 * INBOX FILE PROCESSOR - Google Apps Script Backend
 * ================================================
 * Securely processes files from inbox, renames per naming convention,
 * moves to destination folders, and logs all operations to spreadsheet database.
 * 
 * SECURITY: Uses minimal OAuth scopes, PropertiesService for config,
 * PII masking, and audit logging.
 */

// ============================================================================
// CONFIGURATION & INITIALIZATION
// ============================================================================

const CONFIG = {
  LOGGING_SHEET_ID: PropertiesService.getScriptProperties().getProperty('LOGGING_SHEET_ID'),
  SANDBOX_MODE: PropertiesService.getScriptProperties().getProperty('SANDBOX_MODE') === 'true',
  MAX_EXECUTION_TIME: 5 * 60 * 1000,
  BATCH_SIZE: 10,
  NAMING_PATTERN: /^([A-Za-z0-9-]+)_([A-Za-z_]+)_([A-Za-z]+)_(\d{4}-\d{2}-\d{2})\.[a-zA-Z0-9]+$/,
  EXCLUDED_FOLDERS: ['99_Archive', '00_Inbox']
};

const FILE_TYPE_CODES = {
  'Pres': 'Google Slides/Powerpoints/Speeches',
  'Med': 'Images/Video/Audio',
  'Code': 'Scripts/Apps Script',
  'Rec': 'Certificates, ID cards, Records/Tracking, Forms, Excel Files, Google Sheets',
  'Assmnt': 'Assessments/Benchmarks/Tests/Quizzes',
  'Plan': 'Lesson Plans',
  'Doc': 'Worksheets, Annotations, Activities',
  'Med': 'Audiovisual files',
  'Guide': 'Guides/Instructions'
};

const ROOT_FOLDERS = {
  'Math_': { id: 'M', name: '33_Maths', subfolder: true },
  'Sci_': { id: 'S', name: '34_Sciences', subfolder: true },
  'SS_': { id: 'SS', name: '35_SocialStudies', subfolder: true },
  'Fren_': { id: 'F', name: '36_French', subfolder: true },
  'Temp_': { id: 'T', name: '01_Templates', subfolder: false },
  'Proj_': { id: 'P', name: '02_Projects', subfolder: true },
  'Admin_': { id: 'A', name: '30_Administration', subfolder: true },
  'Comm_': { id: 'C', name: '33_Communications', subfolder: false },
  'Data_': { id: 'N', name: '31_Data', subfolder: true }
};

// ============================================================================
// PUBLIC FUNCTIONS (called from UI)
// ============================================================================

function getInboxFiles(inboxFolderId) {
  try {
    validateFolderId(inboxFolderId);
    const folder = DriveApp.getFolderById(inboxFolderId);
    const files = [];
    const fileIterator = folder.getFiles();
    
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      if (file.isTrashed()) continue;
      
      files.push({
        id: file.getId(),
        name: file.getName(),
        size: file.getSize(),
        mimeType: file.getMimeType(),
        createdDate: file.getDateCreated()
      });
    }
    
    logOperation('INFO', 'getInboxFiles', `Retrieved ${files.length} files from inbox`, {
      inboxFolder: maskFolderId(inboxFolderId),
      fileCount: files.length
    });
    
    return files;
    
  } catch (error) {
    logOperation('ERROR', 'getInboxFiles', error.message, {
      inboxFolder: maskFolderId(inboxFolderId),
      error: error.stack
    });
    throw error;
  }
}

function processInboxFiles(filesToProcess, config) {
  const startTime = new Date().getTime();
  let processedCount = 0;
  let errorCount = 0;
  const results = [];
  
  try {
    validateProcessConfig(config);
    
    logOperation('START', 'processInboxFiles', 'Starting batch file processing', {
      fileCount: filesToProcess.length,
      rootPrefix: config.rootPrefix,
      fileType: config.fileType
    });
    
    for (let i = 0; i < filesToProcess.length; i++) {
      if (new Date().getTime() - startTime > CONFIG.MAX_EXECUTION_TIME) {
        throw new Error('Script execution timeout reached');
      }
      
      const fileData = filesToProcess[i];
      const result = processFile(fileData, config);
      
      results.push(result);
      if (result.success) processedCount++;
      else errorCount++;
    }
    
    logOperation('COMPLETE', 'processInboxFiles', 
      `Processed ${processedCount} files, ${errorCount} errors`,
      { processed: processedCount, errors: errorCount }
    );
    
    return {
      success: errorCount === 0,
      processed: processedCount,
      errors: errorCount,
      results: results
    };
    
  } catch (error) {
    logOperation('ERROR', 'processInboxFiles', error.message, {
      processed: processedCount,
      error: error.stack
    });
    
    return {
      success: false,
      error: error.message,
      processed: processedCount,
      results: results
    };
  }
}

// ============================================================================
// FILE PROCESSING LOGIC
// ============================================================================

function processFile(fileData, config) {
  const result = {
    fileId: fileData.id,
    originalName: fileData.name,
    success: false,
    newName: null,
    destination: null,
    message: ''
  };
  
  try {
    const file = DriveApp.getFileById(fileData.id);
    const newName = generateNewFilename(fileData.name, config);
    result.newName = newName;
    
    if (!isValidFilename(newName)) {
      throw new Error(`Invalid generated filename: ${newName}`);
    }
    
    if (CONFIG.SANDBOX_MODE) {
      logOperation('SANDBOX', 'processFile', `Would rename: ${fileData.name} → ${newName}`, {
        fileId: maskFileId(fileData.id),
        oldName: fileData.name,
        newName: newName
      });
      result.success = true;
      result.message = 'SANDBOX: File would be renamed (no actual changes made)';
      return result;
    }
    
    file.setName(newName);
    
    if (config.destFolderId) {
      const destFolder = DriveApp.getFolderById(config.destFolderId);
      const oldParent = file.getParents().next();
      destFolder.addFile(file);
      oldParent.removeFile(file);
      result.destination = maskFolderId(config.destFolderId);
    }
    
    result.success = true;
    result.message = 'File successfully processed';
    
    logOperation('SUCCESS', 'processFile', `Renamed: ${fileData.name} → ${newName}`, {
      fileId: maskFileId(fileData.id),
      oldName: fileData.name,
      newName: newName,
      movedTo: result.destination
    });
    
  } catch (error) {
    result.success = false;
    result.message = error.message;
    
    logOperation('ERROR', 'processFile', error.message, {
      fileId: maskFileId(fileData.id),
      originalName: fileData.name,
      error: error.stack
    });
  }
  
  return result;
}

function generateNewFilename(originalName, config) {
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  const today = new Date().toISOString().split('T')[0];
  const description = config.description.replace(/[^A-Za-z0-9]/g, '');
  
  if (!description) {
    throw new Error('Description must contain alphanumeric characters');
  }
  
  // NEW SIMPLIFIED PATTERN: Description_Root_FileType_YYYY-MM-DD
  const newName = description + '_' + config.rootPrefix + '_' + config.fileType + '_' + today + ext;
  return newName;
}

function isValidFilename(filename) {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  return CONFIG.NAMING_PATTERN.test(nameWithoutExt + '.txt');
}

// ============================================================================
// LOGGING & AUDIT TRAIL
// ============================================================================

function logOperation(level, functionName, message, details = {}) {
  try {
    const timestamp = new Date().toISOString();
    const userId = maskEmail(Session.getEffectiveUser().getEmail());
    
    const logEntry = [
      timestamp,
      level,
      functionName,
      message,
      userId,
      JSON.stringify(details)
    ];
    
    appendToLoggingSheet(logEntry);
    
    const logColor = level === 'ERROR' ? '🔴' : level === 'SUCCESS' ? '🟢' : '🔵';
    Logger.log(`${logColor} [${level}] ${functionName}: ${message}`);
    
  } catch (error) {
    Logger.log(`LOGGING_ERROR: ${error.message}`);
  }
}

function appendToLoggingSheet(logEntry) {
  try {
    if (!CONFIG.LOGGING_SHEET_ID) {
      Logger.log('Warning: LOGGING_SHEET_ID not configured in Script Properties');
      return;
    }
    
    const sheet = SpreadsheetApp.openById(CONFIG.LOGGING_SHEET_ID)
      .getSheetByName('Operations Log') || 
      SpreadsheetApp.openById(CONFIG.LOGGING_SHEET_ID).getSheets()[0];
    
    if (sheet) {
      sheet.appendRow(logEntry);
    }
    
  } catch (error) {
    Logger.log(`Cannot write to logging sheet: ${error.message}`);
  }
}

// ============================================================================
// SECURITY & VALIDATION
// ============================================================================

function validateFolderId(folderId) {
  if (!folderId || typeof folderId !== 'string' || folderId.trim().length === 0) {
    throw new Error('Invalid folder ID: must be a non-empty string');
  }
  
  if (folderId.length < 20) {
    throw new Error('Folder ID appears invalid (too short)');
  }
}

function validateProcessConfig(config) {
  const required = ['rootPrefix', 'fileType', 'description'];
  
  for (const field of required) {
    if (!config[field] || typeof config[field] !== 'string') {
      throw new Error(`Invalid config: missing or invalid '${field}'`);
    }
    
    if (config[field].trim().length === 0) {
      throw new Error(`Invalid config: '${field}' cannot be empty`);
    }
  }
  
  if (!ROOT_FOLDERS[config.rootPrefix]) {
    throw new Error(`Invalid rootPrefix: ${config.rootPrefix}`);
  }
  
  if (!FILE_TYPE_CODES[config.fileType]) {
    throw new Error(`Invalid fileType: ${config.fileType}`);
  }
  
  if (!/^[A-Za-z0-9]+$/.test(config.description.replace(/\s/g, ''))) {
    throw new Error('Description must contain only alphanumeric characters');
  }
}

function maskFolderId(folderId) {
  if (!folderId) return '[NO_ID]';
  const str = String(folderId);
  return str.substring(0, 4) + '...' + str.substring(str.length - 4);
}

function maskFileId(fileId) {
  if (!fileId) return '[NO_ID]';
  const str = String(fileId);
  return str.substring(0, 4) + '...' + str.substring(str.length - 4);
}

function maskEmail(email) {
  if (!email) return '[UNKNOWN]';
  const [user, domain] = email.split('@');
  return user.substring(0, 1) + '***@' + domain;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getModuleCodesBySubject(rootPrefix) {
  const moduleCodes = {
    'Math_': ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
    'Sci_': ['U1', 'U2', 'U3'],
    'SS_': ['U1', 'U2', 'U3', 'U4', 'U5'],
  };
  
  return moduleCodes[rootPrefix] || [];
}

function verifyConfiguration() {
  Logger.log('=== Configuration Verification ===');
  Logger.log('LOGGING_SHEET_ID: ' + (CONFIG.LOGGING_SHEET_ID ? 'SET ✓' : 'MISSING ✗'));
  Logger.log('SANDBOX_MODE: ' + (CONFIG.SANDBOX_MODE ? 'ON' : 'OFF'));
  Logger.log('MAX_EXECUTION_TIME: ' + (CONFIG.MAX_EXECUTION_TIME / 1000) + 's');
  Logger.log('File Type Codes Loaded: ' + Object.keys(FILE_TYPE_CODES).length);
  Logger.log('Root Folders Loaded: ' + Object.keys(ROOT_FOLDERS).length);
  
  if (!CONFIG.LOGGING_SHEET_ID) {
    Logger.log('\n⚠️  ACTION REQUIRED: Set LOGGING_SHEET_ID in Project Settings');
  }
}

function testScript() {
  Logger.log('🧪 Testing Inbox File Processor');
  
  verifyConfiguration();
  
  const testConfig = {
    rootPrefix: 'Math_',
    fileType: 'LP_',
    description: 'TestLesson'
  };
  
  const testFilename = generateNewFilename('test_file.docx', testConfig);
  Logger.log('Generated test filename: ' + testFilename);
  Logger.log('Is valid: ' + isValidFilename(testFilename));
  
  Logger.log('Masked ID test: ' + maskFolderId('1234567890abcdefghijklmnop'));
  Logger.log('Masked email test: ' + maskEmail('cary.teacher@example.com'));
}
