import fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";

let packageManager: string | undefined = undefined;

export function getPackageScripts() {
  try {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (workspaceRoot) {
      const packageJsonPath = path.join(workspaceRoot, "package.json");
      console.log("packageJsonPath", packageJsonPath);
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8")
        );
        return packageJson.scripts || {};
      }
    }
    return {};
  } catch (error) {
    console.error("Error reading package.json", error);
    return {};
  }
}

export function getCommands() {
  const scripts = getPackageScripts();
  const pm = getPackageManager();
  return Object.keys(scripts).map((key) => {
    return {
      label: key,
      detail: `${scripts[key]}`,
      command: `${pm} ${key}`,
    };
  });
}

export function getPackageManager() {
  if (packageManager) {
    return packageManager;
  }

  try {
    const workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || "";
    if (!workspaceRoot) {
      packageManager = "npm";
      return packageManager;
    }

    const hasPnpmLock = fs.existsSync(
      path.join(workspaceRoot, "pnpm-lock.yaml")
    );
    if (hasPnpmLock) {
      packageManager = "pnpm";
      return packageManager;
    }

    const hasYarnLock = fs.existsSync(path.join(workspaceRoot, "yarn.lock"));
    if (hasYarnLock) {
      packageManager = "yarn";
      return packageManager;
    }

    packageManager = "npm";
    return packageManager;
  } catch (error) {
    packageManager = "npm";
  }
  return packageManager;
}
