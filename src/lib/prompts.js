export const PROMPT_CATEGORIES = [
  {
    category: "Personal friction",
    prompts: [
      "What annoyed you today?",
      "What wasted your time today?",
      "What did you have to redo because the first attempt failed?",
      "What task do you procrastinate on because the process is terrible?"
    ]
  },
  {
    category: "Software & tools",
    prompts: [
      "What software do you dislike using?",
      "What app made you say 'why is this so hard'?",
      "What spreadsheet are you using that should be an app?",
      "Which tool do you pay for but still complain about?"
    ]
  },
  {
    category: "Other people's complaints",
    prompts: [
      "What do students complain about?",
      "What do businesses complain about?",
      "What did a stranger complain about near you this week?",
      "What is a common complaint in your industry that everyone just accepts?"
    ]
  },
  {
    category: "Systems & process",
    prompts: [
      "What process is inefficient?",
      "What manual task took longer than it should have?",
      "Where is information getting lost between people?",
      "What requires too many steps to accomplish?"
    ]
  },
  {
    category: "Money signals",
    prompts: [
      "What would people pay to fix?",
      "What do people already pay for badly?",
      "Where are people spending money to save time?",
      "What expensive service could be productized?"
    ]
  }
];

export function getRandomPrompt() {
  const flatPrompts = PROMPT_CATEGORIES.flatMap(c => c.prompts);
  return flatPrompts[Math.floor(Math.random() * flatPrompts.length)];
}
