import JSZip from "jszip";

import type { EpubInspection } from "./kindle";

const CONTENT_EXTENSIONS = [".xhtml", ".html", ".htm"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

function stripMarkup(value: string) {
  const document = new DOMParser().parseFromString(value, "text/html");
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export async function inspectEpub(blob: Blob): Promise<EpubInspection> {
  const findings: string[] = [];

  try {
    const zip = await JSZip.loadAsync(blob);
    const names = Object.keys(zip.files);
    const mimetype = zip.file("mimetype");
    const mimetypeValue = mimetype ? (await mimetype.async("text")).trim() : "";
    const validPackage =
      mimetypeValue === "application/epub+zip" &&
      names.some((name) => name.toLowerCase() === "meta-inf/container.xml");
    const contentNames = names.filter((name) =>
      CONTENT_EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension)),
    );
    const imageCount = names.filter((name) =>
      IMAGE_EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension)),
    ).length;
    const hasNavigation = names.some((name) => {
      const lower = name.toLowerCase();
      return lower.endsWith(".ncx") || lower.endsWith("nav.xhtml") || lower.endsWith("nav.html");
    });

    const documents = await Promise.all(
      contentNames.map(async (name) => stripMarkup(await zip.file(name)!.async("text"))),
    );
    const text = documents.join(" ");
    const textCharacters = text.replace(/\s/g, "").length;
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

    if (!validPackage) findings.push("O pacote nao possui a estrutura basica de um EPUB valido.");
    if (textCharacters < 1000) {
      findings.push("Quase nenhum texto foi encontrado; o livro pode ter virado apenas imagens.");
    }
    if (!hasNavigation) findings.push("Nenhum indice de navegacao EPUB foi encontrado.");
    if (imageCount > 0 && textCharacters < imageCount * 80) {
      findings.push(
        "A proporcao de imagens para texto indica uma conversao possivelmente quebrada.",
      );
    }
    if (contentNames.length === 0) findings.push("O EPUB nao possui documentos HTML de leitura.");

    const verdict =
      !validPackage || textCharacters < 1000 || contentNames.length === 0
        ? "fail"
        : !hasNavigation
          ? "warning"
          : "pass";

    if (verdict === "pass") {
      findings.push("Texto refluivel e indice detectados. Ainda revise no Kindle Previewer.");
    }

    return {
      validPackage,
      hasNavigation,
      textCharacters,
      wordCount,
      documentCount: contentNames.length,
      imageCount,
      verdict,
      findings,
      inspectedAt: new Date().toISOString(),
    };
  } catch {
    return {
      validPackage: false,
      hasNavigation: false,
      textCharacters: 0,
      wordCount: 0,
      documentCount: 0,
      imageCount: 0,
      verdict: "fail",
      findings: ["O arquivo nao pode ser aberto como EPUB. Ele pode estar corrompido."],
      inspectedAt: new Date().toISOString(),
    };
  }
}
