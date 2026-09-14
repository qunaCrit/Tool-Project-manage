import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";

import { app, BrowserWindow } from "electron";

const isDev = !app.isPackaged;
let serverProcess = null;
let mainWindow = null;

app.setName("Tool Project Manage");

function getAppPath() {
  return app.getAppPath();
}

function getServerEnvironment(port) {
  const appPath = getAppPath();
  const env = {
    ...process.env,
    NODE_ENV: isDev ? "development" : "production",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    TOOL_PROJECT_MANAGE_MIGRATIONS_DIR: path.join(appPath, "drizzle"),
  };

  if (!isDev) {
    env.TOOL_PROJECT_MANAGE_DB_PATH = path.join(
      app.getPath("userData"),
      "tool-project-manage.db",
    );
  }

  return env;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
          return;
        }

        reject(new Error("Unable to find a free local port."));
      });
    });
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      fetch(url)
        .then((response) => {
          if (response.ok || response.status < 500) {
            resolve();
            return;
          }

          retry();
        })
        .catch(retry);
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for Next.js at ${url}`));
        return;
      }

      setTimeout(check, 300);
    };

    check();
  });
}

function startNextServer(port) {
  const appPath = getAppPath();
  const env = getServerEnvironment(port);

  if (isDev) {
    serverProcess = spawn("npm", ["run", "dev", "--", "-H", "127.0.0.1", "-p", String(port)], {
      cwd: appPath,
      env,
      stdio: "inherit",
    });
    return;
  }

  const serverPath = path.join(appPath, ".next", "standalone", "server.js");
  if (!existsSync(serverPath)) {
    throw new Error(`Production server not found at ${serverPath}`);
  }

  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: appPath,
    env: {
      ...env,
      ELECTRON_RUN_AS_NODE: "1",
    },
    stdio: "inherit",
  });
}

function stopNextServer() {
  if (!serverProcess || serverProcess.killed) {
    return;
  }

  serverProcess.kill("SIGTERM");
  serverProcess = null;
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: "Tool Project Manage",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function boot() {
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;

  startNextServer(port);
  await waitForServer(url);
  createWindow(url);
}

app.whenReady().then(() => {
  boot().catch((error) => {
    console.error(error);
    stopNextServer();
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && mainWindow) {
      mainWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  stopNextServer();
  app.quit();
});

app.on("before-quit", stopNextServer);
