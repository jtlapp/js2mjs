import * as fs from "fs";
import * as path from "path";

function renameFilesInDir(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      renameFilesInDir(fullPath);
    } else {
      renameFile(fullPath, ".js", ".mjs");
      renameFile(fullPath, ".js.map", ".mjs.map");
    }
  }
}

function renameFile(filename: string, oldExt: string, newExt: string) {
  if (filename.endsWith(oldExt)) {
    const newFilename =
      filename.substring(0, filename.length - oldExt.length) + newExt;
    fs.renameSync(filename, newFilename);
  }
}

if (process.argv.length !== 3) {
  console.error("Usage: node rename-js-to-mjs.js <path>");
  process.exit(1);
}
const dirPath = path.join(process.cwd(), process.argv[2]);
console.log("********** Renaming files in", dirPath);
renameFilesInDir(dirPath);
