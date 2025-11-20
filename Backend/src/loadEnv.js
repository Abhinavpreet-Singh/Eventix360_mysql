import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');

// Load Backend/.env first, then the project root .env (without overriding already-set vars)
dotenv.config({ path: backendEnvPath });
dotenv.config({ path: rootEnvPath });


