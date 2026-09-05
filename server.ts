import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_CMS_DATA } from './src/defaultData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'cms-data.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read JSON
function readJSONFile(filePath: string, defaultValue: any) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON safely and atomically
function writeJSONFile(filePath: string, data: any): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Ensure database file is initialized with valid CMS data
function ensureCMSDataFile() {
  const existing = readJSONFile(DATA_FILE, null);
  if (!existing || typeof existing !== 'object' || !existing.siteSettings || !existing.profile) {
    console.log('Initializing cms-data.json with default seed data...');
    writeJSONFile(DATA_FILE, INITIAL_CMS_DATA);
  }
}
ensureCMSDataFile();

const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');

const DEFAULT_AUTH = {
  adminEmail: 'admin@rezzone.dev',
  adminPassword: 'admin123',
  googleAuthEnabled: true,
  authorizedGoogleEmails: ['riazthesigma@gmail.com', 'admin@rezzone.dev'],
  googleClientId: '',
};

function getAuthSettings() {
  const saved = readJSONFile(AUTH_FILE, null);
  if (saved) return { ...DEFAULT_AUTH, ...saved };
  // Check if saved in CMS data
  const cmsData = readJSONFile(DATA_FILE, null);
  if (cmsData && cmsData.adminAuthSettings) {
    return { ...DEFAULT_AUTH, ...cmsData.adminAuthSettings };
  }
  return DEFAULT_AUTH;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH: Security configuration & Brute-Force Protection
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_FILE = path.join(DATA_DIR, 'auth-lockout.json');

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastFailedAt: number;
}

interface LockoutMap {
  [key: string]: LockoutRecord;
}

function getLockoutMap(): LockoutMap {
  return readJSONFile(LOCKOUT_FILE, {}) as LockoutMap;
}

function saveLockoutMap(data: LockoutMap) {
  writeJSONFile(LOCKOUT_FILE, data);
}

function formatRemainingTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

function getClientIdentifier(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'client';
}

// AUTH: Check Public Auth Config (no password returned!)
app.get('/api/auth/config', (req, res) => {
  const auth = getAuthSettings();
  res.json({
    success: true,
    googleAuthEnabled: auth.googleAuthEnabled !== false,
    authorizedGoogleEmails: auth.authorizedGoogleEmails || ['riazthesigma@gmail.com', 'admin@rezzone.dev'],
    googleClientId: auth.googleClientId || '',
    adminEmail: auth.adminEmail,
  });
});

// AUTH: Check Lockout Status for current client
app.get('/api/auth/lockout-status', (req, res) => {
  const id = getClientIdentifier(req);
  const map = getLockoutMap();
  const record = map[id];
  const now = Date.now();

  if (record && record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return res.json({
      isLocked: true,
      lockedUntil: record.lockedUntil,
      remainingSeconds,
      remainingAttempts: 0,
      formattedRemaining: formatRemainingTime(remainingSeconds),
    });
  }

  const attempts = record && record.lockedUntil && record.lockedUntil <= now ? 0 : (record?.failedAttempts || 0);
  return res.json({
    isLocked: false,
    lockedUntil: null,
    remainingSeconds: 0,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - attempts),
  });
});

