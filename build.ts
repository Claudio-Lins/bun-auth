// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:1',message:'Build script started',data:{cwd:process.cwd()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:2',message:'Before build - checking if build dir exists',data:{buildDirExists:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Criar diretório build se não existir
try {
  await Bun.$`mkdir -p ./build`.quiet();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:8',message:'Build directory created/verified',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
} catch (err) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:12',message:'Error creating build directory',data:{error:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:16',message:'Starting Bun.build',data:{outdir:'./build',entrypoints:['src/index.ts']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

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
    target: "bun-linux-x64",
  },
})

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:42',message:'Build completed',data:{success:result.success,outputs:result.outputs?.length,outputPaths:result.outputs?.map((o:any)=>o.path)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

if (!result.success) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:46',message:'Build failed',data:{outputs:result.outputs?.map((o:any)=>({path:o.path,kind:o.kind}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  console.error("Build failed");
  console.error("Outputs:", result.outputs);
  process.exit(1);
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:52',message:'Checking build outputs',data:{outputs:result.outputs?.map((o:any)=>({path:o.path,kind:o.kind}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

// Quando usamos compile, o Bun gera o arquivo com o nome baseado no entrypoint
// Precisamos encontrar o arquivo gerado e renomeá-lo para 'server'
const buildOutput = result.outputs?.[0];
if (!buildOutput) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:60',message:'No output file generated',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  console.error("No output file generated");
  process.exit(1);
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:66',message:'Found output file',data:{outputPath:buildOutput.path,kind:buildOutput.kind},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

// O arquivo gerado pode ser 'build/index' ou 'build/index.js' ou similar
// Vamos movê-lo para 'build/server'
const generatedPath = buildOutput.path;
const targetPath = "./build/server";

// Verificar se o arquivo gerado existe
const generatedExists = await Bun.file(generatedPath).exists();
// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:75',message:'Checking generated file',data:{generatedPath,generatedExists,targetPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

if (!generatedExists) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:79',message:'Generated file not found',data:{generatedPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  console.error(`Generated file not found at ${generatedPath}`);
  process.exit(1);
}

// Se o arquivo já está no local correto, não precisa mover
if (generatedPath !== targetPath) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:87',message:'Moving file to target location',data:{from:generatedPath,to:targetPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
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
// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:99',message:'Final file check',data:{targetPath,finalExists},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

if (!finalExists) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:103',message:'Target file not found after move',data:{targetPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  console.error(`Target file not found at ${targetPath}`);
  process.exit(1);
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:68',message:'Build script completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

export { };

