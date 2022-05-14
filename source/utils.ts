import fs from "fs";
import path from "path";

export function save_text_to_utf8_file(filename: string, content: string) {
  fs.writeFileSync(filename, content, {
    encoding: "utf-8",
  });
}

export function save_text_to_utf8_with_bom_file(filename: string, content: string) {
  save_text_to_utf8_file(filename, `\uFEFF${content}`);
}

export function read_text_from_utf8_file(filename: string): string {
  return fs.readFileSync(filename, {
    encoding: "utf-8",
  });
}

export function is_file(filename: string): boolean {
  if (fs.existsSync(filename)) {
    const stats: fs.Stats = fs.statSync(filename);
    return stats.isFile();
  }
  return false;
}

export function is_directory(dir: string): boolean {
  if (fs.existsSync(dir)) {
    return fs.statSync(dir).isDirectory();
  }
  return false;
}

export function create_directory_if_not_exist(dir: string) {
  const parent = path.dirname(dir);
  if (!is_directory(parent)) {
    create_directory_if_not_exist(parent);
  }
  fs.mkdirSync(dir);
}
