import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outlinePath = path.join(projectRoot, "requirements", "gliederung.json");
const contentDir = path.join(projectRoot, "requirements", "base-content");
const outputPath = path.join(projectRoot, "runtime", "knowledge", "base.json");

const outline = JSON.parse(fs.readFileSync(outlinePath, "utf8"));

const rootConfig = {
  "Session Architecture": {
    color: "color_rose",
    icon: "icon_graduation_cap",
    discipline: "discipline_integrated",
  },
  Breathwork: {
    color: "color_blue",
    icon: "icon_wind",
    discipline: "discipline_breathwork",
  },
  "Breathwork Protocols": {
    color: "color_blue",
    icon: "icon_wind",
    discipline: "discipline_breathwork",
  },
  Meditation: {
    color: "color_indigo",
    icon: "icon_moon_star",
    discipline: "discipline_meditation",
  },
  "Deep Rest": {
    color: "color_emerald",
    icon: "icon_bed_double",
    discipline: "discipline_deep_rest",
  },
  "Preparatory & Support Practices": {
    color: "color_rose",
    icon: "icon_graduation_cap",
    discipline: "discipline_integrated",
  },
  "Full Practice Formats": {
    color: "color_rose",
    icon: "icon_graduation_cap",
    discipline: "discipline_integrated",
  },
  "Concept Cards": {
    color: "color_slate",
    icon: "icon_compass",
    discipline: "discipline_integrated",
  },
};

const idOverrides = {
  "Session Architecture": "session-architecture",
  Breathwork: "breathwork",
  "Breathwork Protocols": "breathwork-protocols",
  Meditation: "meditation",
  "Deep Rest": "deep-rest",
  "Preparatory & Support Practices": "preparatory-support-practices",
  "Full Practice Formats": "full-practice-formats",
  "Concept Cards": "concept-cards",
  "Breathwork > Breathwork Techniques > Down Regulation": "down-regulation-techniques",
  "Breathwork Protocols > NSRT Protocols > Down Regulation": "down-regulation-protocols",
  "Breathwork > Breathwork Techniques > Up Regulation": "up-regulation-techniques",
  "Breathwork Protocols > NSRT Protocols > Up Regulation": "up-regulation-protocols",
  "Meditation > Meditation Concepts": "meditation-concepts",
  "Concept Cards > Meditation Concepts": "concept-meditation-concepts",
  "Breathwork Protocols > NSRT Protocols > Balanced": "balanced-nsrt-protocols",
  "Breathwork Protocols > NSRT Protocols > Restorative": "restorative-nsrt-protocols",
  "Breathwork Protocols > NSRT Protocols > Up Regulation": "up-regulation-protocols",
  "Breathwork Protocols > NSRT Protocols > Down Regulation": "down-regulation-protocols",
  "Breathwork Protocols > NSRT Protocols > CTS — Circle / Triangle / Square":
    "cts-circle-triangle-square",
  "Breathwork Protocols > NSRT Protocols > 360° IPA": "360-ipa",
  "Full Practice Formats > Full Session Combinations > Breathwork + Meditation + Deep Rest":
    "breathwork-meditation-deep-rest",
  "Full Practice Formats > Full Session Combinations > Meditation + Deep Rest":
    "meditation-deep-rest",
  "Full Practice Formats > Full Session Combinations > NSRT + Meditation + Stillness":
    "nsrt-meditation-stillness",
  "Full Practice Formats > Full Session Combinations > Gentle 10 + Exhale": "gentle-10-exhale",
  "Concept Cards > Core Practice Concepts > Close your eyes, be still, just breathe":
    "close-your-eyes-be-still-just-breathe",
  "Concept Cards > Core Practice Concepts > Notice what you notice, feel what you feel":
    "notice-what-you-notice-feel-what-you-feel",
  "Concept Cards > Stress & Rest Concepts > Stimulus → Response Gap": "stimulus-response-gap",
  "Meditation > Meditation Concepts > Acknowledge, don’t indulge": "acknowledge-dont-indulge",
};

