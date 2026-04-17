// Dual Role Logbook — Google Apps Script Backend
// Paste this entire file into script.google.com → New Project

const SHEET_NAME = "Logbook";
const HEADERS = ["Date","Location","Hat worn","Activity summary","Details","Resources used","People present","Follow-up needed","Timestamp","Entry ID"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getOrCreateSheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (data.action === "sync") {
      // Clear existing data below header and rewrite all entries
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      const rows = data.entries.map(entry => [
        entry.date || "",
        entry.location || "",
        entry.hat || "",
        entry.title || "",
        entry.notes || "",
        (entry.resources || []).join(", "),
        entry.people || "",
        entry.followup || "",
        new Date(entry.id).toLocaleString(),
        String(entry.id)
      ]);
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }
      return ContentService
        .createTextOutput(JSON.stringify({ status: "ok", count: rows.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Health check
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Logbook script is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  // Look for an existing logbook spreadsheet in Drive
  const files = DriveApp.getFilesByName("Dual Role Logbook");
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  }
  // Create a new one
  const ss = SpreadsheetApp.create("Dual Role Logbook");
  const sheet = ss.getActiveSheet();
  sheet.setName(SHEET_NAME);
  // Write headers
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  // Format header row
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground("#1a1a18")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
  // Set column widths
  sheet.setColumnWidth(1, 100);  // Date
  sheet.setColumnWidth(2, 160);  // Location
  sheet.setColumnWidth(3, 130);  // Hat
  sheet.setColumnWidth(4, 240);  // Activity
  sheet.setColumnWidth(5, 300);  // Details
  sheet.setColumnWidth(6, 200);  // Resources
  sheet.setColumnWidth(7, 140);  // People
  sheet.setColumnWidth(8, 180);  // Follow-up
  sheet.setColumnWidth(9, 150);  // Timestamp
  sheet.setColumnWidth(10, 120); // Entry ID
  return ss;
}
