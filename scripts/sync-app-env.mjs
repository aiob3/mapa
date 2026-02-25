import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const rootEnvPath = path.join(repoRoot, '.env');
const appEnvPath = path.join(repoRoot, 'mapa-app', '.env');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return dotenv.parse(content);
}

function getFromParsed(parsed, key) {
  return typeof parsed[key] === 'string' && parsed[key].trim().length > 0 ? parsed[key].trim() : '';
}

const rootEnv = parseEnvFile(rootEnvPath);
const appEnvExisting = parseEnvFile(appEnvPath);

const supabaseUrl =
  getFromParsed(rootEnv, 'SUPABASE_PROJECT_URL') || getFromParsed(appEnvExisting, 'VITE_SUPABASE_URL');
const supabaseAnonKey =
  getFromParsed(rootEnv, 'SUPABASE_PUBLISHABLE_KEY') ||
  getFromParsed(rootEnv, 'SUPABASE_ANOM_PUBLIC_KEY') ||
  getFromParsed(appEnvExisting, 'VITE_SUPABASE_ANON_KEY');
const authDomain = getFromParsed(appEnvExisting, 'VITE_AUTH_DEFAULT_EMAIL_DOMAIN') || 'mapa.local';

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) {
    missing.push('SUPABASE_PROJECT_URL');
  }
  if (!supabaseAnonKey) {
    missing.push('SUPABASE_PUBLISHABLE_KEY|SUPABASE_ANOM_PUBLIC_KEY');
  }
  console.error(
    `[sync:env:app] Variáveis obrigatórias ausentes no .env raiz: ${missing.join(', ')}. Não foi possível gerar mapa-app/.env.`,
  );
  process.exit(1);
}

const output = [
  `VITE_SUPABASE_URL=${supabaseUrl}`,
  `VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
  `VITE_AUTH_DEFAULT_EMAIL_DOMAIN=${authDomain}`,
  '',
].join('\n');

fs.writeFileSync(appEnvPath, output, 'utf8');
console.log('[sync:env:app] mapa-app/.env atualizado com sucesso.');
