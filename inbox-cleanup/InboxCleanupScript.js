/**
 * =====================================================
 * FLAIM INBOX CLEANUP SCRIPT
 * =====================================================
 * 
 * PURPOSE: Automatically cleans up 00_WorkInbox by:
 *   1. Deleting junk/duplicate files
 *   2. Renaming files to naming convention
 *   3. Moving files to correct folders
 * 
 * HOW TO USE:
 *   1. Open Google Drive
 *   2. Go to: drive.google.com
 *   3. Click: New → More → Google Apps Script
 *   4. Delete any existing code
 *   5. Paste this entire script
 *   6. Click: Save (Ctrl+S)
 *   7. Click: Run → Select "runFullCleanup"
 *   8. Grant permissions when prompted
 *   9. Check the Execution Log for progress
 * 
 * SAFETY: 
 *   - Files are moved to Trash (not permanently deleted)
 *   - You can recover from Trash within 30 days
 *   - Run "previewChanges" first to see what will happen
 * 
 * Created: January 20, 2026
 * For: Cary Hebert - BR FLAIM
 */

// =====================================================
// CONFIGURATION - Update these paths to match your Drive
// =====================================================

const CONFIG = {
  // Source folder (your inbox)
  INBOX_PATH: 'MyWorkDrive/00_WorkInbox',
  
  // Destination folders
  FOLDERS: {
    MATH: 'MyWorkDrive/33_Math',
    MATH_M2: 'MyWorkDrive/33_Math/Math_M2',
    MATH_M3: 'MyWorkDrive/33_Math/Math_M3',
    MATH_M4: 'MyWorkDrive/33_Math/Math_M4',
    SCIENCE: 'MyWorkDrive/34_Sciences',
    SOCIAL_STUDIES: 'MyWorkDrive/35_SocialStudies',
    FRENCH: 'MyWorkDrive/36_French',
    COMMUNICATION: 'MyWorkDrive/32_Communication',
    ADMIN: 'MyWorkDrive/30_Administrative',
    ADMIN_RECORDS: 'MyWorkDrive/30_Administrative/Admin_ReferenceRecords',
    TEMPLATES: 'MyWorkDrive/01_Templates',
    PROJECTS: 'MyWorkDrive/02_Projects',
    ARCHIVE: 'MyWorkDrive/99_Archive'
  },
  
  // Set to true to actually make changes, false for preview only
  EXECUTE_CHANGES: false,  // START WITH FALSE TO PREVIEW!
  
  // Logging
  LOG_SHEET_NAME: 'Cleanup Log'
};

// =====================================================
// FILES TO DELETE (Junk, duplicates, temp files)
// =====================================================

const FILES_TO_DELETE = [
  // Duplicates
  '15-2025.11.19 M3.B.L10 annotated (1).pdf',
  '17-2025.12.8 M3.E.L21-L26 Topic E Ticket LP (1) (1).docx',
  '17-2025.12.8 M3.E.L21-L26 Topic E Ticket LP (1).docx',
  'Gemini_Generated_Image_ui43uvui43uvui43 (1).png',
  'Gemini_Generated_Image_v4ea3mv4ea3mv4ea (1).png',
  'Gemini_Generated_Image_yc0ykbyc0ykbyc0y (1).png',
  'Baton Rouge FLAIM Positive Behavior Expectations (1).pdf',
  'Scanned Dec 11, 2025 at 13_51_56 (1).pdf',
  'News_Corr__2026-01-06_Doc_Hebert.pdf',
  'News-Oct 13 2.docx',
  'Copy of PBIS Expectations.pdf',
  'Journal du matin HEBERT copie.flipchart',
  'Tmplt_Lib_Doc_MeetingNotes.md.txt',
  
  // System/Junk
  'OneDriveSetup.exe',
  'text.txt',
  '715.pdf',
  'ACFROG~1.PDF',
  
  // Old downloads
  'drive-download-20260105T220831Z-1-001.zip',
  'drive-download-20260106T220621Z-1-001.zip',
  
  // Gemini images
  'Gemini_Generated_Image_14rppk14rppk14rp.png',
  'Gemini_Generated_Image_db79qwdb79qwdb79.png',
  'Gemini_Generated_Image_dl0ibedl0ibedl0i.png',
  'Gemini_Generated_Image_ezm2yeezm2yeezm2.png',
  'Gemini_Generated_Image_midqthmidqthmidq.png',
  'Gemini_Generated_Image_muommvmuommvmuom.png',
  'Gemini_Generated_Image_se2bn2se2bn2se2b.png',
  'Gemini_Generated_Image_ui43uvui43uvui43.png',
  'Gemini_Generated_Image_v4ea3mv4ea3mv4ea.png',
  'Gemini_Generated_Image_yc0ykbyc0ykbyc0y.png',
  
  // LA Coloring Book images
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-0.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-1.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-2.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-3.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-4.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-5.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-6.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-7.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-8.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-9.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-10.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-11.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-12.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-13.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-14.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-15.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-16.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-17.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-18.jpg',
  'REVISEDLA Coloring Book ALLstraightwithbleeds (13)-images-19.jpg',
  
  // Screenshots
  'Screenshot 2025-12-11 143354.png',
  'Screenshot 2025-12-19 110936.png',
  'Screenshot 2025-12-19 111114.png',
  'Screenshot 2026-01-16 at 08.22.35.png',
  'download.png',
  'page_1.png',
  
  // Old files
  'Conduct chart dec 8 2025.pub',
  'conduct chart.jpg',
  '100th day poster project letter with rubric.doc'
];

