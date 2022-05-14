import os from "os";
import path from "path";

export function get_root_dir(): string {
  return path.join(os.homedir(), ".gap_commands");
}
