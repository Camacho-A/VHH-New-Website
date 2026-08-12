// Minimal Wix Ricos rich-content -> flat block list, matching the block model
// design_handoff_vhh_website/design-source/Blog Post.dc.html renders (heading / paragraph /
// bullet / pull-quote / table) — its own comment says as much: "In the Wix build these come
// from @wix/blog; the rich-text body maps onto these block types." Wix Blog posts store body
// content as a node tree (the `richContent` field, requires the RICH_CONTENT fieldset on
// posts.getPostBySlug) rather than as HTML, so this walks that tree once into the shape
// src/pages/blog/[slug].astro renders.
//
// Deliberately narrow: only the node types the design's block model has a renderer for
// (HEADING, PARAGRAPH, BULLETED_LIST/ORDERED_LIST, BLOCKQUOTE, TABLE) are mapped. Other Ricos
// node types (IMAGE, VIDEO, DIVIDER, GALLERY, embeds, ...) are skipped rather than guessed
// at — the design source doesn't spec a treatment for them, and a real post using one is rare
// enough to handle as a follow-up once it happens, not invent a look for now.

export type RichBlock =
  | { kind: "heading"; text: string }
  | { kind: "para"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "pull"; text: string }
  | { kind: "table"; headers: string[]; rows: string[][] };

// A trimmed-down shape of @wix/blog's Ricos `Node` — only what extractText/parseRichContent
// read. The real SDK type is far larger (every plugin's data payload); typing against it
// directly would require importing @wix/blog into this file just for its Node interface.
interface RicosNode {
  type?: string;
  nodes?: RicosNode[];
  textData?: { text?: string };
}

interface RicosDocument {
  nodes?: RicosNode[];
}

/** Concatenates every TEXT descendant's string, ignoring decorations (bold/italic/links/etc.
 * — the design's block model doesn't distinguish those, just plain text per block). */
function extractText(node: RicosNode | undefined): string {
  if (!node) return "";
  if (node.type === "TEXT") return node.textData?.text ?? "";
  return (node.nodes ?? []).map(extractText).join("");
}

/** First TABLE_ROW is treated as the header row — Ricos tables don't flag this explicitly
 * (no per-row "is header" field), so this follows the common authoring convention of
 * "first row = column labels," same as the design's own hardcoded table. */
function parseTable(node: RicosNode): RichBlock {
  const rows = (node.nodes ?? [])
    .filter((row) => row.type === "TABLE_ROW")
    .map((row) => (row.nodes ?? []).filter((cell) => cell.type === "TABLE_CELL").map((cell) => extractText(cell).trim()));
  const [headers, ...body] = rows;
  return { kind: "table", headers: headers ?? [], rows: body };
}

export function parseRichContent(richContent: RicosDocument | null | undefined): RichBlock[] {
  const blocks: RichBlock[] = [];

  for (const node of richContent?.nodes ?? []) {
    switch (node.type) {
      case "HEADING": {
        const text = extractText(node).trim();
        if (text) blocks.push({ kind: "heading", text });
        break;
      }
      case "PARAGRAPH": {
        const text = extractText(node).trim();
        if (text) blocks.push({ kind: "para", text });
        break;
      }
      case "BULLETED_LIST":
      case "ORDERED_LIST": {
        for (const item of node.nodes ?? []) {
          const text = extractText(item).trim();
          if (text) blocks.push({ kind: "bullet", text });
        }
        break;
      }
      case "BLOCKQUOTE": {
        const text = extractText(node).trim();
        if (text) blocks.push({ kind: "pull", text });
        break;
      }
      case "TABLE": {
        const table = parseTable(node);
        if (table.kind === "table" && (table.headers.length || table.rows.length)) blocks.push(table);
        break;
      }
      default:
        break;
    }
  }

  return blocks;
}

/** Fallback for posts with no (or empty) rich content — splits plain contentText into
 * paragraph blocks, same treatment this page used before rich-content parsing existed. */
export function paragraphsToBlocks(contentText: string | null | undefined): RichBlock[] {
  return (contentText ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ kind: "para" as const, text }));
}