// =====================================================
// RENAME MAPPING: Current Name → New Name + Destination
// =====================================================

const RENAME_MAP = [
  // ===== MATH FILES =====
  {
    oldName: '1 Oct 2025 M2.B.L6.pdf',
    newName: '08-M2TBL6_Math_Annot_2025-10-01.pdf',
    destination: 'MATH_M2'
  },
  {
    oldName: '2025.9.30 M2.B.L5 Annotation.pdf',
    newName: '08-M2TBL5_Math_Annot_2025-09-30.pdf',
    destination: 'MATH_M2'
  },
  {
    oldName: '2025.10.1 M2.B.L6 Annotation.pdf',
    newName: '08-M2TBL6_Math_Annot_2025-10-01.pdf',
    destination: 'MATH_M2'
  },
  {
    oldName: '2025.10.3 M2.B.L7 Annotation & Topic Ticket.pdf',
    newName: '08-M2TBL7_Math_Annot_2025-10-03.pdf',
    destination: 'MATH_M2'
  },
  {
    oldName: '2025.10.13 M2.C.L14-17 LP.docx',
    newName: '10-M2TCL14-17_Math_LP_2025-10-13.docx',
    destination: 'MATH_M2'
  },
  {
    oldName: '2025.10.27 M2.E.L20-23 Topic E Ticket LP.docx',
    newName: '12-M2TEL20-23_Math_LP_2025-10-27.docx',
    destination: 'MATH_M2'
  },
  {
    oldName: '15-2025.11.17 M3.B.L9 annotated.pdf',
    newName: '15-M3TBL9_Math_Annot_2025-11-17.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '15-2025.11.19 M3.B.L10 annotated.pdf',
    newName: '15-M3TBL10_Math_Annot_2025-11-19.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '16-2025.12.2 M3.C.L12 annotated.pdf',
    newName: '16-M3TCL12_Math_Annot_2025-12-02.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '16-2025.12.4 M3.D.L16 annotated .pdf',
    newName: '16-M3TDL16_Math_Annot_2025-12-04.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '16-2025.12.5 M3.D.L17 annotated.pdf',
    newName: '16-M3TDL17_Math_Annot_2025-12-05.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '17-2025-12-19_M3_E_L18_annotated.pdf',
    newName: '17-M3TEL18_Math_Annot_2025-12-19.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '17-2025-12-19_M3_E_L20_annotated.pdf',
    newName: '17-M3TEL20_Math_Annot_2025-12-19.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '17-2025-12-19_M3_E_L21_annotate.pdf',
    newName: '17-M3TEL21_Math_Annot_2025-12-19.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '17-2025.12.8 M3.D.L18-E.L22 LP.docx',
    newName: '17-M3TDL18-TEL22_Math_LP_2025-12-08.docx',
    destination: 'MATH_M3'
  },
  {
    oldName: '17-2025.12.8 M3.E.L21-L26 Topic E Ticket LP.docx',
    newName: '17-M3TEL21-26_Math_LP_2025-12-08.docx',
    destination: 'MATH_M3'
  },
  {
    oldName: '17-2025.12.15 M3.E.L22-26 End of Module 3 LP annotated.docx',
    newName: '17-M3TEL22-26_Math_LP_2025-12-15.docx',
    destination: 'MATH_M3'
  },
  {
    oldName: '18-2025-12-19_M3_E_L22_annotated.pdf',
    newName: '18-M3TEL22_Math_Annot_2025-12-19.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: '20-M4TBL09_Math_Guide_2026-01-16.pdf',
    newName: '20-M4TBL9_Math_Guide_2026-01-16.pdf',
    destination: 'MATH_M4'
  },
  {
    oldName: 'Math_LP_2026-01-19_Draft',
    newName: '21-M4_Math_LP_2026-01-19.docx',
    destination: 'MATH_M4'
  },
  {
    oldName: 'Module 3 Achievement Descriptors.pdf',
    newName: '00-M3AchievementDescriptors_Math_Guide_2025-08-01.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: 'Module 3 Standards.pdf',
    newName: '00-M3Standards_Math_Guide_2025-08-01.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: 'Copy of Grade 1 Week 18 Lesson Plans.docx',
    newName: '18-G1WeeklyLP_Math_LP_2025-12-15.docx',
    destination: 'MATH'
  },
  {
    oldName: 'Grade 1 Week 17 Lesson Plans.docx',
    newName: '17-G1WeeklyLP_Math_LP_2025-12-08.docx',
    destination: 'MATH'
  },
  {
    oldName: 'EOM2Benchmark_Data.xlsx',
    newName: '00-M2EndOfModuleBenchmark_Math_Sheet_2025-10-09.xlsx',
    destination: 'MATH_M2'
  },
  {
    oldName: 'EOM3.pdf',
    newName: '00-M3EndOfModuleAssmnt_Math_Assmnt_2025-12-18.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: 'EOM3Benchmark_Data.xlsx',
    newName: '00-M3EndOfModuleBenchmark_Math_Sheet_2025-12-18.xlsx',
    destination: 'MATH_M3'
  },
  {
    oldName: 'EOM3Rubric.pdf',
    newName: '00-M3EndOfModuleRubric_Math_Assmnt_2025-12-18.pdf',
    destination: 'MATH_M3'
  },
  {
    oldName: 'K Standards & G1 Standards correspondances.pdf',
    newName: '00-KG1StandardsCorrespondance_Math_Guide_2025-08-01.pdf',
    destination: 'MATH'
  },
  
  // ===== SCIENCE FILES =====
  {
    oldName: '21-U2C3SoundVibrations_Sci_LP_2026-01-20.docx',
    newName: '21-U2C3SoundVibrations_Sci_LP_2026-01-20.docx',
    destination: 'SCIENCE'
  },
  
  // ===== SOCIAL STUDIES FILES =====
  {
    oldName: '21-UC7Culture_SS_LP_2026-01–19.pdf',
    newName: '21-U1C7Culture_SS_LP_2026-01-19.pdf',
    destination: 'SOCIAL_STUDIES'
  },
  {
    oldName: 'DEC 8 Social studies.docx',
    newName: '17-U1C5_SS_LP_2025-12-08.docx',
    destination: 'SOCIAL_STUDIES'
  },
  {
    oldName: 'LP JAN 7 Social studies.docx',
    newName: '19-U1C6_SS_LP_2026-01-07.docx',
    destination: 'SOCIAL_STUDIES'
  },
  {
    oldName: 'LP JAN 12 Social studies.docx',
    newName: '20-U1C6_SS_LP_2026-01-12.docx',
    destination: 'SOCIAL_STUDIES'
  },
  {
    oldName: 'LP JAN 19 Social studies.docx',
    newName: '21-U1C7_SS_LP_2026-01-19.docx',
    destination: 'SOCIAL_STUDIES'
  },
  {
    oldName: 'LP JAN 26 Social studies.docx',
    newName: '22-U1C7_SS_LP_2026-01-26.docx',
    destination: 'SOCIAL_STUDIES'
  },
  
  // ===== FRENCH FILES =====
  {
    oldName: '16-Chanson pour Noël Danser autour du sapin vert PAROLES.docx',
    newName: '16-NoelChansonParoles_Fren_Doc_2025-12-01.docx',
    destination: 'FRENCH'
  },
  {
    oldName: '17-Noel 2 LP.docx',
    newName: '17-Noel2_Fren_LP_2025-12-08.docx',
    destination: 'FRENCH'
  },
  {
    oldName: '19-les comparaisons 1 LP.docx',
    newName: '19-Comparaisons1_Fren_LP_2026-01-05.docx',
    destination: 'FRENCH'
  },
  {
    oldName: 'Journal du matin 1 CJH.flipchart',
    newName: '00-JournalDuMatin1_Fren_Pres_2025-08-01.flipchart',
    destination: 'FRENCH'
  },
  {
    oldName: 'Journal du matin CJH 2022.flipchart',
    newName: '00-JournalDuMatin2022_Fren_Pres_2022-08-01.flipchart',
    destination: 'FRENCH'
  },
  {
    oldName: 'Journal du matin HEBERT.flipchart',
    newName: '00-JournalDuMatinHebert_Fren_Pres_2025-08-01.flipchart',
    destination: 'FRENCH'
  },
  {
    oldName: 'Joyeux_Noel_2025.docx',
    newName: '18-JoyeuxNoel_Fren_Doc_2025-12-19.docx',
    destination: 'FRENCH'
  },
  {
    oldName: 'TalkingTool_French_Res_2026-01-13.gdoc',
    newName: '20-TalkingTool_Fren_Guide_2026-01-13.gdoc',
    destination: 'FRENCH'
  },
  
  // ===== COMMUNICATION - NEWSLETTERS =====
  {
    oldName: 'News-Sept 15.docx',
    newName: '06-WeeklyNewsletter_News_2025-09-15.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News-Sept 22.docx',
    newName: '07-WeeklyNewsletter_News_2025-09-22.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News-Sept 29.docx',
    newName: '08-WeeklyNewsletter_News_2025-09-29.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News-Oct 6.docx',
    newName: '09-WeeklyNewsletter_News_2025-10-06.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News-Oct 13.docx',
    newName: '10-WeeklyNewsletter_News_2025-10-13.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News-Oct. 20.docx',
    newName: '11-WeeklyNewsletter_News_2025-10-20.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News-Oct 27.docx',
    newName: '12-WeeklyNewsletter_News_2025-10-27.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'Current 2025 Crifasi Class Newsletter.pptx.pptx.pdf',
    newName: '00-NewsletterTemplate_News_2025-08-01.pdf',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'News_Corr_2026-01-06_Doc_Hebert.docx',
    newName: '19-WeeklyNewsletter_News_2026-01-06.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'Jan.12-16.docx',
    newName: '20-WeeklyNewsletter_News_2026-01-12.docx',
    destination: 'COMMUNICATION'
  },
  
  // ===== COMMUNICATION - CORRESPONDENCE =====
  {
    oldName: '100DayProject_Comm_Letter_2026-01-12.docx',
    newName: '20-100DayProject_Corr_2026-01-12.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'LaliloInvitationEleve_Comm_2026-01-08.pdf',
    newName: '19-LaliloInvitationEleve_Corr_2026-01-08.pdf',
    destination: 'COMMUNICATION'
  },
  {
    oldName: '20-SneakerBallFlyer_Comm_2026-01-16',
    newName: '20-SneakerBallFlyer_Corr_2026-01-16.pdf',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'Food Drive Announcment.pdf',
    newName: '00-FoodDriveAnnouncement_Corr_2025-11-01.pdf',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'Red Green and Blue Playful Christmas Festival Invitation.pdf',
    newName: '18-ChristmasFestivalInvitation_Corr_2025-12-15.pdf',
    destination: 'COMMUNICATION'
  },
  {
    oldName: '2026 International Festival Guidelines and Timelines.docx',
    newName: '00-InternationalFestivalGuidelines_Corr_2026-01-01.docx',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'ZearnMardiGrasChallengeStudentLessonTracker.pdf',
    newName: '25-ZearnMardiGrasChallenge_Corr_2026-02-16.pdf',
    destination: 'COMMUNICATION'
  },
  {
    oldName: 'W20-ConductHebert_Comm_Pres_2026-01-15.gslides',
    newName: '20-ConductHebert_Corr_2026-01-15.gslides',
    destination: 'COMMUNICATION'
  },
  
  // ===== ADMIN FILES =====
  {
    oldName: 'Certificate of Completion for Bullying_ Recognition and Response (Microlearning Course).pdf',
    newName: 'SafeSchCert-BullyingRecognition_Admin_Rec_2025-12-01.pdf',
    destination: 'ADMIN_RECORDS'
  },
  {
    oldName: 'Certificate of Completion for Child Abuse_ Identification & Intervention (Microlearning Course).pdf',
    newName: 'SafeSchCert-ChildAbuseIdentification_Admin_Rec_2025-12-01.pdf',
    destination: 'ADMIN_RECORDS'
  },
  {
    oldName: 'Certificate of Completion for Child Abuse_ Mandatory Reporting (Refresher).pdf',
    newName: 'SafeSchCert-ChildAbuseMandatoryReporting_Admin_Rec_2025-12-01.pdf',
    destination: 'ADMIN_RECORDS'
  },
  {
    oldName: 'Certificate of Completion for Sexual Misconduct_ Staff-to-Student (Microlearning Course).pdf',
    newName: 'SafeSchCert-SexualMisconductStaffStudent_Admin_Rec_2025-12-01.pdf',
    destination: 'ADMIN_RECORDS'
  },
  {
    oldName: 'Child Abuse Mandatory Reporting Certificate.pdf',
    newName: 'SafeSchCert-ChildAbuseMandatoryReportingFull_Admin_Rec_2025-12-01.pdf',
    destination: 'ADMIN_RECORDS'
  },
  {
    oldName: 'Baton Rouge FLAIM Positive Behavior Expectations.pdf',
    newName: '00-FLAIMPBISExpectations_Admin_Guide_2025-08-01.pdf',
    destination: 'ADMIN'
  },
  {
    oldName: 'ChristmasMoviePBIS_Admin_Pres_2025-12-17.pptx',
    newName: 'ChristmasMoviePBIS_Admin_Pres_2025-12-17.pptx',
    destination: 'ADMIN'
  },
  {
    oldName: 'HealthCard.PDF',
    newName: '00-HealthCard_Admin_Rec_2025-08-01.pdf',
    destination: 'ADMIN_RECORDS'
  },
  
  // ===== TEMPLATE FILES =====
  {
    oldName: '03_02_00_SubFolder_EmergencyLP_HEBERT.docx',
    newName: 'Tmplt_Admin_Doc_EmergencySubLP.docx',
    destination: 'TEMPLATES'
  },
  {
    oldName: 'Tmplt_Guide_Doc_OrlandoFont.docx',
    newName: 'Tmplt_Guide_Doc_OrlandoFont.docx',
    destination: 'TEMPLATES'
  },
  {
    oldName: 'Tmplt_Guide_Doc_OrlandoFont.pdf',
    newName: 'Tmplt_Guide_Doc_OrlandoFont.pdf',
    destination: 'TEMPLATES'
  },
  {
    oldName: 'Tmplt_Lib_Doc_MeetingNotes.md',
    newName: 'Tmplt_Lib_Doc_MeetingNotes.md',
    destination: 'TEMPLATES'
  },
  {
    oldName: 'Template_PBIS_Conduite.pub',
    newName: 'Tmplt_Admin_Form_PBISConduct.pub',
    destination: 'TEMPLATES'
  },
  {
    oldName: 'Temp_Prod_SystemPromptGenerator_Doc.docx',
    newName: 'Tmplt_Proj_Doc_SystemPromptGenerator.docx',
    destination: 'TEMPLATES'
  },
  
  // ===== PROJECT FILES =====
  {
    oldName: 'FLAIM_OperationsDashboard_v2.gscript',
    newName: 'Proj_FileOrg_Code_OperationsDashboard_2026-01-15.gscript',
    destination: 'PROJECTS'
  },
  {
    oldName: 'FilenamingMasterDatabase.gsheet',
    newName: 'Proj_FileOrg_Sheet_FilenamingMasterDB_2026-01-15.gsheet',
    destination: 'PROJECTS'
  },
  
  // ===== 100TH DAY FILES =====
  {
    oldName: '100thDayPoster.pdf',
    newName: '20-100thDayPoster_Corr_2026-01-12.pdf',
    destination: 'COMMUNICATION'
  }
];


