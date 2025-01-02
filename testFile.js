"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = validateConfig;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
function validateConfig(configPath) {
    // Step 1: Read dab-config.json
    if (!fs.existsSync(configPath)) {
        vscode.window.showErrorMessage(`Configuration file not found at ${configPath}`);
        return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    let connectionString = config["data-source"]?.["connection-string"] ?? null;
    const dbType = config["data-source"]?.["database-type"] ?? null;
    if (!dbType) {
        vscode.window.showErrorMessage('Database type not specified in dab-config.json.');
        return null;
    }
    // Step 2: Resolve environment variable if needed
    if (connectionString && connectionString.startsWith('@env')) {
        const envFilePath = path.join(path.dirname(configPath), '.env');
        if (!fs.existsSync(envFilePath)) {
            vscode.window.showErrorMessage('.env file not found.');
            return null;
        }
        dotenv.config({ path: envFilePath });
        const envVarName = connectionString.match(/@env\('(.*)'\)/)?.[1];
        connectionString = process.env[envVarName] ?? null;
        if (!connectionString) {
            vscode.window.showErrorMessage(`Environment variable '${envVarName}' referenced in dab-config.json is not defined in .env.`);
            return null;
        }
    }
    // Step 3: Final validation of connection string
    if (!connectionString) {
        vscode.window.showErrorMessage('Connection string is missing from both dab-config.json and .env. Please ensure it is defined.');
        return null;
    }
    if (connectionString.trim() === '') {
        vscode.window.showErrorMessage('Connection string is empty. Please provide a valid connection string.');
        return null;
    }
    return { dbType, connectionString };
}
//# sourceMappingURL=testFile.js.map