// AUTH: Standard Email + Password Login with Brute-Force Lockout Protection
app.post('/api/auth/login', (req, res) => {
  const id = getClientIdentifier(req);
  const map = getLockoutMap();
  const now = Date.now();
  const record: LockoutRecord = map[id] || { failedAttempts: 0, lockedUntil: null, lastFailedAt: 0 };

  // 1. Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      isLocked: true,
      lockedUntil: record.lockedUntil,
      remainingSeconds,
      remainingAttempts: 0,
      error: `Account temporarily locked due to too many failed attempts. Try again in ${formatRemainingTime(remainingSeconds)}.`,
    });
  }

  // 2. Cooldown expired: Reset attempts
  if (record.lockedUntil && record.lockedUntil <= now) {
    record.failedAttempts = 0;
    record.lockedUntil = null;
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Admin ID and password are required' });
  }

  const auth = getAuthSettings();
  const normalizedInputEmail = String(email).trim().toLowerCase();
  const normalizedAdminEmail = String(auth.adminEmail).trim().toLowerCase();

  const isEmailMatch =
    normalizedInputEmail === normalizedAdminEmail ||
    normalizedInputEmail === 'admin' ||
    normalizedInputEmail === 'admin@rezzone.dev' ||
    normalizedInputEmail === 'riazthesigma@gmail.com';

  const isPasswordMatch =
    String(password) === String(auth.adminPassword) ||
    ((auth.adminPassword === 'admin123' || auth.adminPassword === 'RezZone@2026') &&
      (String(password) === 'admin123' || String(password) === 'RezZone@2026'));

  // 3. SUCCESSFUL LOGIN: Reset attempt counter upon successful login
  if (isEmailMatch && isPasswordMatch) {
    delete map[id];
    saveLockoutMap(map);

    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    return res.json({
      success: true,
      token,
      adminEmail: auth.adminEmail,
      message: 'Authentication successful',
    });
  }

  // 4. FAILED LOGIN: Increment failed count and check 5 attempts threshold
  record.failedAttempts = (record.failedAttempts || 0) + 1;
  record.lastFailedAt = now;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    map[id] = record;
    saveLockoutMap(map);

    const remainingSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    return res.status(429).json({
      success: false,
      isLocked: true,
      lockedUntil: record.lockedUntil,
      remainingSeconds,
      remainingAttempts: 0,
      error: `Account temporarily locked due to too many failed attempts. Try again in ${formatRemainingTime(remainingSeconds)}.`,
    });
  } else {
    map[id] = record;
    saveLockoutMap(map);

    const remaining = MAX_FAILED_ATTEMPTS - record.failedAttempts;
    return res.status(401).json({
      success: false,
      isLocked: false,
      remainingAttempts: remaining,
      // Clear, secure server-side error message without exposing whether email or password was wrong
      error: `Invalid administrator credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before a 15-minute lockout.`,
    });
  }
});

// AUTH: Reset Lockout (Admin utility)
app.post('/api/auth/reset-lockout', (req, res) => {
  saveLockoutMap({});
  res.json({ success: true, message: 'All brute-force lockouts have been reset.' });
});

// AUTH: Google Sign-in Login (Validates against authorized Google emails set by admin)
app.post('/api/auth/google', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Google email is required' });
  }

  const auth = getAuthSettings();
  if (auth.googleAuthEnabled === false) {
    return res.status(403).json({ success: false, error: 'Google Sign-In is currently disabled by administrator' });
  }

  const normalizedInputEmail = String(email).trim().toLowerCase();
  const authorized = (auth.authorizedGoogleEmails || ['riazthesigma@gmail.com', 'admin@rezzone.dev']).map((e: string) => e.trim().toLowerCase());

  // Also include the primary admin email
  if (auth.adminEmail) {
    authorized.push(auth.adminEmail.trim().toLowerCase());
  }

  const isAuthorized = authorized.includes(normalizedInputEmail);

  if (isAuthorized) {
    const token = 'token_g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    return res.json({
      success: true,
      token,
      email: normalizedInputEmail,
      message: 'Google authentication successful',
    });
  }

  return res.status(403).json({
    success: false,
    error: `The Google account "${email}" is not authorized as an administrator. You can add it in Admin Security Settings.`,
  });
});

// AUTH: Update Security & Auth Settings (Change Admin ID, Password, Google Auth)
app.put('/api/auth/settings', (req, res) => {
  const { currentPassword, newPassword, newEmail, googleAuthEnabled, authorizedGoogleEmails, googleClientId } = req.body;
  const auth = getAuthSettings();

  // If changing password or Admin ID (email), verify current password
  if (newPassword || newEmail) {
    const isPassValid =
      currentPassword &&
      (String(currentPassword) === String(auth.adminPassword) ||
        ((auth.adminPassword === 'admin123' || auth.adminPassword === 'RezZone@2026') &&
          (String(currentPassword) === 'admin123' || String(currentPassword) === 'RezZone@2026')));

    if (!isPassValid) {
      return res.status(401).json({ success: false, error: 'Current password is required to verify ownership.' });
    }
  }

  const updatedAuth = {
    ...auth,
    adminEmail: newEmail ? String(newEmail).trim() : auth.adminEmail,
    adminPassword: newPassword ? String(newPassword) : auth.adminPassword,
    googleAuthEnabled: typeof googleAuthEnabled === 'boolean' ? googleAuthEnabled : auth.googleAuthEnabled,
    authorizedGoogleEmails: Array.isArray(authorizedGoogleEmails) ? authorizedGoogleEmails : auth.authorizedGoogleEmails,
    googleClientId: googleClientId !== undefined ? String(googleClientId).trim() : auth.googleClientId,
  };

  writeJSONFile(AUTH_FILE, updatedAuth);

  // Sync with CMS data file without exposing password
  const cmsData = readJSONFile(DATA_FILE, null);
  if (cmsData) {
    cmsData.adminAuthSettings = {
      adminEmail: updatedAuth.adminEmail,
      googleAuthEnabled: updatedAuth.googleAuthEnabled,
      authorizedGoogleEmails: updatedAuth.authorizedGoogleEmails,
      googleClientId: updatedAuth.googleClientId,
    };
    writeJSONFile(DATA_FILE, cmsData);
  }

  return res.json({
    success: true,
    message: 'Admin security settings updated successfully',
    settings: {
      adminEmail: updatedAuth.adminEmail,
      googleAuthEnabled: updatedAuth.googleAuthEnabled,
      authorizedGoogleEmails: updatedAuth.authorizedGoogleEmails,
      googleClientId: updatedAuth.googleClientId,
    },
  });
});

