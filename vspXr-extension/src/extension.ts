import { window, ExtensionContext } from 'vscode';
import { ExtensionPanel } from './webview/extensionpanel';

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "vspxr-extension" is now active!');

	window.registerWebviewViewProvider('vspXr-extension-explorer-view', new ExtensionPanel(context.extensionUri));
}

// this method is called when your extension is deactivated
export function deactivate() { }
