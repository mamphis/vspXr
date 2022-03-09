import axios from 'axios';
import { CancellationToken, extensions, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, workspace } from 'vscode';

export class ExtensionPanel implements WebviewViewProvider {
    constructor(private extensionUri: Uri) {
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


        webviewView.webview.onDidReceiveMessage((message) => {
            if ('search' in message) {
                Promise.all(registries.map((registry) => {
                    const url = new URL("vsix", registry);
                    url.searchParams.set("query", message.search);

                    return axios.get(url.toString())
                        .then((r) => r.data.map((ext: any) => {
                            return {
                                ...ext,
                                icon: new URL(`assets/${ext.id}/icon`, registry).toString(),
                            }
                        }))
                        .catch((error) => {
                            console.warn(
                                `Cannot request registry [${registry}]: ${error}`
                            );
                            return [];
                        });
                })).then((exts: any[][]) => {
                    exts = exts.flatMap(ext => {
                        return ext.map(e => ({
                            ...e,
                            installed: !!extensions.getExtension(`${e.publisher}.${e.id}`),
                        }));
                    });
                    webviewView.webview.postMessage({ type: 'setExtensions', content: exts });
                });
            }

            if ('install' in message) {
                console.log(message.install);
                // TODO: Add download of vsix.
                // TODO: Add installation of vsix.
            }
        });

        webviewView.webview.postMessage({ type: 'setSearchValue', content: '' });
        updateRegistries();
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