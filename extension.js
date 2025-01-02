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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const addTable_1 = require("./mssql/addTable");
const addView_1 = require("./mssql/addView");
const addProc_1 = require("./mssql/addProc");
const addRelationship_1 = require("./mssql/addRelationship");
const readConfig_1 = require("./readConfig");
function activate(context) {
    const addTableCommand = vscode.commands.registerCommand('dabExtension.addTable', async (uri) => {
        await handleAddEntity(uri, addTable_1.addTable, 'Add Table');
    });
    const addViewCommand = vscode.commands.registerCommand('dabExtension.addView', async (uri) => {
        await handleAddEntity(uri, addView_1.addView, 'Add View');
    });
    const addProcCommand = vscode.commands.registerCommand('dabExtension.addProc', async (uri) => {
        await handleAddEntity(uri, addProc_1.addProc, 'Add Stored Procedure');
    });
    const addRelationshipCommand = vscode.commands.registerCommand('dabExtension.addRelationship', async (uri) => {
        await handleAddEntity(uri, addRelationship_1.addRelationship, 'Add Relationship');
    });
    context.subscriptions.push(addTableCommand, addViewCommand, addProcCommand, addRelationshipCommand);
}
async function handleAddEntity(uri, action, entityType) {
    const configPath = uri.fsPath;
    const dbType = await (0, readConfig_1.readDatabaseType)(configPath);
    if (dbType !== 'mssql') {
        vscode.window.showErrorMessage(`Unsupported database type: ${dbType}. Only Microsoft SQL Server (mssql) is supported.`);
        return;
    }
    const connectionString = await (0, readConfig_1.getConnectionString)(configPath);
    if (!connectionString) {
        vscode.window.showErrorMessage('Unable to retrieve the connection string. Please check your configuration.');
        return;
    }
    await action(configPath, connectionString);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map