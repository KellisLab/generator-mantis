"use strict";
const path = require("path");
const fs = require("fs");
const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.sourceRoot(path.join(__dirname, "../app/templates"));
  }

  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "panelId",
        message: "New panel id",
        default: "tools"
      },
      {
        type: "input",
        name: "panelTitle",
        message: "Panel title",
        default: "Tools"
      }
    ]).then(props => {
      this.props = props;
    });
  }

  writing() {
    const manifestPath = this.destinationPath("mantis.extension.json");
    if (!fs.existsSync(manifestPath)) {
      this.env.error(
        "No mantis.extension.json here. Run `yo mantis` in an empty folder first."
      );
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const { panelId, panelTitle } = this.props;

    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(panelId)) {
      throw new Error(`Invalid panel id "${panelId}"`);
    }

    if (manifest.contributes.panels.some(panel => panel.id === panelId)) {
      throw new Error(`Panel id "${panelId}" already exists.`);
    }

    const entry = `panel/${panelId}.js`;
    manifest.contributes.panels.push({
      id: panelId,
      title: panelTitle,
      entry,
      scripts: [],
      styles: []
    });

    const ev = `onPanel:${panelId}`;
    if (!manifest.activationEvents.includes(ev)) {
      manifest.activationEvents.push(ev);
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    this.fs.copyTpl(
      this.templatePath("panel-main.js"),
      this.destinationPath(entry),
      {
        ...this.props,
        id: manifest.id,
        panelId,
        panelTitle
      }
    );
  }
};
