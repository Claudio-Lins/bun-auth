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
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:16',message:'Starting Bun.build',data:{outfile:'./build/server',entrypoints:['src/index.ts']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

const result = await Bun.build({
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

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:42',message:'Build completed',data:{success:result.success,outputs:result.outputs?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:52',message:'Checking if output file exists',data:{outputPath:'./build/server'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

// Verificar se o arquivo foi criado
const outputPath = "./build/server";
const fileExists = await Bun.file(outputPath).exists();
// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:57',message:'File existence check',data:{fileExists,outputPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion

if (!fileExists) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:60',message:'Output file not found after build',data:{outputPath,outputs:result.outputs?.map(o=>({path:o.path,kind:o.kind}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  console.error(`Output file not found at ${outputPath}`);
  console.error("Build outputs:", result.outputs?.map(o => ({ path: o.path, kind: o.kind })));
  process.exit(1);
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build.ts:68',message:'Build script completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

export { };

