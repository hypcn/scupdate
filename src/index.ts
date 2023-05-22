#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Function to check if a string starts with '@'
function startsWithAtSign(str: string): boolean {
  return str.startsWith('@');
}

// Function to update packages with the given scope
function updateScopedPackages(scope: string, dependencies: Record<string, string>): Promise<void> {
  const packagesToUpdate = Object.keys(dependencies).filter(dep => dep.startsWith(scope));
  if (packagesToUpdate.length === 0) {
    console.log(`No packages found with the scope ${scope}`);
    return Promise.resolve();
  }

  const updateCommand = `npm update ${packagesToUpdate.join(' ')}`;
  console.log(`Updating packages with the scope ${scope}:`);
  console.log(packagesToUpdate);

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

// Main function to perform the tasks
async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Please provide a scope as a CLI argument.');
    process.exit(1);
  }

  const scope = startsWithAtSign(arg) ? arg : '@' + arg;

  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    await updateScopedPackages(scope, dependencies);
  } catch (error) {
    console.error(`Error:`, error);
  }
}

main();
