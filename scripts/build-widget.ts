import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const outDir = path.join(process.cwd(), "public", "widget");
const outfile = path.join(outDir, "checkout-optimizer.sdk.js");

async function build() {
  fs.mkdirSync(outDir, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(process.cwd(), "src", "widget", "sdk.ts")],
    outfile,
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2020"],
    platform: "browser",
    legalComments: "none",
  });

  const stat = fs.statSync(outfile);
  console.log(
    `Widget SDK built → public/widget/checkout-optimizer.sdk.js (${Math.round(stat.size / 1024)}kb)`,
  );
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
