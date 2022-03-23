import { window, ExtensionContext } from 'vscode';
import { ExtensionManager } from './lib/extensionmanager';
import { ExtensionPanel } from './webview/extensionpanel';

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "vspxr-extension" is now active!');
	// TODO: Add Discovery Client to search for registries that are currently not in the configuration
	const extManager = new ExtensionManager(context.globalState, context.globalStorageUri);

	// Register the webview for the custom ExtensionPanel
	window.registerWebviewViewProvider('vspXr-extension-explorer-view', new ExtensionPanel(context.extensionUri, extManager));
}

// this method is called when your extension is deactivated
export function deactivate() { }
