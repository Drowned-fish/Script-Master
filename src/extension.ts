import * as vscode from "vscode";
import { getCommands } from "./utils";

async function activate(context: vscode.ExtensionContext) {
  const commands = getCommands();
  const disposable = vscode.commands.registerCommand(
    "script-master",
    async () => {
      if (commands.length === 0) {
        vscode.window.showErrorMessage("无法从当前根目录没有找到package.json");
        return;
      }
      const selected = await vscode.window.showQuickPick(commands, {
        placeHolder: "选择要执行的命令",
        matchOnDescription: true,
        matchOnDetail: true,
      });
      if (selected) {
        const command = commands.find(
          (cmd) => cmd.label === selected.label
        )?.command;
        if (command) {
          const terminal =
            vscode.window.activeTerminal || vscode.window.createTerminal();
          terminal.show();
          terminal.sendText(command);
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

export { activate, deactivate };
