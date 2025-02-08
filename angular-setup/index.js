#!/usr/bin/env node

import { execSync } from "child_process";
import inquirer from "inquirer";
import fs from "fs";

// Function to check if Angular CLI is installed
function isAngularCLIInstalled() {
    try {
        execSync("ng version", { stdio: "ignore" });
        return true;
    } catch (error) {
        return false;
    }
}

// CLI Logic
async function setupProject() {
    try {
        // Check if Angular CLI is installed
        if (!isAngularCLIInstalled()) {
            console.log("\n⚠️ Angular CLI is not installed. Installing now...\n");
            execSync("npm install -g @angular/cli", { stdio: "inherit" });
            console.log("\n✅ Angular CLI installed successfully!\n");
        }

        // Ask for project name and CSS type
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "projectName",
                message: "Enter your Angular project name:",
                default: "my-angular-app",
            },
            {
                type: "list",
                name: "styleType",
                message: "Choose a CSS preprocessor:",
                choices: ["css", "scss", "sass", "less", "styl"],
                default: "css",
            }
        ]);

        const projectName = answers.projectName;
        const styleType = answers.styleType;

        console.log(`\n🚀 Creating Angular project: ${projectName} with ${styleType}...\n`);

        // Create Angular project with selected style
        execSync(`npx @angular/cli new ${projectName} --style=${styleType} --routing`, { stdio: "inherit" });

        // Move into the project directory
        process.chdir(projectName);

        console.log("\n🔧 Installing Tailwind CSS and PostCSS...\n");
        execSync("npm install tailwindcss @tailwindcss/postcss postcss --force", { stdio: "inherit" });

        console.log("\n🔧 Configuring PostCSS...\n");
        fs.writeFileSync(
            ".postcssrc.json",
            `{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}`
        );

        console.log("\n🔧 Configuring styles file to use Tailwind CSS...\n");

        // Get the correct style file path
        const stylesFile = `src/styles.${styleType}`;
        fs.writeFileSync(stylesFile, `@import "tailwindcss";`);

        console.log("\n✅ Tailwind CSS successfully configured in Angular!\n");

        // Ask if user wants to install Firebase
        const firebaseAnswer = await inquirer.prompt([
            {
                type: "confirm",
                name: "installFirebase",
                message: "Would you like to install Firebase?",
                default: false,
            }
        ]);

        if (firebaseAnswer.installFirebase) {
            console.log("\n🔥 Installing Firebase dependencies...\n");
            execSync("npm install firebase @angular/fire --force", { stdio: "inherit" });

            console.log("\n🔧 Configuring Firebase...\n");
            execSync("npx ng add @angular/fire", { stdio: "inherit" });

            console.log("\n✅ Firebase setup completed!\n");
        } else {
            console.log("\n⏩ Skipping Firebase setup.\n");
        }

        console.log("\n🎉 Your Angular project is ready! Run `cd " + projectName + " && ng serve` to start the project.\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

setupProject();
