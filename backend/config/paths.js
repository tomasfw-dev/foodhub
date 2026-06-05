const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const frontendDir = path.join(rootDir, 'frontend');

module.exports = {
  rootDir,
  frontendDir,
  viewsDir: path.join(frontendDir, 'views'),
  publicDir: path.join(frontendDir, 'public'),
  uploadsProductosDir: path.join(frontendDir, 'public', 'uploads', 'productos'),
  uploadsLogosDir: path.join(frontendDir, 'public', 'uploads', 'logos'),
};
