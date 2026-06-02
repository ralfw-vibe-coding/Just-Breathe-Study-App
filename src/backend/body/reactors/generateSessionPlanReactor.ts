import type { SessionPlanInput, SessionScript } from "../../../shared/types";
import { isSessionsEnabled } from "../domain/providers/appConfig";
import { loadTrainingManual } from "../domain/providers/manualRepository";

type OpenAiResponse = {
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<
      | {
          type?: string;
          text?: string;
        }
      | undefined
    >;
  }>;
};

function extractAssistantText(response: OpenAiResponse): string {
  const parts: string[] = [];

  for (const outputItem of response.output ?? []) {
    if (outputItem?.type !== "message" || outputItem.role !== "assistant") {
      continue;
    }

    for (const contentItem of outputItem.content ?? []) {
      if (contentItem?.type === "output_text" && contentItem.text) {
        parts.push(contentItem.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function normalizeSessionScript(text: string): string {
  return text
    .replace(/<break\s+time="(\d+)s"\s*\/>/gi, "[Pause for $1s]")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function deriveSessionTitle(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return "Breathwork Session";
  }

  return trimmed.length > 72 ? `${trimmed.slice(0, 69).trimEnd()}...` : trimmed;
}

export class GenerateSessionPlanReactor {
  async process(input: SessionPlanInput): Promise<SessionScript> {
    if (!isSessionsEnabled()) {
      throw new Error("Sessions are currently disabled.");
    }

    if (!input.description.trim()) {
      throw new Error("Session description is required.");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI is not configured on the server.");
    }

    const manual = await loadTrainingManual();
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    const instructions = `You are an expert breathwork instructor. You help me practice the techniques by generating detailed scripts for breathwork sessions. The scripts are based on the "Just Breathe" method for know from the training manual.

Sessions follow this basic pattern:

- Opening sequence
- Guided techniques
- Closing sequence

The guided techniques also follow a pattern. Each technique is structured like this:

- Brief explanation of technique
- Guided practice
- Guided recovery breath

The guided practice always consists of one or more rounds. In each round the breath is guided by counting for the duration of the breath phase. Breath phases are inhale, exhale, hold.

The script consists of phases, sections, paragraphs, and sentences. There are pauses after each:

- sentences: 2s
- parapgraphs: 5s
- sections: 5s
- phases: 5s

Also during countings there are pauses when counting down. Always a seconds after each word, e.g. Inhalt (1s) 3 (1s) 2 (1s) 1. That's one sentence.

Now generate a full script for the following breathwork technique:

<specification of techniques from input field>

Deliver the script as a text following these rules:

- it starts with the prefix "[Calm]"
- each pause is explicitly written as "[Pause for Xs]"
- use new lines deliberately
- place each sentence on a new line
- be sure to guide the opening sequence explicitly.
- start each technique with a brief overview. then transition into its practice.
- when counting a breath phase only say the phase name, e.g. "Inhale" and then count down starting from n-1, e.g. for an extended exhale with 3-5 it would be "Inhale 2 [Pause for 1s] 1 [Pause for 1s]" and "Exhale 4 [Pause for 1s] 3 [Pause for 1s] 2 [Pause for 1s] 1 [Pause for 1s]".
- Consider all breaths of all rounds with all phases of a breath together as one long sentence.
- Do not announce rounds in the script.
- Be sure to guide the closing sequence, especially the three gratitudes in an explicit manner.

Give me your script without any commentary from you:

JUST BREATHE TRAINING MANUAL:
${manual}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        instructions,
        input: [
          {
            role: "user",
            content: `Now generate a full script for the following breathwork technique:\n\n${input.description}`
          }
        ],
        max_output_tokens: 2600
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `OpenAI session script request failed (${response.status}). ${message}`.trim()
      );
    }

    const payload = (await response.json()) as OpenAiResponse;
    const script = normalizeSessionScript(extractAssistantText(payload));

    if (!script) {
      throw new Error("OpenAI returned an empty session script.");
    }

    return {
      title: deriveSessionTitle(input.description),
      voice: input.voice,
      script
    };
  }
}
