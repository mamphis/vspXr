import axios from 'axios';
import { CancellationToken, commands, extensions, Uri, Webview, WebviewView, WebviewViewProvider, WebviewViewResolveContext, workspace } from 'vscode';
import { ExtensionManager } from '../lib/extensionmanager';
import { Extension } from '../model/extension';

/**
 * The Extension Panel Provider which provides the webview for the extension
 *
 * @export
 * @class ExtensionPanel
 * @implements {WebviewViewProvider}
 */
export class ExtensionPanel implements WebviewViewProvider {
    /**
     * Creates an instance of ExtensionPanel.
     * @param {Uri} extensionUri The extension uri to load the ui components
     * @param {ExtensionManager} extensionManager The extension manager to encapsulate 
     *                              the extension functionality
     * @memberof ExtensionPanel
     */
    constructor(private extensionUri: Uri, private extensionManager: ExtensionManager) {
    }

    /**
     * Resolves the webview
     *
     * @param {WebviewView} webviewView The WebviewView which will be provided
     * @param {WebviewViewResolveContext<unknown>} context The context
     * @param {CancellationToken} token The cancellationToken
     * @return {*}  {(void | Thenable<void>)}
     * @memberof ExtensionPanel
     */
    resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext<unknown>, token: CancellationToken): void | Thenable<void> {
        console.log("Try to resolve webview...");
        // Automatically process updates on start
        this.extensionManager.processUpdates()

        // Enable scripts in the extension webview
        webviewView.webview.options = {
            enableScripts: true
        };
        // Set the content from the ui
        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        let registries: string[] = [];
        /**
         * Updates the registries from the configuration
         *
         */
        function updateRegistries() {
            const configSection = workspace.getConfiguration('vspXr');
            registries = configSection.get('privateRegistries', ['http://localhost:3000']);
        }

        workspace.onDidChangeConfiguration((configChangeEvent) => {
            if (configChangeEvent.affectsConfiguration('vspXr.privateRegistries')) {
                updateRegistries();
            }
        })

        
        /**
         * Search all registries for extensions matching the the passed search Query
         *
         * @param {string} searchQuery The searchh query
         */
        const searchAndSetExtensions = (searchQuery: string) => {
            Promise.all(registries.map((registry) => {
                const url = new URL("vsix", registry);
                url.searchParams.set("query", searchQuery);

                // Load all registries and map enrich them with the icon url and the registry where it came from
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
                // Check if the extension is allready installed.
                const flatExtensions = exts.flatMap(ext => {
                    return ext.map(e => ({
                        ...e,
                        installed: !!extensions.getExtension(`${e.publisher}.${e.id}`),
                    }));
                });
                webviewView.webview.postMessage({ type: 'setExtensions', content: flatExtensions });
            });
        }

        // The message handler for the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if ('search' in message) {
                searchAndSetExtensions(message.search);
            }

            // Command to install the extension
            if ('install' in message) {
                await this.extensionManager.downloadAndInstallExtension(message.install);
                // Tell the webview the extension was installed
                webviewView.webview.postMessage({ type: 'extensionInstalled', content: message.install });
                // Open the webview for the extension panel
                commands.executeCommand('extension.open', `${message.install.publisher}.${message.install.id}`);
            }
        });

        webviewView.webview.postMessage({ type: 'setSearchValue', content: '' });
        updateRegistries();
        searchAndSetExtensions('');
    }

    /**
     * Helper function to resolve asset file paths
     *
     * @private
     * @param {Webview} webview The webview where the uri is used
     * @param {string} filename The filename for the asset
     * @return {*} The resolved filepath
     * @memberof ExtensionPanel
     */
    private getUri(webview: Webview, filename: string) {
        return webview.asWebviewUri(Uri.joinPath(this.extensionUri, 'vspXr-ui', 'dist', filename));
    }

    /**
     * Gets the HTML content for the webview enriched with the vue.js scripts
     *
     * @private
     * @param {Webview} webview The webview
     * @return {*} The HTML content
     * @memberof ExtensionPanel
     */
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