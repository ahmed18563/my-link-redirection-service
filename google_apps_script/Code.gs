// Configuration
const SHEET_NAME = 'LinkRedirects';

// Initialize the spreadsheet when the script is first opened
function doGet() {
  return HtmlService.createHtmlOutput('Link Redirection Service API is running!');
}

// Handle POST requests
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    
    let result;
    
    switch (action) {
      case 'getLinks':
        result = getLinks();
        break;
      case 'getLink':
        result = getLink(request.slug);
        break;
      case 'addLink':
        result = addLink(request.data);
        break;
      case 'deleteLink':
        result = deleteLink(request.id);
        break;
      default:
        result = { success: false, message: 'Invalid action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Initialize the spreadsheet if it doesn't exist
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID', 'Slug', 'Prime Link', 'Expiration Link', 'Expiration Date', 'Created Date']);
    
    // Format headers
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f3f3');
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 6);
  }
  
  return sheet;
}

// Generate a random slug if none is provided
function generateSlug(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Check if a slug already exists
function slugExists(slug) {
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === slug) {
      return true;
    }
  }
  
  return false;
}

// Get all links
function getLinks() {
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  const links = [];
  for (let i = 1; i < data.length; i++) {
    links.push({
      id: data[i][0],
      slug: data[i][1],
      primeLink: data[i][2],
      expirationLink: data[i][3],
      expirationDate: data[i][4],
      createdDate: data[i][5]
    });
  }
  
  return { success: true, data: links };
}

// Get a specific link by slug
function getLink(slug) {
  if (!slug) {
    return { success: false, message: 'Slug is required' };
  }
  
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === slug) {
      return {
        success: true,
        data: {
          id: data[i][0],
          slug: data[i][1],
          primeLink: data[i][2],
          expirationLink: data[i][3],
          expirationDate: data[i][4],
          createdDate: data[i][5]
        }
      };
    }
  }
  
  return { success: false, message: 'Link not found' };
}

// Add a new link
function addLink(linkData) {
  if (!linkData || !linkData.primeLink || !linkData.expirationLink || !linkData.expirationDate) {
    return { success: false, message: 'Missing required fields' };
  }
  
  // Generate or use the provided slug
  let slug = linkData.slug;
  if (!slug) {
    // Generate a unique slug
    do {
      slug = generateSlug();
    } while (slugExists(slug));
  } else if (slugExists(slug)) {
    return { success: false, message: 'Custom slug already exists' };
  }
  
  const sheet = initializeSpreadsheet();
  
  // Generate a unique ID
  const id = Utilities.getUuid();
  
  // Current date
  const now = new Date();
  
  // Add the new link
  sheet.appendRow([
    id,
    slug,
    linkData.primeLink,
    linkData.expirationLink,
    new Date(linkData.expirationDate),
    now
  ]);
  
  return {
    success: true,
    data: {
      id,
      slug,
      primeLink: linkData.primeLink,
      expirationLink: linkData.expirationLink,
      expirationDate: linkData.expirationDate,
      createdDate: now
    }
  };
}

// Delete a link
function deleteLink(id) {
  if (!id) {
    return { success: false, message: 'ID is required' };
  }
  
  const sheet = initializeSpreadsheet();
  const data = sheet.getDataRange().getValues();
  
  // Find the row with the matching ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1); // +1 because rows are 1-indexed
      return { success: true };
    }
  }
  
  return { success: false, message: 'Link not found' };
}
