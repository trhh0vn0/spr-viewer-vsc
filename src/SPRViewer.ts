import * as vscode from 'vscode';

export class SprEditorProvider implements vscode.CustomReadonlyEditorProvider {
    
    public static readonly viewType = 'spr.view';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public register(): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            SprEditorProvider.viewType,
            this,
            {
                webviewOptions: { retainContextWhenHidden: false }
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
    webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.joinPath(this.context.extensionUri, 'dist')
        ]
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === 'ready') {
            await this.sendFileData(document.uri, webviewPanel.webview, _token);
        }
    });
}
    private async sendFileData(
        uri: vscode.Uri,
        webview: vscode.Webview,
        token: vscode.CancellationToken
    ): Promise<void> {
        try {
            const fileData = await vscode.workspace.fs.readFile(uri);

            if (token.isCancellationRequested) return;

            webview.postMessage({
                type: 'load',
                data: Array.from(fileData)
            });
        } catch (err) {
            webview.postMessage({
                type: 'error',
                message: `Failed to read file: ${err}`
            });
        }
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const webviewScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.global.js')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none';
                   script-src 'nonce-${nonce}';
                   style-src 'unsafe-inline';">
    <title>SPR Viewer</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        canvas {
            display: block;
            margin-top: 12px;
        }
        #error {
            color: var(--vscode-errorForeground);
            padding: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div id="error"></div>
    <canvas id="canvas"></canvas>
    <script nonce="${nonce}" src="${webviewScriptUri}"></script>
</body>
</html>`;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}