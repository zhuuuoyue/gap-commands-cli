#!/usr/bin/env node

import commandLineArgs, { OptionDefinition } from "command-line-args";

import { load_author_info, write_author_info, get_author_config_path } from "./author";

function help() {
  console.log(`用法: create-config option value
设置作者信息.

选项:
  --help            打印帮助信息
  --owner           [可选] 设置作者
  --co-owner        [可选] 设置协作者
  --list            [可选] 打印作者信息

示例:
create-config --help
create-config --owner tom
create-config --owner tom --co-owner jerry
create-config --list
`);
}

const KEY_HELP = "help";
const KEY_OWNER = "owner";
const KEY_CO_OWNER = "co-owner";
const KEY_LIST = "list";

const options: OptionDefinition[] = [
  { name: KEY_HELP, type: Boolean },
  { name: KEY_OWNER, type: String },
  { name: KEY_CO_OWNER, type: String },
  { name: KEY_LIST, type: Boolean, defaultValue: false },
];

const args = commandLineArgs(options, {
  argv: process.argv,
});

if (args[KEY_HELP]) {
  help();
} else {
  let author_info = load_author_info();
  let changed = false;
  if (args[KEY_OWNER]) {
    author_info.owner = args[KEY_OWNER];
    changed = true;
  }
  if (args[KEY_CO_OWNER]) {
    author_info.co_owner = args[KEY_CO_OWNER];
    changed = true;
  }
  if (changed) {
    write_author_info(author_info);
    console.log("Author information has been changed!");
  }
  if (args[KEY_LIST]) {
    const author_info = load_author_info();
    console.log(`Author info: ${get_author_config_path()}
  Owner: ${author_info.owner}
  Co-Owner: ${author_info.co_owner}
`);
  }
}
