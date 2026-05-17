import * as vscode from 'vscode';

export class SprEditorProvider implements vscode.CustomReadonlyEditorProvider {
    
    public static readonly viewType = 'spr.view';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public register(): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            SprEditorProvider.viewType,
            this,
            {
                webviewOptions: { retainContextWhenHidden: true }
            }
        );
    }

    async openCustomDocument(
        uri: vscode.Uri,
        _openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return { uri, dispose: () => {} };
    }

    async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document.uri.fsPath);
    }

    private getHtmlForWebview(webview: vscode.Webview, filePath: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SPR Viewer</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; color: var(--vscode-editor-foreground); }
                    #path { color: #569cd6; }
                </style>
            </head>
            <body>
                <p>Loading file: <span id="path">${filePath}</span></p>
            </body>
            </html>
        `;
    }
}