const mergeByTitle = {
  "4-Part Breathing Architecture": "4-part-breathing-architecture",
  "6 Phases of Non-doing": "6-phases-of-non-doing",
  "Active / Passive / Recovery Breathing": "active-passive-recovery-breathing",
  "Being Technique": "being-technique",
  "Down Regulation / Up Regulation": "down-regulation-up-regulation",
  "Established in Being": "established-in-being",
  "Focused Intention": "focused-intention",
  "Present Moment Awareness": "present-moment-awareness",
  "Quality / Quantity / Capacity Axis": "quality-quantity-capacity-axis",
  "Witness State": "witness-state",
};

const forcedConceptTitles = new Set([
  "Systematic Breathwork",
  "Experiential Breathwork",
  "3 Depths of Practice",
  "Quiet Practices",
]);

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
    const key = rawKey === "content_mode" ? "contentMode" : rawKey;

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

function loadCardContent(directory) {
  if (!fs.existsSync(directory)) {
    return {};
  }

  const entries = {};

  for (const entry of fs.readdirSync(directory)) {
    if (!entry.endsWith(".md")) {
      continue;
    }

    const fullPath = path.join(directory, entry);
    const markdown = fs.readFileSync(fullPath, "utf8");
    const { attributes, body } = parseFrontmatter(markdown);
    const id = attributes.id || path.basename(entry, ".md");

    entries[id] = {
      id,
      title: attributes.title || "",
      overview: attributes.overview || "",
      details: body,
      related: Array.isArray(attributes.related) ? attributes.related : [],
      tags: Array.isArray(attributes.tags) ? attributes.tags : [],
      icon: attributes.icon || "",
      color: attributes.color || "",
      contentMode: attributes.contentMode || "",
    };
  }

  return entries;
}

const cardContent = loadCardContent(contentDir);

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/°/g, "")
    .replace(/→/g, " ")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();
}

function pathKey(pathParts) {
  return pathParts.join(" > ");
}

function getCardId(pathParts, title) {
  const fullPath = pathKey([...pathParts, title]);
  if (idOverrides[fullPath]) {
    return idOverrides[fullPath];
  }
  if (idOverrides[title]) {
    return idOverrides[title];
  }
  if (mergeByTitle[title]) {
    return mergeByTitle[title];
  }
  return slugify(title);
}

function getRootTitle(pathParts, title) {
  return pathParts[0] || title;
}

function inferType(title, hasChildren, pathParts) {
  const lineage = [...pathParts, title].join(" ");
  if (hasChildren) {
    return "is_category";
  }
  if (forcedConceptTitles.has(title)) {
    return "is_concept";
  }
  if (/method|protocol/i.test(title)) {
    return "is_method";
  }
  if (/framework|architecture|foundations|concepts|mind|awareness|attention|intention|state|axis|pillar|container|signature|gap|being|stillness/i.test(title)) {
    return "is_concept";
  }
  if (/sequence|format|combination/i.test(lineage)) {
    return "is_sequence";
  }
  if (/practice|meditation|breathing|breath|breathwork|sigh|inhale|exhale|humming|nostril|box|scan|gaze|visualisation|affirmations|metta|japa|trataka|mantra/i.test(title)) {
    return "is_technique";
  }
  return "is_concept";
}

function buildTags(title, hasChildren, pathParts) {
  const rootTitle = getRootTitle(pathParts, title);
  const root = rootConfig[rootTitle];
  const cardId = getCardId(pathParts, title);
  const content = cardContent[cardId];
  const typeTag = inferType(title, hasChildren, pathParts);
  const tags = [typeTag, root.discipline, root.icon, root.color];

  const lineage = [...pathParts, title].join(" > ");
  if (/Concept Cards|Concepts/.test(lineage)) {
    tags.push("is_reference");
  }
  if (/Meditation/.test(lineage)) {
    tags.push("discipline_meditation");
  }
  if (/Breathwork|NSRT|Breath /.test(lineage)) {
    tags.push("discipline_breathwork");
  }
  if (/Deep Rest|Stillness|Integration/.test(lineage)) {
    tags.push("discipline_deep_rest");
  }

  if (content?.icon) {
    tags.push(content.icon);
  }
  if (content?.color) {
    tags.push(content.color);
  }
  if (content?.tags?.length) {
    tags.push(...content.tags);
  }

  return [...new Set(tags)];
}

