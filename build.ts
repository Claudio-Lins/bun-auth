await Bun.build({
  entrypoints: ["src/index.ts"],

  // 🔥 REMOVIDO: outdir
  // outdir: "./build",

  target: "bun",

  minify: {
    whitespace: true,
    syntax: true,
    identifiers: true,
    keepNames: true,
  },

  compile: {
    target: "bun-linux-x64",

    // ✅ Caminho ABSOLUTO e EXPLÍCITO
    outfile: "./build/server",
  },
})

export { }
