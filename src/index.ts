#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2)).options({
  g: { type: "boolean", default: false, description: "Target packages installed globally" },
  f: { type: "boolean", default: false, description: "Force updates of packages to the latest version" },
}).parseSync();

// Main function to perform the tasks
async function main() {

  // console.log("argv:", argv);

  const arg: string = String(argv._[0] ?? ""); // process.argv[2];
  if (!arg) {
    console.error('Please provide a scope as a CLI argument.');
    process.exit(1);
  }

  const scope = arg.startsWith("@") ? arg : `@${arg}`;

  if (argv.g) {

    try {
      const globalPackages = await getGlobalNpmPackages();
      const scopedPackages = globalPackages.filter(p => p.startsWith(scope));
      await updatePackages(scope, scopedPackages, { global: true, force: argv.f });
    } catch (error) {
      console.error(`Error:`, error);
    }

  } else {

    try {
      const scopedPackages = findLocalPackages(scope);
      await updatePackages(scope, scopedPackages, { force: argv.f });
    } catch (error) {
      console.error(`Error:`, error);
    }

  }

}
main();

function findLocalPackages(scope: string): string[] {

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const scopedPackages = Object.keys(dependencies).filter(dep => dep.startsWith(scope));

  return scopedPackages;
}

/**
 * Update packages with the given scope
 * @param scope 
 * @param dependencies 
 * @returns 
 */
async function updatePackages(scope: string, packages: string[], opts?: { global?: boolean, force?: boolean }): Promise<void> {

  const global = opts?.global === true;
  const force = opts?.force === true;

  // const packagesToUpdate = Object.keys(dependencies).filter(dep => dep.startsWith(scope));
  if (packages.length === 0) {
    console.log(`No packages found with the scope ${scope}`);
    return Promise.resolve();
  }

  const updateCommand = force
    ? `npm i ${global ? "-g" : ""} ${packages.map(p => p + "@latest").join(' ')}`
    : `npm update ${global ? "-g" : ""} ${packages.join(' ')}`;

  console.log(`${force ? "Forcefully updating" : "Updating"} ${global ? "global packages" : "packages"} with the scope ${scope}:`);
  console.log(packages);

  return new Promise((resolve, reject) => {
    exec(updateCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error updating packages: ${error.message}`);
        reject(error);
      } else {
        console.log(`Packages updated successfully:\n${stdout}`);
        resolve();
      }
    });
  });

}

function getGlobalNpmPackages(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec('npm list -g --depth=0 --json', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        try {
          const output = JSON.parse(stdout);
          const packages = Object.keys(output.dependencies);
          resolve(packages);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}
