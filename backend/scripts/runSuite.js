import { spawn } from "child_process";

const server = spawn("node", ["app.js"], {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

let started = false;

server.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  if (!started && text.includes("HomeHub Express Server running")) {
    started = true;
    console.log("Server ready. Starting test runner...");
    const test = spawn("node", ["verifyProductionDeployment.js"], {
      stdio: "inherit",
      env: process.env,
    });
    test.on("exit", (code) => {
      console.log(`Test runner finished with exit code ${code}. Stopping server...`);
      server.kill();
      process.exit(code || 0);
    });
  }
});

server.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

server.on("exit", (code) => {
  if (!started) {
    console.error(`Server exited unexpectedly with code ${code}`);
    process.exit(code || 1);
  }
});
