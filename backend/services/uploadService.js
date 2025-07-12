const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Get the public URL for a file
 * @param {string} filename - The filename (not full path)
 * @returns {string} Public URL
 */
const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};

/**
 * Delete a file from uploads
 * @param {string} filename - The filename (not full path)
 */
const deleteFile = (filename) => {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Delete multiple files from uploads
 * @param {string[]} filenames - Array of filenames
 */
const deleteMultipleFiles = (filenames) => {
  filenames.forEach(deleteFile);
};

module.exports = {
  getFileUrl,
  deleteFile,
  deleteMultipleFiles,
  UPLOADS_DIR
}; 