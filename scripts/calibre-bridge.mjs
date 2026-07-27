import { spawn } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";

const HOST = "127.0.0.1";
const PORT = Number(process.env.KOS_CALIBRE_BRIDGE_PORT || 43117);
const MAX_BODY_SIZE = 250 * 1024 * 1024;
const COMMON_PATHS = [
  process.env.CALIBRE_EBOOK_CONVERT,
  "C:\\Program Files\\Calibre2\\ebook-convert.exe",
  "C:\\Program Files (x86)\\Calibre2\\ebook-convert.exe",
  "ebook-convert",
].filter(Boolean);

async function findCalibre() {
  for (const candidate of COMMON_PATHS) {
    if (candidate === "ebook-convert") {
      try {
        await run(candidate, ["--version"]);
        return candidate;
      } catch {
        continue;
      }
    }
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known installation path.
    }
  }
  return null;
}

function cors(request, response) {
  const origin = request.headers.origin ?? "";
  if (/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Cache-Control", "no-store");
}

function json(request, response, status, value) {
  cors(request, response);
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) throw new Error("Arquivo maior que o limite local de 250 MB.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, shell: false });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.stderr.on("data", (chunk) => (output += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output.trim() || `Calibre encerrou com codigo ${code}.`));
    });
  });
}

const server = createServer(async (request, response) => {
  cors(request, response);
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    const executable = await findCalibre();
    json(request, response, 200, {
      online: true,
      calibreFound: Boolean(executable),
      executable,
      version: 1,
    });
    return;
  }

  if (request.method !== "POST" || request.url !== "/convert") {
    json(request, response, 404, { message: "Rota nao encontrada." });
    return;
  }

  const calibre = await findCalibre();
  if (!calibre) {
    json(request, response, 503, {
      message:
        "ebook-convert nao encontrado. Instale o Calibre 64 ou configure CALIBRE_EBOOK_CONVERT.",
    });
    return;
  }

  let workdir;
  try {
    const body = await readBody(request);
    const webRequest = new Request("http://localhost/convert", {
      method: "POST",
      headers: request.headers,
      body,
    });
    const form = await webRequest.formData();
    const source = form.get("file");
    const target = form.get("target") === "azw3" ? "azw3" : "epub";
    if (!(source instanceof File)) throw new Error("Nenhum livro foi recebido.");

    workdir = await mkdtemp(join(tmpdir(), "kos-calibre-"));
    const safeBase = basename(source.name, extname(source.name)).replace(/[^a-zA-Z0-9._-]+/g, "-");
    const inputPath = join(workdir, `source${extname(source.name).toLowerCase()}`);
    const outputName = `${safeBase || "livro"}.${target}`;
    const outputPath = join(workdir, outputName);
    await writeFile(inputPath, Buffer.from(await source.arrayBuffer()));

    const args = [inputPath, outputPath, "--output-profile", "kindle_pw3"];
    const title = String(form.get("title") || "").trim();
    const author = String(form.get("author") || "").trim();
    if (title) args.push("--title", title);
    if (author) args.push("--authors", author);
    await run(calibre, args);

    const converted = await readFile(outputPath);
    response.writeHead(200, {
      "Content-Type": target === "epub" ? "application/epub+zip" : "application/octet-stream",
      "Content-Disposition": `attachment; filename="${outputName}"`,
      "X-KOS-Filename": encodeURIComponent(outputName),
    });
    response.end(converted);
  } catch (error) {
    json(request, response, 500, {
      message: error instanceof Error ? error.message : "A conversao falhou.",
    });
  } finally {
    if (workdir) await rm(workdir, { recursive: true, force: true }).catch(() => undefined);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`KOS Calibre Bridge: http://${HOST}:${PORT}`);
  console.log("Apenas esta maquina pode acessar o conversor.");
});
