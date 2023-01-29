// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const SEPARATOR_REGEX = /^[\s]*\/\/[\s]*---+$/;
const HEADING_REGEX = /^[\s]*\/\/[\s]*(.*)[\s]*$/;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'tidy-comments.tidyOne',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      // Get the text on the previous line, current line, and next line.
      const previousLine: null | vscode.TextLine =
        editor.selection.active.line === 0
          ? null
          : editor.document.lineAt(editor.selection.active.line - 1);
      const currentLine = editor.document.lineAt(editor.selection.active.line);
      const isLastLine =
        editor.selection.active.line === editor.document.lineCount - 1;
      const nextLine = isLastLine
        ? null
        : editor.document.lineAt(editor.selection.active.line + 1);

      const currentLineMatch = HEADING_REGEX.exec(currentLine.text);
      if (!currentLineMatch) {
        return;
      }

      // Generate a list of dashes the same length as the current line's heading
      const dashes = '-'.repeat(currentLineMatch[0].length - 3);

      editor.edit((editBuilder) => {
        if (previousLine && SEPARATOR_REGEX.test(previousLine.text)) {
          editBuilder.replace(previousLine.range, `// ${dashes}`);
        } else {
          editBuilder.insert(currentLine.range.start, `// ${dashes}\n`);
        }

        if (nextLine && SEPARATOR_REGEX.test(nextLine.text)) {
          editBuilder.replace(nextLine.range, `// ${dashes}`);
        } else {
          editBuilder.insert(currentLine.range.end, `\n// ${dashes}`);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
