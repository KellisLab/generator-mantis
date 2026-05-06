"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

const ID_RE = /^[a-z0-9][a-z0-9._-]*$/i;

module.exports = class extends Generator {
  prompting() {
    this.log(yosay(`Create a ${chalk.cyan("Mantis")} extension bundle`));

    return this.prompt([
      {
        type: "input",
        name: "id",
        message: "Extension id (reverse-DNS style)",
        default: "com.example.hello"
      },
      {
        type: "input",
        name: "name",
        message: "Display name",
        default: "Hello Mantis"
      },
      {
        type: "input",
        name: "version",
        message: "Version",
        default: "0.1.0"
      },
      {
        type: "input",
        name: "description",
        message: "Description",
        default: "Mantis extension with extension host entry and one panel."
      },
      {
        type: "input",
        name: "publisher",
        message: "Publisher (optional)",
        default: ""
      },
      {
        type: "input",
        name: "homepage",
        message: "Homepage URL (optional)",
        default: "https://home.withmantis.com"
      },
      {
        type: "input",
        name: "panelId",
        message: "First panel id",
        default: "main"
      },
      {
        type: "input",
        name: "panelTitle",
        message: "First panel title",
        default: "Hello"
      },
      {
        type: "confirm",
        name: "includeBackend",
        message: "Include sample Python backend (echo action)?",
        default: false
      },
      {
        type: "checkbox",
        name: "permissions",
        message: "Permissions",
        choices: [
          { name: "maps:read", value: "maps:read", checked: true },
          { name: "selection:read", value: "selection:read", checked: true },
          { name: "selection:write", value: "selection:write", checked: false },
          { name: "bags:write", value: "bags:write", checked: false },
          { name: "panels:write", value: "panels:write", checked: true },
          {
            name: "commands:execute",
            value: "commands:execute",
            checked: false
          },
          { name: "backend:invoke", value: "backend:invoke", checked: false }
        ]
      }
    ]).then(props => {
      this.props = props;
    });
  }

  writing() {
    const p = { ...this.props };
    if (!ID_RE.test(p.id)) {
      throw new Error(
        `Invalid extension id "${p.id}" (use letters, numbers, . _ - only).`
      );
    }

    const perms = new Set(p.permissions || []);
    if (p.includeBackend) {
      perms.add("backend:invoke");
    }

    const panelEntry = `panel/${p.panelId}.js`;
    const activationEvents = ["onStartup", `onPanel:${p.panelId}`];

    const manifest = {
      manifestVersion: 1,
      apiVersion: "1.0.0",
      id: p.id,
      name: p.name,
      version: p.version,
      description: p.description || undefined,
      main: "extension.js",
      activationEvents,
      permissions: [...perms],
      contributes: {
        panels: [
          {
            id: p.panelId,
            title: p.panelTitle,
            entry: panelEntry,
            scripts: [],
            styles: []
          }
        ],
        commands: [],
        menus: [],
        settings: {}
      }
    };

    if (p.publisher) {
      manifest.publisher = p.publisher;
    }

    if (p.homepage) {
      manifest.homepage = p.homepage;
    }

    if (p.includeBackend) {
      manifest.backend = {
        runtime: "python",
        entry: "backend/main.py",
        actions: ["echo"],
        network: false
      };
    }

    this.fs.writeJSON(
      this.destinationPath("mantis.extension.json"),
      manifest,
      null,
      2
    );
    this.fs.copyTpl(
      this.templatePath("extension.js"),
      this.destinationPath("extension.js"),
      {}
    );
    this.fs.copyTpl(
      this.templatePath("panel-main.js"),
      this.destinationPath(panelEntry),
      p
    );
    this.fs.copy(
      this.templatePath("pack-bundle.cjs"),
      this.destinationPath("pack-bundle.cjs")
    );
    if (p.includeBackend) {
      this.fs.copyTpl(
        this.templatePath("backend-main.py"),
        this.destinationPath("backend/main.py"),
        p
      );
    }
  }

  end() {
    this.log("");
    this.log(chalk.green("Next:"));
    this.log(
      `  ${chalk.cyan("node pack-bundle.cjs")}  → ${chalk.yellow(
        "package.mantisx"
      )} (zip) + ${chalk.yellow("bundle.json")} for Mantis import`
    );
    this.log(
      `  ${chalk.cyan(
        "yo mantis:panel"
      )}  → add another panel (from this folder)`
    );
  }
};
