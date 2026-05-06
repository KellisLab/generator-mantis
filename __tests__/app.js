"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-mantis:app", () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, "../generators/app")).withPrompts({
      id: "com.test.ext",
      name: "Test Ext",
      version: "0.0.1",
      description: "test",
      publisher: "",
      homepage: "",
      panelId: "main",
      panelTitle: "Main",
      includeBackend: false,
      permissions: ["maps:read", "selection:read", "panels:write"]
    });
  });

  it("creates expected files", () => {
    assert.file([
      "mantis.extension.json",
      "extension.js",
      "panel/main.js",
      "pack-bundle.cjs"
    ]);
  });

  it("writes valid panel path in manifest", () => {
    assert.fileContent("mantis.extension.json", '"entry": "panel/main.js"');
  });
});
