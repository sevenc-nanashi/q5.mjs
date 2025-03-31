import fs from "node:fs/promises";
import { format as prettier } from "prettier";

async function main() {
  await fs.mkdir("dist", { recursive: true });

  console.log("Bundling q5.mjs...");
  await bundleQ5js();

  console.log("Bundling q5.d.ts...");
  await createQ5dts();
}
async function bundleQ5js() {
  const fileContents = await Promise.all(
    files.map((file) => fs.readFile(file, "utf-8")),
  );
  const combined = fileContents.join("") + "\nexport { Q5 };\n";

  await fs.writeFile("dist/q5.mjs", combined, "utf-8");
}

async function createQ5dts() {
  // This function replaces:
  // - Move everything under `declare global {}` to Q5 class
  // - Remove duplicated declarations, such as draw() an setup()
  // - Move `namespace Q5 {}` to the top

  let q5Dts = await fs.readFile("q5.d.ts", "utf-8");
  let q5OnlyDeclarations: string | undefined;
  q5Dts = q5Dts.replace(
    /class Q5 \{(.+?Q5;).+?\}\s+(?=namespace)/ms,
    (_match, actualQ5Class) => {
      q5OnlyDeclarations = actualQ5Class;
      return "";
    },
  );
  if (!q5OnlyDeclarations) {
    throw new Error("Could not find class Q5");
  }
  q5Dts = q5Dts.replace(
    `declare global {`,
    `export class Q5 {${q5OnlyDeclarations}`,
  );
  let q5Namespace: string | undefined;
  q5Dts = q5Dts.replace(/namespace Q5 \{.+?^\t\}/ms, (match) => {
    q5Namespace = match;
    return "";
  });
  if (!q5Namespace) {
    throw new Error("Could not find namespace Q5");
  }
  q5Dts = q5Dts.replace(/^\t(?:function|var|const|let) /gm, "");

  let classes: string[] = [];
  q5Dts = q5Dts.replace(/^\tclass \w+ \{.+?^\t\}/gms, (match) => {
    classes.push(match);
    return "";
  });

  q5Dts +=
    "export declare " + q5Namespace.replace(/\}$/, classes.join("\n") + "}");
  q5Dts = q5Dts.replace("export {}", "");

  await fs.writeFile(
    "dist/q5.d.ts",
    await prettier(q5Dts, {
      parser: "typescript",
      printWidth: 80,
      trailingComma: "all",
    }),
    "utf-8",
  );
}

const files = [
  "src/q5-core.js",
  "src/q5-canvas.js",
  "src/q5-c2d-canvas.js",
  "src/q5-c2d-shapes.js",
  "src/q5-c2d-image.js",
  "src/q5-c2d-soft-filters.js",
  "src/q5-c2d-text.js",
  "src/q5-color.js",
  "src/q5-display.js",
  "src/q5-dom.js",
  "src/q5-fes.js",
  "src/q5-input.js",
  "src/q5-math.js",
  "src/q5-record.js",
  "src/q5-sound.js",
  "src/q5-util.js",
  "src/q5-vector.js",
  "src/q5-webgpu-canvas.js",
  "src/q5-webgpu-shapes.js",
  "src/q5-webgpu-image.js",
  "src/q5-webgpu-text.js",
  "src/q5-webgpu-shaders.js",
];

await main();
