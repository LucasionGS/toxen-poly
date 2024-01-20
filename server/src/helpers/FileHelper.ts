import fs from "fs";

namespace FileHelper {
  export async function pathExists(path: string) {
    // console.log(path);
    try {
      return await (fs.promises.stat(path).then(() => true).catch(() => false));
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default FileHelper;