// =====================================================
// MAIN FUNCTIONS
// =====================================================

/**
 * PREVIEW MODE - Run this first!
 * Shows what will happen without making changes
 */
function previewChanges() {
  CONFIG.EXECUTE_CHANGES = false;
  runFullCleanup();
}

/**
 * EXECUTE MODE - Run after preview looks good
 * Actually makes the changes
 */
function executeChanges() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ Confirm Cleanup',
    'This will DELETE files and RENAME/MOVE files in your inbox.\n\n' +
    'Files are moved to Trash (recoverable for 30 days).\n\n' +
    'Did you run previewChanges() first?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    CONFIG.EXECUTE_CHANGES = true;
    runFullCleanup();
  }
}

/**
 * Main cleanup function
 */
function runFullCleanup() {
  const startTime = new Date();
  
  Logger.log('=====================================================');
  Logger.log('FLAIM INBOX CLEANUP - ' + (CONFIG.EXECUTE_CHANGES ? 'EXECUTE MODE' : 'PREVIEW MODE'));
  Logger.log('Started: ' + startTime.toLocaleString());
  Logger.log('=====================================================\n');
  
  // Get inbox folder
  const inboxFolder = getFolderByPath(CONFIG.INBOX_PATH);
  if (!inboxFolder) {
    Logger.log('❌ ERROR: Could not find inbox folder at: ' + CONFIG.INBOX_PATH);
    return;
  }
  
  Logger.log('📂 Found inbox folder: ' + inboxFolder.getName());
  Logger.log('   Files in inbox: ' + inboxFolder.getFiles().hasNext());
  Logger.log('');
  
  // Step 1: Delete junk files
  Logger.log('=== STEP 1: DELETE JUNK FILES ===\n');
  const deleteResults = deleteJunkFiles(inboxFolder);
  
  // Step 2: Rename and move files
  Logger.log('\n=== STEP 2: RENAME & MOVE FILES ===\n');
  const renameResults = renameAndMoveFiles(inboxFolder);
  
  // Summary
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  Logger.log('\n=====================================================');
  Logger.log('CLEANUP COMPLETE');
  Logger.log('=====================================================');
  Logger.log('Mode: ' + (CONFIG.EXECUTE_CHANGES ? 'EXECUTED' : 'PREVIEW ONLY'));
  Logger.log('Duration: ' + duration + ' seconds');
  Logger.log('');
  Logger.log('DELETE RESULTS:');
  Logger.log('  - Files found: ' + deleteResults.found);
  Logger.log('  - Files deleted: ' + deleteResults.deleted);
  Logger.log('  - Files not found: ' + deleteResults.notFound);
  Logger.log('');
  Logger.log('RENAME RESULTS:');
  Logger.log('  - Files found: ' + renameResults.found);
  Logger.log('  - Files renamed/moved: ' + renameResults.processed);
  Logger.log('  - Files not found: ' + renameResults.notFound);
  Logger.log('  - Errors: ' + renameResults.errors);
  Logger.log('=====================================================');
  
  if (!CONFIG.EXECUTE_CHANGES) {
    Logger.log('\n⚠️ This was PREVIEW MODE. No changes were made.');
    Logger.log('To execute changes, run: executeChanges()');
  }
}


// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Deletes files in the delete list
 */
function deleteJunkFiles(inboxFolder) {
  const results = { found: 0, deleted: 0, notFound: 0 };
  
  for (const fileName of FILES_TO_DELETE) {
    const files = inboxFolder.getFilesByName(fileName);
    
    if (files.hasNext()) {
      const file = files.next();
      results.found++;
      
      if (CONFIG.EXECUTE_CHANGES) {
        file.setTrashed(true);
        Logger.log('🗑️ DELETED: ' + fileName);
        results.deleted++;
      } else {
        Logger.log('🗑️ [PREVIEW] Would delete: ' + fileName);
      }
    } else {
      results.notFound++;
      // Only log if we're in verbose mode
      // Logger.log('   ⚪ Not found: ' + fileName);
    }
  }
  
  Logger.log('\nDelete summary: Found ' + results.found + ' of ' + FILES_TO_DELETE.length + ' files to delete');
  
  return results;
}

/**
 * Renames and moves files according to the mapping
 */
function renameAndMoveFiles(inboxFolder) {
  const results = { found: 0, processed: 0, notFound: 0, errors: 0 };
  
  // Cache destination folders
  const folderCache = {};
  
  for (const mapping of RENAME_MAP) {
    const files = inboxFolder.getFilesByName(mapping.oldName);
    
    if (files.hasNext()) {
      const file = files.next();
      results.found++;
      
      try {
        // Get destination folder
        let destFolder = folderCache[mapping.destination];
        if (!destFolder) {
          const destPath = CONFIG.FOLDERS[mapping.destination];
          destFolder = getFolderByPath(destPath);
          if (destFolder) {
            folderCache[mapping.destination] = destFolder;
          }
        }
        
        if (!destFolder) {
          Logger.log('❌ ERROR: Destination folder not found: ' + mapping.destination);
          results.errors++;
          continue;
        }
        
        if (CONFIG.EXECUTE_CHANGES) {
          // Rename file
          file.setName(mapping.newName);
          
          // Move to destination
          file.moveTo(destFolder);
          
          Logger.log('✅ PROCESSED: ' + mapping.oldName);
          Logger.log('   → Renamed to: ' + mapping.newName);
          Logger.log('   → Moved to: ' + mapping.destination);
          results.processed++;
        } else {
          Logger.log('📝 [PREVIEW] ' + mapping.oldName);
          Logger.log('   → Would rename to: ' + mapping.newName);
          Logger.log('   → Would move to: ' + mapping.destination);
        }
        
      } catch (error) {
        Logger.log('❌ ERROR processing ' + mapping.oldName + ': ' + error.message);
        results.errors++;
      }
      
    } else {
      results.notFound++;
      // Only log if verbose
      // Logger.log('   ⚪ Not found: ' + mapping.oldName);
    }
  }
  
  Logger.log('\nRename summary: Found ' + results.found + ' of ' + RENAME_MAP.length + ' files to process');
  
  return results;
}

