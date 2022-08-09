// eslint-disable-next-line
const fs = require("fs");
// eslint-disable-next-line
const childProcess = require("child_process");

const pjPath = "package.json";
const pjBackupPath = "package.json.backup";

const pj = JSON.parse(fs.readFileSync(pjPath).toString());

// remove dependencies as only json files are published
delete pj.dependencies;
delete pj.devDependencies;

// remove scripts for privacy only
delete pj.scripts;

// backup package.json and write the stripped version
fs.renameSync(pjPath, pjBackupPath);
fs.writeFileSync(pjPath, JSON.stringify(pj, null, 2));

try {
  childProcess.execFileSync("npm", ["publish"]);
  console.log(`\nPublished.\n`);
} catch (err) {
  console.error(
    `\nFailed to publish module (are you logged into npm with ` +
      `the correct user?): ${err}`
  );
} finally {
  // restore package.json
  fs.renameSync(pjBackupPath, pjPath);
}