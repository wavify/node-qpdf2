// Ignore errors about unsafe-arguments, this is because data is unknown
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { spawn } from "node:child_process";

export default (callArguments: string[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const process = spawn("qpdf", callArguments);
    const stdout: Buffer[] = [];
    const stderr: string[] = [];

    process.stdout.on("data", (data) => {
      stdout.push(data);
    });

    process.stderr.on("data", (data) => {
      /* c8 ignore next */
      stderr.push(data);
    });

    process.on("error", (error) => {
      /* c8 ignore next */
      reject(error);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdout));
        return;
      }

      // There is a problem from qpdf
      const errorString: string = Buffer.from(stderr.join("")).toLocaleString();
      if (errorString.includes("operation succeeded with warnings")) {
        // Ignore warnong case
        resolve(Buffer.concat(stdout));
      } else {
        reject(new Error(errorString));
      }
    });
  });
};
