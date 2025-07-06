const child_process = require("child_process");
const fs = require("fs");

let serverProcess;

const killProcess = (proc) => {
  if (!proc) return;

  if (process.platform === "win32") {
    // On Windows, use taskkill to forcefully kill the process tree
    try {
      child_process.execSync(`taskkill /pid ${proc.pid} /T /F`, {
        stdio: "ignore",
      });
    } catch (error) {
      // Process might already be dead, ignore error
    }
  } else {
    // On Unix-like systems, use SIGTERM first, then SIGKILL
    try {
      proc.kill("SIGTERM");
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill("SIGKILL");
        }
      }, 5000);
    } catch (error) {
      // Process might already be dead, ignore error
    }
  }
};

const runServer = () => {
  if (serverProcess) {
    console.log("Stopping existing server...");
    killProcess(serverProcess);
  }

  console.log("Starting server...");

  // Use spawn instead of exec for better process control
  serverProcess = child_process.spawn("node", ["server/main.js"], {
    stdio: ["pipe", "pipe", "pipe"],
    detached: false,
    shell: process.platform === "win32", // Use shell on Windows
  });

  serverProcess.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  serverProcess.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  serverProcess.on("close", (code) => {
    if (code !== 0) {
      console.log(`Server process exited with code ${code}`);
    }
  });

  serverProcess.on("error", (error) => {
    console.error("Server process error:", error);
  });
};

// Initial server start
runServer();

let serverWatchLastFired;
let webWatchLastFired;

// Watch server directory
try {
  fs.watch("./server", { recursive: true }, (eventType, filename) => {
    if (Date.now() - (serverWatchLastFired || 0) < 1000) {
      return;
    }
    serverWatchLastFired = Date.now();

    if (filename) {
      console.log(`Server file changed: ${filename}`);
      runServer();
    }
  });
} catch (error) {
  console.error("Error watching server directory:", error);
}

// Watch web directory
try {
  fs.watch("./web", { recursive: true }, (eventType, filename) => {
    if (Date.now() - (webWatchLastFired || 0) < 1000) {
      return;
    }
    webWatchLastFired = Date.now();

    if (filename) {
      console.log(`Web file changed: ${filename}`);
      runServer();
    }
  });
} catch (error) {
  console.error("Error watching web directory:", error);
}

// Cleanup function
const cleanup = () => {
  console.log("Cleaning up...");
  if (serverProcess) {
    killProcess(serverProcess);
  }
  console.log("Server stopped.");
  process.exit(0);
};

// Handle process termination
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Windows-specific cleanup
if (process.platform === "win32") {
  process.on("SIGBREAK", cleanup);
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  cleanup();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  cleanup();
});
