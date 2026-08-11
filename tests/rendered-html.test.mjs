import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const htmlUrl = new URL("../dist/client/index.html", import.meta.url);

test("exporte une page statique complète pour GitHub Pages", async () => {
  const html = await readFile(htmlUrl, "utf8");

  assert.match(html, /<html[^>]+lang=["']fr["']/i);
  assert.match(html, /Retraites, autrement/);
  assert.match(html, /Garantir/);
  assert.match(html, /Contribuer/);
  assert.match(html, /Posséder/);
  assert.match(html, /Laboratoire des paramètres/);
  assert.match(html, /Agirc-Arrco/);
  assert.match(html, /Questions ouvertes/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("embarque les ressources de publication", async () => {
  await Promise.all([
    access(new URL("../dist/client/og.png", import.meta.url)),
    access(new URL("../dist/client/.nojekyll", import.meta.url)),
    access(new URL("../.github/workflows/deploy-pages.yml", import.meta.url)),
  ]);

  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(layout, /metadataBase/);
  assert.match(layout, /og\.png/);
  assert.match(page, /Ce laboratoire n’est pas une simulation actuarielle/);
  assert.match(page, /Les 17 chapitres de la doctrine/);
});

test("conserve le document source dans le projet", async () => {
  const doctrine = await readFile(
    new URL("Note interne — Doctrine retraites.md", projectRoot),
    "utf8",
  );
  assert.match(doctrine, /# \*\*Note interne — Doctrine retraites\*\*/);
  assert.match(doctrine, /# \*\*17\\\. Ligne politique recommandée\*\*/);
});
