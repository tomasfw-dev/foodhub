const fs = require('fs');
const os = require('os');
const path = require('path');
const uploadService = require('../../backend/services/admin/upload.service');

/** PNG 1×1 válido */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('upload.service optimizeImage', () => {
  let tempDir;
  let tempFile;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'foodhub-upload-'));
    tempFile = path.join(tempDir, `test-${Date.now()}.png`);
    fs.writeFileSync(tempFile, Buffer.from(TINY_PNG_BASE64, 'base64'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('optimiza imagen de producto y cambia extensión', async () => {
    const filename = await uploadService.optimizeImage(tempFile, 'productos');
    expect(filename).toMatch(/\.(webp|jpg)$/);
    expect(fs.existsSync(path.join(tempDir, filename))).toBe(true);
  });

  it('optimiza logo con perfil logos', async () => {
    const filename = await uploadService.optimizeImage(tempFile, 'logos');
    expect(filename).toMatch(/\.(webp|png)$/);
  });

  it('rechaza archivo que no es imagen', async () => {
    const badFile = path.join(tempDir, 'bad.jpg');
    fs.writeFileSync(badFile, 'not-an-image');

    await expect(uploadService.optimizeImage(badFile, 'productos')).rejects.toMatchObject({
      status: 400,
      isUploadError: true,
    });
  });
});
