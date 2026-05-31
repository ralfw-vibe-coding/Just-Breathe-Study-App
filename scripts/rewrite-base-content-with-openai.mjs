import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env");
const manualPath = path.join(projectRoot, "requirements", "Just Breathe Training Manual.txt");
const targetsPath = path.join(projectRoot, "requirements", "base-review-targets.json");
const contentDir = path.join(projectRoot, "requirements", "base-content");
const basePath = path.join(projectRoot, "runtime", "knowledge", "base.json");

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }

  const source = fs.readFileSync(filePath, "utf8");
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function parseArgs(argv) {
  const args = {
    apply: false,
    dryRun: false,
    ids: [],
    limit: null,
    model: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") {
      args.apply = true;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--ids") {
      args.ids = (argv[index + 1] || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }
    if (arg === "--limit") {
      const value = Number.parseInt(argv[index + 1] || "", 10);
      args.limit = Number.isFinite(value) ? value : null;
      index += 1;
      continue;
    }
    if (arg === "--model") {
      args.model = argv[index + 1] || null;
      index += 1;
    }
  }

  return args;
}

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (!value) {
    return "";
  }
  if (value.startsWith('"') || value.startsWith("[") || value.startsWith("{")) {
    return JSON.parse(value);
  }
  return value;
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return { attributes: {}, body: markdown.trim() };
  }

  const endIndex = markdown.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { attributes: {}, body: markdown.trim() };
  }

  const frontmatter = markdown.slice(4, endIndex);
  const body = markdown.slice(endIndex + 5).trim();
  const attributes = {};
  const lines = frontmatter.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):(?:\s+(.*))?$/);
    if (!match) {
      continue;
    }

    const [, rawKey, rawValue = ""] = match;
    const key = rawKey;

    if (!rawValue.trim()) {
      const items = [];
      while (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
        index += 1;
        items.push(lines[index].replace(/^\s*-\s+/, "").trim());
      }
      attributes[key] = items;
      continue;
    }

    attributes[key] = parseScalar(rawValue);
  }

  return { attributes, body };
}

function stringifyFrontmatter(attributes) {
  const lines = ["---"];
  const orderedKeys = [
    "id",
    "title",
    "overview",
    "related",
    "tags",
    "icon",
    "color",
    "contentMode",
  ];

  for (const key of orderedKeys) {
    if (!(key in attributes)) {
      continue;
    }

    const value = attributes[key];

    if (Array.isArray(value)) {
      if (!value.length) {
        continue;
      }
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
      continue;
    }

    if (value === "" || value == null) {
      continue;
    }

    if (typeof value === "string") {
      lines.push(`${key}: ${JSON.stringify(value)}`);
      continue;
    }

    lines.push(`${key}: ${JSON.stringify(value)}`);
  }

  lines.push("---");
  return `${lines.join("\n")}\n`;
}

function readCardFile(cardId, base) {
  const filePath = path.join(contentDir, `${cardId}.md`);
  if (!fs.existsSync(filePath)) {
    const fallbackCard = base.cards[cardId];
    if (!fallbackCard) {
      throw new Error(`Missing content file for ${cardId}: ${filePath}`);
    }

    return {
      filePath,
      attributes: {
        id: fallbackCard.id,
        title: fallbackCard.title,
        overview: fallbackCard.overview || "",
        related: fallbackCard.related || [],
      },
      body: fallbackCard.details || "",
      bootstrapped: true,
    };
  }
  const markdown = fs.readFileSync(filePath, "utf8");
  const parsed = parseFrontmatter(markdown);
  return { filePath, ...parsed, bootstrapped: false };
}

function writeCardFile(filePath, attributes, body) {
  const frontmatter = stringifyFrontmatter(attributes);
  const output = `${frontmatter}${body ? `\n${body.trim()}\n` : "\n"}`;
  fs.writeFileSync(filePath, output);
}

function buildLineIndex(text) {
  return text.split("\n");
}

function excerptForSearchTerm(lines, term, radius = 10) {
  const excerpts = [];
  const lowerTerm = term.toLowerCase();

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].toLowerCase().includes(lowerTerm)) {
      continue;
    }
    const start = Math.max(0, index - radius);
    const end = Math.min(lines.length, index + radius + 1);
    excerpts.push({
      term,
      line: index + 1,
      text: lines.slice(start, end).join("\n").trim(),
    });
  }

  return excerpts;
}

