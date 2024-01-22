#!/usr/bin/env node

const axios = require("axios");
const { Command } = require("commander");
const path = require("node:path");
const shell = require("shelljs");
const { version, name, description } = require("../package.json");
const program = new Command();

program.name(name).description(description).version(version);

program
  .command("fresh")
  .description("Clone the repo to specified path")
  .argument("<repo>", "repo EX: proxitystudios/typescript-starter")
  .argument("<path_to_clone>", "path to clone EX: path/to/clone'")
  .action(freshClone);

async function freshClone(repo, options) {
  if (!shell.which("git")) {
    shell.echo("fatal: Sorry, this script requires git");
    shell.exit(1);
  }

  const repoURI = `https://github.com/${repo}`;
  const pathToClone = path.resolve(options);

  try {
    await axios.get(`https://api.github.com/repos/${repo}`);
  } catch (error) {
    shell.echo(
      "fatal: Provided repo not exists or an unexpected error occured. Please try again..."
    );
    shell.exit(1);
  }

  shell.echo("info: Cloning repo to", pathToClone);
  if (shell.exec(`git clone ${repoURI} ${pathToClone}`).code !== 0) {
    shell.echo("fatal: Cannot clone repo");
    shell.exit(1);
  }
  shell.echo("info: Repo cloned");

  shell.cd(pathToClone);

  if (shell.rm("-rf", ".git/").code !== 0) {
    shell.echo("fatal: Cannot delete '.git' folder");
    shell.exit(1);
  }

  shell.echo("info: Initializing git");
  if (shell.exec("git init").code !== 0) {
    shell.echo("fatal: Git add failed");
    shell.exit(1);
  }
  if (shell.exec("git add .").code !== 0) {
    shell.echo("fatal: Git add failed");
    shell.exit(1);
  }

  if (shell.exec(`git commit -am "Auto-commit by Freshland"`).code !== 0) {
    shell.echo("fatal: Git commit failed");
    shell.exit(1);
  }

  shell.ls("package.json").forEach(function (file) {
    shell.sed(
      "-i",
      /"name":\s*"(.*?)"/gi,
      `"name": "${options.replaceAll("/", "-")}"`,
      file
    );
    shell.sed("-i", /"version":\s*"(.*?)"/gi, `"version": "1.0.0"`, file);
  });
  shell.ls("package-lock.json").forEach(function (file) {
    shell.sed(
      "-i",
      /"name":\s*"(.*?)"/i,
      `"name": "${options.replaceAll("/", "-")}"`,
      file
    );
    shell.sed("-i", /"version":\s*"(.*?)"/i, `"version": "1.0.0"`, file);
  });

  // TODO: install deps automaticly (support npm, pnpm & yarn)
  // TODO: open vscode when its done
  shell.echo("IMPORTANT - You need to install dependencies - IMPORTANT");

  shell.echo("You are ready to go!");
}

program.parse();
