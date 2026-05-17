import * as vscode from 'vscode';
import { SprEditorProvider } from './SPRViewer.js';
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(new SprEditorProvider(context).register());
}
export function deactivate() {}