function uniquePush(list, value) {
  if (value && !list.includes(value)) {
    list.push(value);
  }
}

function joinTitles(ids, cards, max = 4) {
  return ids
    .slice(0, max)
    .map((id) => cards[id]?.title)
    .filter(Boolean)
    .join(", ");
}

function toSentenceCase(text) {
  if (!text) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function humanList(items) {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function titleToLowerPhrase(title) {
  return title
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function hasTag(card, prefix) {
  return card.tags.some((tag) => tag === prefix);
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function inferTechniqueMode(card) {
  const lower = titleToLowerPhrase(card.title);

  if (includesAny(lower, ["body scan", "trataka", "watching the breath", "just breathe meditation"])) {
    return "meditation_awareness";
  }
  if (includesAny(lower, ["loving kindness", "metta", "ajapa", "mantra", "visualisation", "affirmations"])) {
    return "meditation_intention";
  }
  if (includesAny(lower, ["physiological sigh", "extended exhale", "triangle", "pinhole", "humming", "cooling", "recovery breath", "exhale", "coherent breath"])) {
    return "breath_calming";
  }
  if (includesAny(lower, ["energising", "cleansing", "bellows", "lion", "interrupted inhale", "warming", "inhale", "elephant", "breath of joy", "horse stance"])) {
    return "breath_energising";
  }
  if (includesAny(lower, ["alternate nostril", "box breathing", "even breath", "3-part inhale / exhale", "3-part inhale exhale"])) {
    return "breath_balancing";
  }
  if (includesAny(lower, ["diaphragmatic", "costal", "clavicular", "360 breathing", "conscious breath", "functional breath awareness"])) {
    return "breath_mechanics";
  }
  if (includesAny(lower, ["breath awareness"])) {
    return "meditation_awareness";
  }
  if (hasTag(card, "discipline_meditation")) {
    return "meditation_generic";
  }
  return "breath_generic";
}

function buildTechniqueSections(card) {
  const mode = inferTechniqueMode(card);

  if (mode === "breath_calming") {
    return {
      howTo:
        "Start in a steady posture and let the breath become deliberate rather than automatic.\n- Slow the rhythm down.\n- Give more time or emphasis to the exhale than to the inhale.\n- Keep the face, jaw, and shoulders as soft as possible.\n- Continue for several rounds until the breath and overall tone begin to settle.",
      purpose:
        "Used to reduce activation, create a stronger sense of safety, and help the system shift toward steadiness. The main emphasis is down-regulation rather than intensity.",
      whyItWorks:
        "A longer or softer exhale tends to increase parasympathetic influence through vagal pathways and reduces the urgency of the breathing pattern. Slower breathing can also improve carbon dioxide tolerance, reduce unnecessary chest tension, and signal to the nervous system that immediate mobilization is no longer needed.",
    };
  }

  if (mode === "breath_energising") {
    return {
      howTo:
        "Begin in an upright posture with enough space for the ribcage and abdomen to move.\n- Make the inhale more active, sharper, or more expansive.\n- Let the exhale either release naturally or support the rhythm without collapsing posture.\n- Use a clear cadence for a short set of rounds.\n- Pause afterward and notice whether the body feels more awake, warm, and available.",
      purpose:
        "Used to increase alertness, raise energy, and mobilize attention when more activation is useful. The main emphasis is uplift, readiness, and momentum rather than calming.",
      whyItWorks:
        "More active inhalation and stronger respiratory movement increase arousal and can raise heart rate, thoracic expansion, and sensory alertness. The pattern recruits respiratory muscles more strongly, changes blood gases more quickly, and tends to shift the nervous system toward sympathetic activation and readiness.",
    };
  }

  if (mode === "breath_balancing") {
    return {
      howTo:
        "Settle into an even posture and choose a rhythm that feels sustainable.\n- Keep inhale and exhale measured and intentional.\n- Add pauses or nostril changes only as the technique requires.\n- Maintain smooth transitions rather than forcing the breath.\n- Continue until the rhythm becomes stable and easy to follow.",
      purpose:
        "Used to create steadiness, balance, and clearer regulation when the system does not need a strong push in either direction. The emphasis is evenness, pacing, and coherence.",
      whyItWorks:
        "Regular rhythm stabilizes respiratory drive and gives the nervous system a predictable pattern to follow. Balanced breathing can reduce reactivity, improve attentional control, and support autonomic regulation by smoothing fluctuations in breath depth, timing, and muscular effort.",
    };
  }

  if (mode === "breath_mechanics") {
    return {
      howTo:
        "Bring attention to where the breath is moving in the body and shape it deliberately.\n- Notice whether movement is happening more in the belly, ribs, chest, or upper chest.\n- Guide the breath toward the area the technique emphasizes.\n- Keep unnecessary effort low so sensation stays clear.\n- Repeat slowly enough to feel the pattern rather than only think about it.",
      purpose:
        "Used to improve awareness of breathing mechanics, expand control over where the breath moves, and make later regulation techniques more precise. The emphasis is skill, sensation, and functional breathing quality.",
      whyItWorks:
        "Breathing mechanics affect diaphragm use, rib movement, posture, and the amount of muscular effort needed for each breath. Clearer mechanical awareness improves interoception, helps reduce compensatory tension, and creates a better foundation for both calming and energising practices.",
    };
  }

  if (mode === "meditation_awareness") {
    return {
      howTo:
        "Choose a stable posture and let the body become relatively still.\n- Place attention on the chosen object, such as the breath, the body, or a visual point.\n- When the mind wanders, notice it and return without force.\n- Stay with direct experience rather than trying to perform well.\n- Continue long enough for attention to settle and perception to become clearer.",
      purpose:
        "Used to strengthen attention, increase present-moment awareness, and reduce entanglement with constant mental activity. The emphasis is observation, steadiness, and clearer contact with experience.",
      whyItWorks:
        "Repeatedly returning attention trains attentional control and metacognitive awareness. Interoceptive and sensory focus can reduce mental scattering, while steadier observation changes how strongly thoughts, impulses, and external stimuli capture the nervous system.",
    };
  }

  if (mode === "meditation_intention") {
    return {
      howTo:
        "Sit in a steady posture and choose the phrase, image, or inner direction the practice uses.\n- Repeat, visualize, or evoke it gently and consistently.\n- Let attention return to that chosen point whenever distraction appears.\n- Keep effort present but not rigid.\n- Stay with the practice long enough for the intention to become felt rather than merely verbal.",
      purpose:
        "Used to shape the tone of the mind through a chosen inner object such as a mantra, image, phrase, or emotional orientation. The emphasis is direction, conditioning, and deliberate mental framing.",
      whyItWorks:
        "Focused repetition recruits attention, memory, and emotional salience at the same time. A stable inner object reduces fragmentation, while repeated exposure can gradually influence expectation, affective tone, and the nervous system's habitual response patterns.",
    };
  }

  if (mode === "meditation_generic") {
    return {
      howTo:
        "Begin with a posture that is stable but not rigid.\n- Choose the main instruction and stay close to it.\n- Notice distraction without turning it into a problem.\n- Return again and again to the intended point of practice.\n- End by pausing long enough to notice the overall effect.",
      purpose:
        "Used to steady attention, deepen awareness, and create a more workable relationship with mental activity. The emphasis depends on the technique, but usually includes clarity, settling, and reduced reactivity.",
      whyItWorks:
        "Meditation changes how attention is deployed and how strongly thoughts or stimuli trigger automatic reactions. Repetition builds familiarity with observing rather than immediately identifying with experience, which can alter both cognitive and autonomic patterns over time.",
    };
  }

  return {
    howTo:
      "Begin in a clear posture and follow the core instruction of the technique with steady pacing.\n- Keep the form simple enough to stay aware of what is happening.\n- Adjust effort so the practice remains sustainable.\n- Continue for several rounds or minutes.\n- Pause afterward and notice the effect before moving on.",
    purpose:
      "Used to create a specific shift in breathing, attention, or nervous-system state. The emphasis depends on the technique, but usually involves regulation, awareness, or directed mental focus.",
    whyItWorks:
      "Breathing patterns and attentional patterns both influence autonomic state, muscular tone, and perception. Repetition makes the effect more reliable by linking deliberate practice with physiological and neurophysiological change.",
  };
}

function inferOverviewPhrase(card) {
  const lower = titleToLowerPhrase(card.title);

  if (lower.includes("architecture")) {
    return "A framework for understanding how the breath is structured.";
  }
  if (lower.includes("anatomy")) {
    return "A basic map of the structures involved in breathing.";
  }
  if (lower.includes("respiratory system")) {
    return "An overview of how breathing is supported in the body.";
  }
  if (lower.includes("nervous system")) {
    return "An overview of the system that shapes activation, regulation, and recovery.";
  }
  if (lower.includes("awareness")) {
    return "A practice of noticing more clearly before trying to change anything.";
  }
  if (lower.includes("attention")) {
    return "A way of placing focus deliberately and steadily.";
  }
  if (lower.includes("intention")) {
    return "A way of giving practice direction and purpose.";
  }
  if (lower.includes("state")) {
    return "A way of noticing experience without being fully carried by it.";
  }
  if (lower.includes("method") || lower.includes("protocol")) {
    return "A structured approach for guiding practice in a repeatable way.";
  }
  if (lower.includes("sequence") || lower.includes("combination") || lower.includes("format")) {
    return "A longer arc built from multiple practice elements.";
  }
  if (lower.includes("breathing") || lower.includes("breath") || lower.includes("meditation")) {
    return "A practice used to shape breathing, attention, or state.";
  }

  if (card.tags.includes("is_method")) {
    return "A structured approach for guiding practice in a repeatable way.";
  }
  if (card.tags.includes("is_sequence")) {
    return "A longer arc built from multiple practice elements.";
  }
  if (card.tags.includes("is_technique")) {
    return "A practice used to shape breathing, attention, or state.";
  }
  return "A concept used to organize understanding and guidance.";
}

function generateOverview(card, cards) {
  const content = cardContent[card.id];

  if (content?.contentMode === "empty") {
    return "";
  }

  if (content?.overview) {
    return content.overview;
  }

  if (card.children.length > 0) {
    return "";
  }

  return inferOverviewPhrase(card);
}

function generateDetails(card, cards) {
  const content = cardContent[card.id];

  if (content?.contentMode === "empty") {
    return "";
  }

  if (content?.details) {
    return content.details;
  }

  if (card.children.length > 0) {
    return "";
  }

  if (card.tags.includes("is_method")) {
    return `A reusable structure gives practice a clear shape instead of relying on improvisation alone.\n\nTypical points of focus:\n- purpose and intended effect\n- pacing and sequencing\n- when to use it\n- how related variants fit around it\n\nImportant to remember:\n- The structure matters as much as the individual elements inside it.`;
  }

  if (card.tags.includes("is_sequence")) {
    return `Multiple elements are arranged here as a longer practice arc rather than a single isolated step.\n\nWhy the sequence matters:\n- the opening sets the tone\n- the middle shapes the main experience\n- the ending helps the practice land well\n\nImportant to remember:\n- Order changes the effect of the whole experience.`;
  }

  if (card.tags.includes("is_technique")) {
    const sections = buildTechniqueSections(card);
    return `How to practice:\n${sections.howTo}\n\nPurpose:\n${sections.purpose}\n\nWhy it works:\n${sections.whyItWorks}`;
  }

  return `Clear concepts make practice easier to understand, compare, and teach.\n\nWhy it matters:\n- language becomes more precise\n- distinctions become easier to hold\n- related practices make more sense in context\n\nKey points:\n- Concepts are most useful when they stay connected to lived practice.`;
}

const cards = {};

function ensureCard(id, title, pathParts, hasChildren) {
  const rootTitle = getRootTitle(pathParts, title);
  const content = cardContent[id];
  if (!cards[id]) {
    cards[id] = {
      id,
      title: content?.title || title,
      overview: "",
      details: "",
      tags: buildTags(title, hasChildren, pathParts),
      parents: [],
      children: [],
      related: [],
    };
  } else if (hasChildren) {
    for (const tag of buildTags(title, hasChildren, pathParts)) {
      uniquePush(cards[id].tags, tag);
    }
  }

  if (content?.title) {
    cards[id].title = content.title;
  }

  if (!cards[id].tags.some((tag) => tag.startsWith("icon_"))) {
    uniquePush(cards[id].tags, content?.icon || rootConfig[rootTitle].icon);
  }
  if (!cards[id].tags.some((tag) => tag.startsWith("color_"))) {
    uniquePush(cards[id].tags, content?.color || rootConfig[rootTitle].color);
  }

  return cards[id];
}

function walk(nodes, pathParts = [], parentId = null) {
  for (const node of nodes) {
    const id = getCardId(pathParts, node.title);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const card = ensureCard(id, node.title, pathParts, hasChildren);

    uniquePush(card.parents, parentId);

    if (hasChildren) {
      const childIds = node.children.map((child) => getCardId([...pathParts, node.title], child.title));
      for (const childId of childIds) {
        uniquePush(card.children, childId);
      }
      walk(node.children, [...pathParts, node.title], id);
    }
  }
}

walk(outline);

function ensureSyntheticCard(id, title, color, icon, discipline = "discipline_integrated") {
  if (!cards[id]) {
    cards[id] = {
      id,
      title,
      overview: "",
      details: "",
      tags: ["is_category", discipline, icon, color],
      parents: [],
      children: [],
      related: [],
    };
  }

  for (const tag of ["is_category", discipline, icon, color]) {
    uniquePush(cards[id].tags, tag);
  }

  return cards[id];
}

function setChildren(parentId, childIds) {
  cards[parentId].children = childIds.filter((id) => cards[id]);
}

function setPrimaryParent(childId, parentId) {
  if (!cards[childId] || !cards[parentId]) {
    return;
  }
  cards[childId].parents = [parentId, ...cards[childId].parents.filter((id) => id !== parentId)];
}

function addParent(childId, parentId) {
  if (!cards[childId] || !cards[parentId]) {
    return;
  }
  uniquePush(cards[childId].parents, parentId);
}

function removeParent(childId, parentId) {
  if (!cards[childId]) {
    return;
  }
  cards[childId].parents = cards[childId].parents.filter((id) => id !== parentId);
}

function replaceTagGroup(card, prefix, replacement) {
  card.tags = card.tags.filter((tag) => !tag.startsWith(prefix));
  if (replacement) {
    uniquePush(card.tags, replacement);
  }
}

function getEffectiveRootId(cardId, rootIdSet, cache = new Map()) {
  if (cache.has(cardId)) {
    return cache.get(cardId);
  }

  if (rootIdSet.has(cardId)) {
    cache.set(cardId, cardId);
    return cardId;
  }

  const card = cards[cardId];
  if (!card) {
    cache.set(cardId, null);
    return null;
  }

  for (const parentId of card.parents) {
    if (!parentId) {
      continue;
    }
    const resolved = getEffectiveRootId(parentId, rootIdSet, cache);
    if (resolved) {
      cache.set(cardId, resolved);
      return resolved;
    }
  }

  cache.set(cardId, null);
  return null;
}

ensureSyntheticCard("from-stress-to-rest", "From Stress to Rest", "color_amber", "icon_sunrise");
ensureSyntheticCard(
  "opening-invitation",
  "Opening Invitation",
  "color_amber",
  "icon_sparkles",
);
ensureSyntheticCard(
  "integration-teaching-methods",
  "Integration & Teaching Methods",
  "color_rose",
  "icon_graduation_cap",
);
ensureSyntheticCard(
  "principles-of-guidance",
  "Principles of Guidance",
  "color_slate",
  "icon_compass",
);
ensureSyntheticCard("session-structure", "Session Structure", "color_rose", "icon_graduation_cap");
ensureSyntheticCard("session-frameworks", "Session Frameworks", "color_rose", "icon_graduation_cap");
ensureSyntheticCard("deep-rest-principles", "Deep Rest Principles", "color_emerald", "icon_bed_double");
ensureSyntheticCard("deep-rest-practices", "Deep Rest Practices", "color_emerald", "icon_bed_double");
ensureSyntheticCard("guiding-principles", "Guiding Principles", "color_slate", "icon_compass");
ensureSyntheticCard("reference-views", "Reference Views", "color_slate", "icon_compass");

setChildren("from-stress-to-rest", [
  "core-practice-concepts",
  "opening-invitation",
  "stress-and-rest-concepts",
]);

setChildren("opening-invitation", [
  "close-your-eyes-be-still-just-breathe",
  "conscious-breath",
  "notice-what-you-notice-feel-what-you-feel",
]);

setChildren("breathwork", [
  "breathwork-foundations",
  "breath-concepts",
  "breathwork-techniques",
  "breathwork-protocols",
]);

setChildren("integration-teaching-methods", [
  "session-architecture",
  "preparatory-support-practices",
  "full-practice-formats",
]);

setChildren("deep-rest", ["deep-rest-principles", "deep-rest-practices"]);

setChildren("deep-rest-principles", [
  "deep-rest-foundations",
  "conscious-unwinding",
]);

setChildren("deep-rest-practices", [
  "resting-position-supported-practice",
  "stillness",
  "integration",
]);

setChildren("session-architecture", [
  "universal-practice-framework",
  "session-structure",
  "session-frameworks",
  "integration-recovery-stillness",
]);

setChildren("session-structure", ["opening-sequence", "closing-sequence"]);
setChildren("session-frameworks", [
  "breathwork-session-framework",
  "meditation-session-framework",
]);

setChildren("cts-circle-triangle-square", [
  "even-breath",
  "triangle-breathing",
  "box-breathing",
]);

setChildren("360-ipa", [
  "360-breathing",
  "inspired-pause",
  "alternate-nostril-breathing",
]);

setChildren("pxc", [
  "physiological-sigh",
  "extended-exhale",
  "coherent-breath",
]);

setChildren("xlt", [
  "extended-exhale",
  "low-frequency-humming-breath",
  "triangle-4-7-8",
]);

setChildren("principles-of-guidance", ["guiding-principles", "reference-views"]);
setChildren("guiding-principles", ["guidance-concepts"]);
setChildren("reference-views", ["concept-cards"]);

setPrimaryParent("core-practice-concepts", "from-stress-to-rest");
setPrimaryParent("stress-and-rest-concepts", "from-stress-to-rest");
setPrimaryParent("opening-invitation", "from-stress-to-rest");

for (const id of ["just-breathe-method", "quiet-practices", "time-well-spent", "3-gratitudes"]) {
  setPrimaryParent(id, "core-practice-concepts");
}

for (const id of [
  "close-your-eyes-be-still-just-breathe",
  "conscious-breath",
  "notice-what-you-notice-feel-what-you-feel",
]) {
  setPrimaryParent(id, "opening-invitation");
}

setPrimaryParent("opening-invitation", "from-stress-to-rest");
setPrimaryParent("breathwork-protocols", "breathwork");
setPrimaryParent("session-architecture", "integration-teaching-methods");
setPrimaryParent("preparatory-support-practices", "integration-teaching-methods");
setPrimaryParent("full-practice-formats", "integration-teaching-methods");
setPrimaryParent("guiding-principles", "principles-of-guidance");
setPrimaryParent("reference-views", "principles-of-guidance");
setPrimaryParent("guidance-concepts", "guiding-principles");
setPrimaryParent("concept-cards", "reference-views");
setPrimaryParent("session-structure", "session-architecture");
setPrimaryParent("session-frameworks", "session-architecture");
setPrimaryParent("opening-sequence", "session-structure");
setPrimaryParent("closing-sequence", "session-structure");
setPrimaryParent("breathwork-session-framework", "session-frameworks");
setPrimaryParent("meditation-session-framework", "session-frameworks");
setPrimaryParent("deep-rest-principles", "deep-rest");
setPrimaryParent("deep-rest-practices", "deep-rest");
setPrimaryParent("deep-rest-foundations", "deep-rest-principles");
setPrimaryParent("conscious-unwinding", "deep-rest-principles");
setPrimaryParent("resting-position-supported-practice", "deep-rest-practices");
setPrimaryParent("stillness", "deep-rest-practices");
setPrimaryParent("integration", "deep-rest-practices");

for (const [parentId, childIds] of Object.entries({
  "cts-circle-triangle-square": ["even-breath", "triangle-breathing", "box-breathing"],
  "360-ipa": ["360-breathing", "inspired-pause", "alternate-nostril-breathing"],
  pxc: ["physiological-sigh", "extended-exhale", "coherent-breath"],
  xlt: ["extended-exhale", "low-frequency-humming-breath", "triangle-4-7-8"],
})) {
  for (const childId of childIds) {
    addParent(childId, parentId);
  }
}

for (const id of [
  "breathwork-protocols",
  "session-architecture",
  "preparatory-support-practices",
  "full-practice-formats",
  "concept-cards",
  "core-practice-concepts",
  "stress-and-rest-concepts",
  "deep-rest-principles",
  "deep-rest-practices",
  "guiding-principles",
  "reference-views",
]) {
  removeParent(id, null);
}

for (const id of [
  "breathwork",
  "meditation",
  "deep-rest",
  "from-stress-to-rest",
  "integration-teaching-methods",
  "principles-of-guidance",
]) {
  cards[id].parents = [];
}

for (const [parentId, childIds] of Object.entries({
  "opening-invitation": [
    "close-your-eyes-be-still-just-breathe",
    "conscious-breath",
    "notice-what-you-notice-feel-what-you-feel",
  ],
  "cts-circle-triangle-square": ["even-breath", "triangle-breathing", "box-breathing"],
  "360-ipa": ["360-breathing", "inspired-pause", "alternate-nostril-breathing"],
  pxc: ["physiological-sigh", "extended-exhale", "coherent-breath"],
  xlt: ["extended-exhale", "low-frequency-humming-breath", "triangle-4-7-8"],
})) {
  cards[parentId].children = childIds.filter((childId) => cards[childId]);
}

for (const card of Object.values(cards)) {
  card.overview = generateOverview(card, cards);
  card.details = generateDetails(card, cards);
}

for (const card of Object.values(cards)) {
  const relatedIds = cardContent[card.id]?.related || [];
  card.related = relatedIds.filter((relatedId) => cards[relatedId]).slice(0, 5);
}

const rootIds = [
  "from-stress-to-rest",
  "breathwork",
  "meditation",
  "deep-rest",
  "integration-teaching-methods",
  "principles-of-guidance",
];

const rootVisuals = {
  "from-stress-to-rest": { color: "color_amber", icon: "icon_sunrise" },
  breathwork: { color: "color_blue", icon: "icon_wind" },
  meditation: { color: "color_indigo", icon: "icon_moon_star" },
  "deep-rest": { color: "color_emerald", icon: "icon_bed_double" },
  "integration-teaching-methods": { color: "color_rose", icon: "icon_graduation_cap" },
  "principles-of-guidance": { color: "color_slate", icon: "icon_compass" },
};

const rootIdSet = new Set(rootIds);
const rootResolutionCache = new Map();

for (const card of Object.values(cards)) {
  const effectiveRootId = getEffectiveRootId(card.id, rootIdSet, rootResolutionCache);
  const visuals = rootVisuals[effectiveRootId];
  if (!visuals) {
    continue;
  }

  replaceTagGroup(card, "icon_", visuals.icon);
  replaceTagGroup(card, "color_", visuals.color);
}

const base = {
  rootIds,
  cards,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(base, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
console.log(`Cards: ${Object.keys(cards).length}`);
