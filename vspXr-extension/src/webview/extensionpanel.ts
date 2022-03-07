import { Uri, ViewColumn, WebviewPanel } from 'vscode';
export class ExtensionPanel {
    private static currentPanel?: WebviewPanel;

    static render(extensionUri: Uri) {
        if (ExtensionPanel.currentPanel) {
            ExtensionPanel.currentPanel.reveal();
        }
    }

    private getHtmlContent() {
        return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite App</title>
            <script type="module" crossorigin src="/index.js"></script>
            <link rel="modulepreload" href="/vendor.js">
            <link rel="stylesheet" href="/index.css">
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>
        `;
    }
}