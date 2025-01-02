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
exports.validateConfigPath = validateConfigPath;
exports.isProcedureInConfig = isProcedureInConfig;
exports.readDatabaseType = readDatabaseType;
exports.getConnectionString = getConnectionString;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Validates the configuration file path.
 * @param configPath - The path to the configuration file.
 * @returns True if valid, false otherwise.
 */
function validateConfigPath(configPath) {
    if (!fs.existsSync(configPath)) {
        vscode.window.showErrorMessage(`Configuration file not found at path: ${configPath}`);
        return false;
    }
    return true;
}
/**
 * Checks if a stored procedure already exists in the configuration file.
 * @param configPath - The path to the configuration file.
 * @param procedureName - The name of the stored procedure (e.g., 'dbo.SampleProcedure').
 * @returns True if the stored procedure exists, false otherwise.
 */
async function isProcedureInConfig(configPath, procedureName) {
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        const entities = config['entities'] || {};
        return Object.values(entities).some((entity) => entity.source?.object === procedureName);
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error reading configuration file: ${error.message}`);
        }
        else {
            vscode.window.showErrorMessage(`An unknown error occurred.`);
        }
        return false;
    }
}
/**
 * Reads the database type from the configuration file.
 * @param configPath - The path to the configuration file.
 * @returns The database type as a string, or an empty string if not found.
 */
async function readDatabaseType(configPath) {
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        return config['data-source']?.['database-type'] || '';
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error reading configuration file: ${error.message}`);
        }
        else {
            vscode.window.showErrorMessage(`An unknown error occurred.`);
        }
        return '';
    }
}
/**
 * Retrieves the connection string from the configuration file, .env file, or environment variables.
 * @param configPath - The path to the configuration file.
 * @returns The connection string as a string, or an empty string if not found or if LocalDB is detected.
 */
async function getConnectionString(configPath) {
    try {
        let connectionString = readConnectionStringInConfig(configPath);
        if (connectionString.startsWith('@env(')) {
            const envVarName = extractEnvVarName(connectionString);
            if (!envVarName) {
                vscode.window.showErrorMessage('The connection string in the config file is empty.');
                return '';
            }
            connectionString = readConnectionStringInEnvFile(configPath, envVarName) || readConnectionStringInEnvironment(envVarName);
        }
        if (!connectionString) {
            vscode.window.showErrorMessage('The connection string could not be found in the environment.');
            return '';
        }
        if (isLocalDbConnection(connectionString)) {
            vscode.window.showErrorMessage('The connection string is using LocalDB, which is not supported in JavaScript.');
            return '';
        }
        return connectionString;
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error retrieving connection string: ${error.message}`);
        }
        else {
            vscode.window.showErrorMessage('An unknown error occurred.');
        }
        return '';
    }
}
/**
 * Reads the connection string directly from the configuration file.
 * @param configPath - The path to the configuration file.
 * @returns The connection string or an empty string if not found.
 */
function readConnectionStringInConfig(configPath) {
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        return config['data-source']?.['connection-string'] || '';
    }
    catch {
        return '';
    }
}
/**
 * Reads the connection string from the .env file.
 * @param configPath - The path to the configuration file.
 * @param envVarName - The name of the environment variable.
 * @returns The connection string or an empty string if not found.
 */
function readConnectionStringInEnvFile(configPath, envVarName) {
    const envFilePath = path.join(path.dirname(configPath), '.env');
    if (!fs.existsSync(envFilePath)) {
        return '';
    }
    try {
        const envContent = fs.readFileSync(envFilePath, 'utf8');
        const envLines = envContent.split('\n');
        for (const line of envLines) {
            const match = line.match(new RegExp(`^${envVarName}\\s*=\\s*"?(.+?)"?\\s*$`));
            if (match) {
                return match[1];
            }
        }
        return '';
    }
    catch {
        return '';
    }
}
/**
 * Reads the connection string from environment variables.
 * @param envVarName - The name of the environment variable.
 * @returns The connection string or an empty string if not found.
 */
function readConnectionStringInEnvironment(envVarName) {
    return process.env[envVarName] || '';
}
/**
 * Extracts the environment variable name from the @env() syntax.
 * @param connectionString - The connection string containing the @env syntax.
 * @returns The environment variable name or an empty string if not found.
 */
function extractEnvVarName(connectionString) {
    const envVarMatch = connectionString.match(/@env\('(.+?)'\)/);
    return envVarMatch ? envVarMatch[1] : '';
}
/**
 * Checks if the connection string is attempting to use LocalDB.
 * @param connectionString - The connection string to check.
 * @returns True if the connection string contains LocalDB, false otherwise.
 */
function isLocalDbConnection(connectionString) {
    return connectionString.toLowerCase().includes('(localdb)');
}
//# sourceMappingURL=readConfig.js.map