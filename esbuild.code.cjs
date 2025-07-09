// esbuild.code.js
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/code/code.ts"],
    bundle: true,
    outfile: "dist/code.js",
    minify: true,
    target: "es6",
  })
  .then(() => {
    console.log("✅ code.ts 빌드 완료");
  })
  .catch(() => process.exit(1));