// GET CMS Data
app.get('/api/cms', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  let data = readJSONFile(DATA_FILE, null);
  if (!data || typeof data !== 'object' || !data.siteSettings) {
    writeJSONFile(DATA_FILE, INITIAL_CMS_DATA);
    data = INITIAL_CMS_DATA;
  }
  res.json({ success: true, data });
});

// SAVE CMS Data
app.put('/api/cms', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid data payload: body must be a JSON object' });
  }

  if (!incoming.siteSettings || !incoming.profile) {
    return res.status(400).json({
      success: false,
      error: 'Invalid CMS data: siteSettings and profile are required properties',
    });
  }

  // Preserve existing fields if not provided in incoming
  const current = readJSONFile(DATA_FILE, INITIAL_CMS_DATA);
  const updatedData = {
    ...current,
    ...incoming,
    siteSettings: {
      ...(current?.siteSettings || {}),
      ...(incoming.siteSettings || {}),
    },
    profile: {
      ...(current?.profile || {}),
      ...(incoming.profile || {}),
    },
  };

  const ok = writeJSONFile(DATA_FILE, updatedData);
  if (ok) {
    res.json({ success: true, message: 'CMS data saved successfully', data: updatedData });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write CMS data to disk' });
  }
});

// RESET CMS Data
app.post('/api/cms/reset', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const ok = writeJSONFile(DATA_FILE, INITIAL_CMS_DATA);
    if (ok) {
      res.json({ success: true, message: 'Reset to initial sample data', data: INITIAL_CMS_DATA });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write default data' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reset data' });
  }
});

// CONTACT FORM SUBMISSIONS
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const submissions = readJSONFile(SUBMISSIONS_FILE, []);
  const newSubmission = {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  submissions.unshift(newSubmission);
  writeJSONFile(SUBMISSIONS_FILE, submissions);

  // Also append to main CMS data if exists
  const cmsData = readJSONFile(DATA_FILE, null);
  if (cmsData) {
    if (!Array.isArray(cmsData.contactSubmissions)) {
      cmsData.contactSubmissions = [];
    }
    cmsData.contactSubmissions.unshift(newSubmission);
    writeJSONFile(DATA_FILE, cmsData);
  }

  res.json({ success: true, submission: newSubmission });
});

app.get('/api/contact', (req, res) => {
  const submissions = readJSONFile(SUBMISSIONS_FILE, []);
  res.json({ success: true, submissions });
});

app.delete('/api/contact/:id', (req, res) => {
  const { id } = req.params;
  const submissions = readJSONFile(SUBMISSIONS_FILE, []);
  const filtered = submissions.filter((s: any) => s.id !== id);
  writeJSONFile(SUBMISSIONS_FILE, filtered);

  const cmsData = readJSONFile(DATA_FILE, null);
  if (cmsData && Array.isArray(cmsData.contactSubmissions)) {
    cmsData.contactSubmissions = cmsData.contactSubmissions.filter((s: any) => s.id !== id);
    writeJSONFile(DATA_FILE, cmsData);
  }

  res.json({ success: true, message: 'Submission deleted' });
});

// AI ASSISTANT / GEMINI ROUTE (Lazy Initialization)
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate content',
      requiresApiKey: !process.env.GEMINI_API_KEY,
    });
  }
});

// Start server with Vite middleware in dev
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
