/**
 * Helpers compartidos para middlewares de upload (multer + sharp).
 */
const path = require('path');
const multer = require('multer');
const uploadConfig = require('../config/upload.config');
const uploadService = require('../services/admin/upload.service');
const logger = require('../utils/logger');
const { createUploadError } = require('../utils/upload.helpers');

function createImageFileFilter() {
  return (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!uploadConfig.ALLOWED_EXTENSIONS.has(ext)) {
      return cb(createUploadError('Extensión no permitida. Use JPG, JPEG, PNG o WEBP.'));
    }

    if (!uploadConfig.ALLOWED_MIMES.has(file.mimetype)) {
      return cb(createUploadError('Tipo MIME no permitido.'));
    }

    cb(null, true);
  };
}

function createDiskStorage({ destination, ensureDir, logLabel }) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir();
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      try {
        if (!uploadService.isAllowedExtension(file.originalname)) {
          return cb(createUploadError('Tipo de archivo no permitido. Use JPG, JPEG, PNG o WEBP.'));
        }
        const filename = uploadService.generateUniqueFilename(file.originalname);
        if (logLabel) {
          logger.info(logLabel, { filename, field: file.fieldname });
        }
        cb(null, filename);
      } catch (err) {
        cb(err);
      }
    },
  });
}

async function sanitizeReqFile(req, profileKey) {
  if (!req.file?.path || !profileKey) return;

  const filename = await uploadService.optimizeImage(req.file.path, profileKey);
  req.file.filename = filename;
  req.file.path = path.join(path.dirname(req.file.path), filename);
}

async function sanitizeReqFiles(req, fieldProfiles = {}) {
  if (!req.files) return;

  for (const [fieldName, fieldFiles] of Object.entries(req.files)) {
    const profileKey = fieldProfiles[fieldName];
    if (!profileKey) continue;

    for (const file of fieldFiles) {
      if (!file?.path) continue;
      const filename = await uploadService.optimizeImage(file.path, profileKey);
      file.filename = filename;
      file.path = path.join(path.dirname(file.path), filename);
    }
  }
}

/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void} multerHandler
 * @param {'single'|'fields'} mode
 * @param {{ profile?: string, fieldProfiles?: Record<string, string> }} [options]
 */
function wrapUploadWithSanitization(multerHandler, mode, options = {}) {
  const profileKey = options.profile;
  const fieldProfiles = options.fieldProfiles || {};

  return (req, res, next) => {
    multerHandler(req, res, async (err) => {
      if (err) {
        err.isUploadError = true;
        return next(err);
      }

      try {
        if (mode === 'fields') {
          await sanitizeReqFiles(req, fieldProfiles);
        } else {
          await sanitizeReqFile(req, profileKey);
        }
        next();
      } catch (sanitizeErr) {
        sanitizeErr.isUploadError = true;
        next(sanitizeErr);
      }
    });
  };
}

/**
 * @param {{ profileKey: string, fieldName: string, destination: string, ensureDir: () => void, logLabel?: string }} config
 */
function createMulterSingleUpload({ profileKey, fieldName, destination, ensureDir, logLabel }) {
  const profile = uploadConfig.getImageProfile(profileKey);
  ensureDir();

  const upload = multer({
    storage: createDiskStorage({ destination, ensureDir, logLabel }),
    fileFilter: createImageFileFilter(),
    limits: { fileSize: profile.maxUploadSize, files: 1 },
  });

  return wrapUploadWithSanitization(upload.single(fieldName), 'single', { profile: profileKey });
}

module.exports = {
  createImageFileFilter,
  createDiskStorage,
  wrapUploadWithSanitization,
  createMulterSingleUpload,
};