function uniqueExcerpts(excerpts, max = 12) {
  const seen = new Set();
  const result = [];

  for (const excerpt of excerpts) {
    const key = `${excerpt.line}:${excerpt.text}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(excerpt);
    if (result.length >= max) {
      break;
    }
  }

  return result;
}

function getCardContext(cardId, base) {
  const card = base.cards[cardId];
  if (!card) {
    return null;
  }

  return {
    id: card.id,
    title: card.title,
    children: card.children.map((childId) => ({
      id: childId,
      title: base.cards[childId]?.title || childId,
    })),
    related: card.related.map((relatedId) => ({
      id: relatedId,
      title: base.cards[relatedId]?.title || relatedId,
    })),
  };
}

async function callOpenAI({ apiKey, model, prompt }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "card_rewrite",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              overview: { type: "string" },
              details: { type: "string" }
            },
            required: ["overview", "details"]
          }
        }
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const raw =
    data.output_text ||
    data.output?.[0]?.content?.find((item) => item.type === "output_text")?.text ||
    "";

  if (!raw) {
    throw new Error("OpenAI response did not contain output_text.");
  }

  return JSON.parse(raw);
}

function buildPrompt({ target, cardContext, currentCard, excerpts }) {
  const childSummary = cardContext.children.length
    ? cardContext.children.map((child) => `- ${child.id} — ${child.title}`).join("\n")
    : "- none";

  const relatedSummary = cardContext.related.length
    ? cardContext.related.map((item) => `- ${item.id} — ${item.title}`).join("\n")
    : "- none";

  const excerptText = excerpts.length
    ? excerpts
        .map(
          (excerpt, index) =>
            `Excerpt ${index + 1} (match: ${excerpt.term}, line ${excerpt.line})\n${excerpt.text}`,
        )
        .join("\n\n")
    : "No excerpt matches were found. Use the current card cautiously and do not invent specifics.";

  return [
    {
      role: "system",
      content:
        "You are rewriting one knowledge-base card for the Just Breathe course. Use only the supplied manual excerpts and the stated hierarchy context. Write as a clear teacher would explain the concept or practice. Never mention cards, sections, the manual, source material, or editing process. Avoid meta language. Avoid repeating the title in overview and details unless absolutely necessary. Overviews must be short. Details should be concrete, structured, and specific. If the card has no child cards, details should carry real substance. If the card does have child cards, details may explain the grouping and purpose of the category without restating child titles unnecessarily.",
    },
    {
      role: "user",
      content: [
        `Card ID: ${target.id}`,
        `Title: ${cardContext.title}`,
        `Notes: ${target.notes || "none"}`,
        `Children:\n${childSummary}`,
        `Related:\n${relatedSummary}`,
        `Current overview:\n${currentCard.attributes.overview || ""}`,
        `Current details:\n${currentCard.body || ""}`,
        `Source excerpts:\n${excerptText}`,
        "Write JSON with keys overview and details only.",
        "Requirements:",
        "- overview: one short sentence",
        "- details: detailed, well structured markdown-friendly plain text",
        "- no meta statements",
        "- no filler",
        "- if it is a protocol, explain its purpose and how the child techniques work together",
        "- if it is a meditation category, explain what defines that category and what kind of practices belong there",
        "- if it is a concept pair or comparison, explain the distinction clearly",
      ].join("\n\n"),
    },
  ];
}

const env = {
  ...loadEnv(envPath),
  ...process.env,
};

const args = parseArgs(process.argv.slice(2));
const manualLines = buildLineIndex(fs.readFileSync(manualPath, "utf8"));
const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const base = JSON.parse(fs.readFileSync(basePath, "utf8"));

let selectedTargets = targets;
if (args.ids.length) {
  const wanted = new Set(args.ids);
  selectedTargets = targets.filter((target) => wanted.has(target.id));
}
if (Number.isFinite(args.limit) && args.limit > 0) {
  selectedTargets = selectedTargets.slice(0, args.limit);
}

if (!selectedTargets.length) {
  console.log("No targets selected.");
  process.exit(0);
}

const apiKey = env.OPENAI_API_KEY;
const model = args.model || env.OPENAI_MODEL || "gpt-5.4-mini";

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing.");
}

console.log(`Reviewing ${selectedTargets.length} card(s) with model ${model}.`);
console.log(args.apply ? "Mode: apply" : "Mode: dry-run");

let processed = 0;
for (const target of selectedTargets) {
  processed += 1;
  const currentCard = readCardFile(target.id, base);
  const cardContext = getCardContext(target.id, base);

  if (!cardContext) {
    throw new Error(`Card ${target.id} is missing from runtime/knowledge/base.json`);
  }

  const excerpts = uniqueExcerpts(
    target.searchTerms.flatMap((term) => excerptForSearchTerm(manualLines, term)),
  );

  console.log(`[${processed}/${selectedTargets.length}] ${target.id}`);
  console.log(`  excerpts: ${excerpts.length}`);
  if (currentCard.bootstrapped) {
    console.log("  source: bootstrapped from current base.json");
  }

  const prompt = buildPrompt({ target, cardContext, currentCard, excerpts });
  const rewrite = await callOpenAI({ apiKey, model, prompt });

  if (!rewrite.overview?.trim() || !rewrite.details?.trim()) {
    throw new Error(`Model returned empty content for ${target.id}`);
  }

  if (args.apply) {
    const nextAttributes = {
      ...currentCard.attributes,
      title: currentCard.attributes.title || cardContext.title,
      overview: rewrite.overview.trim(),
    };

    writeCardFile(currentCard.filePath, nextAttributes, rewrite.details.trim());
    console.log("  wrote file");
  } else {
    console.log("  --- title ---");
    console.log(`  ${cardContext.title}`);
    console.log("  --- overview ---");
    console.log(rewrite.overview.trim());
    console.log("  --- details ---");
    console.log(rewrite.details.trim());
  }
}

console.log("Done.");
