import fs from "fs";

namespace FileHelper {
  export async function pathExists(path: string) {
    return await fs.promises.stat(path).then(() => true).catch(() => false)
  }
}

export default FileHelper;