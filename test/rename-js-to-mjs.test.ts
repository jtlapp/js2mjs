import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const TEMP_DIR = "temp";

it("renames all and only the required files", () => {
  // Copy the fixtures directory to a temporary directory

  const fixturesDirPath = path.join(__dirname, "fixtures");
  const tempDirPath = path.join(__dirname, TEMP_DIR);
  if (fs.existsSync(tempDirPath)) {
    fs.rmSync(tempDirPath, { recursive: true, force: true });
  }
  copyDir(fixturesDirPath, tempDirPath);

  // Run the rename-js-to-mjs script on the temporary directory

  const toMjsPath = path.join(__dirname, "..", "src", "rename-js-to-mjs.ts");
  const toMjsCommand = `npx ts-node ${toMjsPath} test/${TEMP_DIR}`;
  execSync(toMjsCommand);

  // Verify the filename extensions in the temporary directory

  verifyDir(tempDirPath);
  fs.rmSync(tempDirPath, { recursive: true, force: true });
});

function copyDir(fromPath: string, toPath: string) {
  fs.mkdirSync(toPath);
  const entries = fs.readdirSync(fromPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(fromPath, entry.name);
    if (entry.isDirectory()) {
      copyDir(path.join(fromPath, entry.name), path.join(toPath, entry.name));
    } else {
      fs.copyFileSync(fullPath, path.join(toPath, entry.name));
    }
  }
}

function verifyDir(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let fileCount = 0;
  for (const entry of entries) {
    if (entry.isDirectory()) {
      verifyDir(path.join(dirPath, entry.name));
    } else {
      if (!entry.name.endsWith(".ts")) {
        expect(entry.name).toMatch(/\.mjs(\.map)?$/);
      }
      ++fileCount;
    }
  }
  expect(fileCount).toEqual(3);
}
