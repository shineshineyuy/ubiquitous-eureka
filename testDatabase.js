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
exports.testDatabaseConnection = testDatabaseConnection;
const vscode = __importStar(require("vscode"));
async function testDatabaseConnection(dbType, connectionString) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Testing connection for ${dbType}...`,
        cancellable: false,
    }, async (progress) => {
        progress.report({ message: 'Establishing connection...' });
        try {
            switch (dbType) {
                case 'mssql':
                    await withTimeout(testMssqlConnection(connectionString), 30000);
                    break;
                case 'mysql':
                    await withTimeout(testMysqlConnection(connectionString), 30000);
                    break;
                case 'postgresql':
                    await withTimeout(testPostgresqlConnection(connectionString), 30000);
                    break;
                case 'cosmosdb_nosql':
                    await withTimeout(testCosmosDbConnection(connectionString), 30000);
                    break;
                default:
                    throw new Error(`Unsupported database type: ${dbType}`);
            }
            vscode.window.showInformationMessage(`Connection to ${dbType} was successful!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to connect to ${dbType}: ${error.message}`);
        }
    });
}
// Method to test SQL Server connection
async function testMssqlConnection(connectionString) {
    const sql = require('mssql');
    // Check if the connection string references LocalDB
    if (connectionString.includes('(localdb)')) {
        vscode.window.showErrorMessage('The connection string references LocalDB `(localdb)`, which is not supported by this extension.');
        return;
    }
    try {
        const pool = await sql.connect(connectionString);
        await pool.close();
        vscode.window.showInformationMessage('Successfully connected to SQL Server.');
    }
    catch (error) {
        throw new Error(`Failed to connect to SQL Server: ${error.message}`);
    }
}
// Method to test MySQL connection
async function testMysqlConnection(connectionString) {
    const mysql = require('mysql2/promise');
    const mysqlConnection = await mysql.createConnection(connectionString);
    await mysqlConnection.end();
}
// Method to test PostgreSQL connection
async function testPostgresqlConnection(connectionString) {
    const { Client } = require('pg');
    const pgClient = new Client({ connectionString });
    await pgClient.connect();
    await pgClient.end();
}
// Method to test Azure Cosmos DB connection
async function testCosmosDbConnection(connectionString) {
    const { CosmosClient } = require('@azure/cosmos');
    const client = new CosmosClient(connectionString);
    await client.getDatabaseAccount();
}
// Utility function for timeout
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs} ms`)), timeoutMs)),
    ]);
}
//# sourceMappingURL=testDatabase.js.map