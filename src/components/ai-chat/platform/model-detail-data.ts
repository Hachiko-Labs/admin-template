export const MODEL_ID = "anthropic/claude-fable-5.1";

export const modelExamples = [
  {
    id: "system",
    title: "System instructions",
    description: "Give your assistant a role and context.",
    system:
      "You are a customer operations assistant. Write concise, actionable summaries. Never invent missing account information.",
    messages: [
      {
        role: "user",
        content:
          "Summarize this account handoff: Northstar signed the Growth plan for 24 seats. Maya is the account owner. SSO setup is pending. The kickoff is Thursday. Give me the next steps.",
      },
    ],
    output:
      "Northstar · Account handoff\n\nGrowth plan · 24 seats\nAccount owner: Maya\nKickoff: Thursday\n\nNext steps\n1. Confirm the SSO requirements with Northstar’s IT contact.\n2. Ask Maya to share the kickoff agenda before Thursday.\n3. Track SSO setup as the remaining onboarding dependency.\n\nThe IT contact and target activation date weren’t included in the handoff. Confirm both before scheduling setup.",
    inputTokens: 104,
    outputTokens: 113,
  },
  {
    id: "conversation",
    title: "Multi-turn conversation",
    description: "Build on the context of earlier messages.",
    system:
      "You are a helpful workspace assistant. Keep your answers brief and practical.",
    messages: [
      {
        role: "user",
        content: "We have 12 overdue invoices. How should we follow up?",
      },
      {
        role: "assistant",
        content:
          "Group them by days overdue, confirm payment status, then send a reminder with the invoice number and payment link.",
      },
      {
        role: "user",
        content:
          "Draft a friendly reminder for invoice INV-2048. It was due September 15. Don’t include an amount or a payment link yet.",
      },
    ],
    output:
      "Subject: A quick reminder about invoice INV-2048\n\nHi there,\n\nJust following up on invoice INV-2048, which was due on September 15. When you have a moment, could you let us know when we can expect payment?\n\nIf you’ve already paid, thank you — please disregard this reminder. Happy to help if you have any questions.\n\nBest,\nThe accounts team",
    inputTokens: 139,
    outputTokens: 91,
  },
  {
    id: "streaming",
    title: "Streaming response",
    description: "Deliver the answer as it’s generated.",
    system:
      "You are a project assistant. Turn notes into a clear update without inventing details.",
    messages: [
      {
        role: "user",
        content:
          "Write a weekly update: dashboard filters shipped, billing export is in review, mobile navigation is blocked on design feedback. Next week: finish export and start accessibility checks.",
      },
    ],
    output:
      "Weekly product update\n\nShipped\nDashboard filters are now available. Teams can narrow their view without leaving the dashboard.\n\nIn review\nThe billing export is ready for review. We’re aiming to finish it next week.\n\nBlocked\nMobile navigation is waiting on design feedback. That feedback is needed before implementation can move forward.\n\nUp next\nFinish the billing export and begin accessibility checks.",
    inputTokens: 88,
    outputTokens: 101,
  },
] as const;

export function requestBody(index: number) {
  const example = modelExamples[index];
  return {
    model: MODEL_ID,
    max_tokens: 1024,
    system: example.system,
    messages: example.messages,
    ...(example.id === "streaming" ? { stream: true } : {}),
  };
}

export function requestCode(index: number, language: string) {
  const body = requestBody(index);
  if (language === "curl") {
    return `curl "$API_BASE_URL/v1/messages" \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body, null, 2)}'`;
  }
  return `const response = await fetch(
  \`\${process.env.API_BASE_URL}/v1/messages\`,
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(${JSON.stringify(body, null, 2).replaceAll("\n", "\n    ")}),
  }
);

if (!response.ok) {
  throw new Error(\`Request failed: \${response.status}\`);
}

${index === 2 ? 'return new Response(response.body, {\n  headers: { "Content-Type": "text/event-stream" },\n});' : "const message = await response.json();\nconsole.log(message.content);"}`;
}

export function sampleResponse(index: number) {
  const example = modelExamples[index];
  return JSON.stringify(
    {
      id: `msg_sample_${example.id}`,
      type: "message",
      role: "assistant",
      model: "claude-fable-5-1",
      content: [{ type: "text", text: example.output }],
      stop_reason: "end_turn",
      usage: {
        input_tokens: example.inputTokens,
        output_tokens: example.outputTokens,
      },
    },
    null,
    2,
  );
}

export const inputFields = [
  {
    name: "messages",
    type: "object[]",
    required: true,
    description:
      "Conversation history with a role and content for each message.",
  },
  {
    name: "max_tokens",
    type: "number",
    required: true,
    description: "Maximum number of tokens to generate in the response.",
  },
  {
    name: "system",
    type: "string",
    required: false,
    description: "Instructions that define the assistant’s role and behavior.",
  },
  {
    name: "stream",
    type: "boolean",
    required: false,
    description: "Return incremental output as server-sent events.",
  },
  {
    name: "metadata",
    type: "object",
    required: false,
    description: "Optional metadata associated with the request.",
  },
];

export const requestSchema = JSON.stringify(
  {
    type: "object",
    required: ["messages", "max_tokens"],
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          required: ["role", "content"],
          properties: {
            role: { type: "string", enum: ["user", "assistant"] },
            content: { type: "string" },
          },
        },
      },
      max_tokens: { type: "integer" },
      system: { type: "string" },
      stream: { type: "boolean", default: false },
      metadata: { type: "object" },
    },
  },
  null,
  2,
);
