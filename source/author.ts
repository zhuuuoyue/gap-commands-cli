import path from "path";
import fs from "fs";

import { get_root_dir } from "./common";
import { is_file, is_directory, read_text_from_utf8_file, save_text_to_utf8_file } from "./utils";

export interface AuthorInfo {
  owner: string;
  co_owner: string;
}

export const DEFAULT_AUTHOR_INFO: AuthorInfo = {
  owner: "",
  co_owner: "",
};

export function get_author_config_path(): string {
  return path.join(get_root_dir(), "author_info.json");
}

export function write_author_info(author_info?: AuthorInfo) {
  if (typeof author_info === "undefined") {
    author_info = DEFAULT_AUTHOR_INFO;
  }
  const dir = get_root_dir();
  if (!is_directory(dir)) {
    fs.mkdirSync(dir);
  }
  save_text_to_utf8_file(get_author_config_path(), JSON.stringify(author_info));
}

export function load_author_info(): AuthorInfo {
  const config_path = get_author_config_path();
  if (is_file(config_path)) {
    return JSON.parse(read_text_from_utf8_file(config_path)) as AuthorInfo;
  } else {
    return DEFAULT_AUTHOR_INFO;
  }
}