/**
 * Gets a folder by path (e.g., "MyWorkDrive/33_Math/Math_M3")
 */
function getFolderByPath(path) {
  const parts = path.split('/');
  let folder = DriveApp.getRootFolder();
  
  for (const part of parts) {
    const folders = folder.getFoldersByName(part);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      Logger.log('⚠️ Folder not found: ' + part + ' in path: ' + path);
      return null;
    }
  }
  
  return folder;
}

/**
 * Creates a log sheet in the active spreadsheet
 */
function createLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Action', 'Old Name', 'New Name', 'Destination', 'Status']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  
  return sheet;
}


// =====================================================
// MENU SETUP
// =====================================================

/**
 * Adds menu to spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📥 Inbox Cleanup')
    .addItem('👀 Preview Changes', 'previewChanges')
    .addItem('🚀 Execute Changes', 'executeChanges')
    .addSeparator()
    .addItem('📊 View Inbox Files', 'listInboxFiles')
    .addToUi();
}

/**
 * Lists all files in inbox (for reference)
 */
function listInboxFiles() {
  const inboxFolder = getFolderByPath(CONFIG.INBOX_PATH);
  if (!inboxFolder) {
    Logger.log('Could not find inbox folder');
    return;
  }
  
  const files = inboxFolder.getFiles();
  let count = 0;
  
  Logger.log('Files in ' + CONFIG.INBOX_PATH + ':');
  Logger.log('');
  
  while (files.hasNext()) {
    const file = files.next();
    Logger.log((count + 1) + '. ' + file.getName());
    count++;
  }
  
  Logger.log('');
  Logger.log('Total files: ' + count);
}
