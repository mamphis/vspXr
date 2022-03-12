import { window, ExtensionContext } from 'vscode';
import { ExtensionManager } from './lib/extensionmanager';
import { ExtensionPanel } from './webview/extensionpanel';

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "vspxr-extension" is now active!');

	const extManager = new ExtensionManager(context.globalState, context.globalStorageUri);

	window.registerWebviewViewProvider('vspXr-extension-explorer-view', new ExtensionPanel(context.extensionUri, extManager));
}

// this method is called when your extension is deactivated
export function deactivate() { }
