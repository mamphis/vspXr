import axios from 'axios';
import { CancellationToken, commands, extensions, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, workspace } from 'vscode';
import { ExtensionManager } from '../lib/extensionmanager';
import { Extension } from '../model/extension';

export class ExtensionPanel implements WebviewViewProvider {
    constructor(private extensionUri: Uri, private extensionManager: ExtensionManager) {
    }

    resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
        console.log("Try to resolve webview...");
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        let registries: string[] = [];
        function updateRegistries() {
            const configSection = workspace.getConfiguration('vspXr');
            registries = configSection.get('privateRegistries', ['http://localhost:3000']);
        }

        workspace.onDidChangeConfiguration((configChangeEvent) => {
            if (configChangeEvent.affectsConfiguration('vspXr.privateRegistries')) {
                updateRegistries();
            }
        })

        const searchAndSetExtensions = (searchQuery: string) => {
            Promise.all(registries.map((registry) => {
                const url = new URL("vsix", registry);
                url.searchParams.set("query", searchQuery);

                return axios.get(url.toString())
                    .then((r) => r.data.map((ext: Partial<Extension>) => {
                        return {
                            ...ext,
                            icon: new URL(`assets/${ext.id}/icon`, registry).toString(),
                            registry,
                        }
                    }))
                    .catch((error) => {
                        console.warn(
                            `Cannot request registry [${registry}]: ${error}`
                        );
                        return [];
                    });
            })).then((exts: Partial<Extension>[][]) => {
                const flatExtensions = exts.flatMap(ext => {
                    return ext.map(e => ({
                        ...e,
                        installed: !!extensions.getExtension(`${e.publisher}.${e.id}`),
                    }));
                });
                webviewView.webview.postMessage({ type: 'setExtensions', content: flatExtensions });
            });
        }

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if ('search' in message) {
                searchAndSetExtensions(message.search);
            }

            if ('install' in message) {
                await this.extensionManager.downloadAndInstallExtension(message.install);
                webviewView.webview.postMessage({ type: 'extensionInstalled', content: message.install });
                commands.executeCommand('extension.open', `${message.install.publisher}.${message.install.id}`);
            }
        });

        webviewView.webview.postMessage({ type: 'setSearchValue', content: '' });
        updateRegistries();
        searchAndSetExtensions('');
    }

    private getUri(webview: Webview, filename: string) {
        return webview.asWebviewUri(Uri.joinPath(this.extensionUri, 'vspXr-ui', 'dist', filename));
    }

    private getHtmlContent(webview: Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite App</title>
            <script type="module" crossorigin src="${this.getUri(webview, 'index.js')}"></script>
            <link rel="modulepreload" href="${this.getUri(webview, 'vendor.js')}">
            <link rel="stylesheet" href="${this.getUri(webview, 'index.css')}">
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>
        `;
    }
}