import { CancellationToken, Uri, ViewColumn, Webview, WebviewPanel, WebviewPanelOnDidChangeViewStateEvent, WebviewView, WebviewViewProvider, WebviewViewResolveContext, window, workspace } from 'vscode';
export class ExtensionPanel implements WebviewViewProvider {
    constructor(private extensionUri: Uri) {
    }

    resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
        console.log("Try to resolve webview...");
        webviewView.webview.options = {
            enableScripts: true
        };
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        function updateRegistries() {
            const configSection = workspace.getConfiguration('vspXr');
            const registries = configSection.get('privateRegistries', ['http://localhost:3000']);

            webviewView.webview.postMessage({ type: 'setRegistries', content: registries });
        }
        workspace.onDidChangeConfiguration((configChangeEvent) => {
            if (configChangeEvent.affectsConfiguration('vspXr.privateRegistries')) {
                updateRegistries();
            }
        })

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