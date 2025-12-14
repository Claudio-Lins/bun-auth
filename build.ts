// Criar diretório build se não existir
try {
  await Bun.$`mkdir -p ./build`.quiet();
} catch (err) {
  // Ignorar erro se o diretório já existir
}

// Detectar arquitetura do sistema
const arch = process.arch;
const platform = process.platform;

// Mapear arquitetura do Node para target do Bun
let compileTarget: "bun-linux-x64" | "bun-linux-arm64";
if (platform === "linux") {
  if (arch === "x64") {
    compileTarget = "bun-linux-x64";
  } else if (arch === "arm64") {
    compileTarget = "bun-linux-arm64";
  } else {
    // Fallback para x64 se arquitetura não suportada
    compileTarget = "bun-linux-x64";
  }
} else {
  // Fallback para linux-x64 se não for Linux
  compileTarget = "bun-linux-x64";
}

console.log(`Building for architecture: ${arch} (${platform}) -> ${compileTarget}`);

const result = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "./build",
  target: "bun",
  minify: {
    whitespace: true,
    syntax: true,
    identifiers: true,
    keepNames: true,
  },
  compile: {
    target: compileTarget,
  },
})

if (!result.success) {
  console.error("Build failed");
  console.error("Outputs:", result.outputs);
  process.exit(1);
}

// Quando usamos compile, o Bun gera o arquivo com o nome baseado no entrypoint
// Precisamos encontrar o arquivo gerado e renomeá-lo para 'server'
const buildOutput = result.outputs?.[0];
if (!buildOutput) {
  console.error("No output file generated");
  process.exit(1);
}

// O arquivo gerado pode ser 'build/index' ou 'build/index.js' ou similar
// Vamos movê-lo para 'build/server'
const generatedPath = buildOutput.path;
const targetPath = "./build/server";

// Verificar se o arquivo gerado existe
const generatedExists = await Bun.file(generatedPath).exists();
if (!generatedExists) {
  console.error(`Generated file not found at ${generatedPath}`);
  process.exit(1);
}

// Se o arquivo já está no local correto, não precisa mover
if (generatedPath !== targetPath) {
  const file = Bun.file(generatedPath);
  await Bun.write(targetPath, file);
  // Remover o arquivo original se não for o mesmo
  try {
    await Bun.$`rm ${generatedPath}`.quiet();
  } catch (err) {
    // Ignorar erro ao remover
  }
}

// Verificar se o arquivo final existe
const finalExists = await Bun.file(targetPath).exists();
if (!finalExists) {
  console.error(`Target file not found at ${targetPath}`);
  process.exit(1);
}

export { };

