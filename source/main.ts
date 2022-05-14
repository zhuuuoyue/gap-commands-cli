#!/usr/bin/env node

import path from "path";

import commandLineArgs, { OptionDefinition } from "command-line-args";

import { read_text_from_utf8_file } from "./utils";

function version() {
  const package_path = path.join(path.dirname(__dirname), "package.json");
  console.log(JSON.parse(read_text_from_utf8_file(package_path))["version"]);
}

const KEY_VERSION = "version";
const options: OptionDefinition[] = [{ name: KEY_VERSION, type: Boolean, defaultOption: false }];
const args = commandLineArgs(options, {
  argv: process.argv,
});
if (args[KEY_VERSION]) {
  version();
}