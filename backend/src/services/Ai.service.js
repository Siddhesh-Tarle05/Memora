import dotenv from 'dotenv';
dotenv.config();
import { MistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const llm = new MistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

async function generateTags(text, title) {
  console.log(text,title)
  const response = await llm.invoke([
    new SystemMessage(
      "You are a tagging system.  Generate 5-8 short tags (1-2 words each).tags must be lowercse . Return ONLY a JSON array"
    ),
    new HumanMessage(`
Title: ${title}
Content: ${text.slice(0, 1500)}
    `),
  ]);
  console.log(response)
  const output = response;
  console.log("RAW OUTPUT:", output);


  try {
    const jsonMatch = output.match(/\[.*\]/s); // extract array safely
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (err) {
    console.log("Tag parse failed:", output);
    console.log(err)
    return [];
  }
}
async function extractTagsFromQuery(query) {
  const response = await llm.invoke([
    new SystemMessage(
      "Extract 2-5 relevant search tags from the query. Return ONLY JSON array. Keep them short and lowercase."
    ),
    new HumanMessage(query)
  ]);

  let output = "";

  if (typeof response === "string") {
    output = response;
  } else if (response?.content) {
    output = response.content;
  } else {
    return [];
  }

  try {
    return JSON.parse(output);
  } catch {
    return [];
  }
}
async function generateCollectionName(noteTitles) {
  if (!noteTitles || noteTitles.length === 0) return "Untitled Collection";

  const prompt = `
You are an assistant that generates a short meaningful name (1-4 words) for a collection of notes.
The notes have the following titles: ${noteTitles.join(", ")}
Return ONLY the name, no extra text.
`;

  const response = await llm.invoke([
    new SystemMessage(prompt),
    new HumanMessage("Generate name:")
  ]);

  // response.content might vary depending on version
  const name = response.content || response;
  return name.trim();
}

async function generateTopic(text, title) {
  const prompt = `
Categorize this note into ONE most relevant category.

Rules:

* Return ONLY the category name (no explanation, no extra text)

* Use intelligent grouping:

  * For technical topics:

    * Frontend Development
    * Backend Development
    * Mobile Development
    * Artificial Intelligence
    * System Design
    * DevOps & Cloud
    * General Technology

  * For science/nature, use more specific categories:

    * Animals (for dogs, cats, wildlife, pets)
    * Plants & Nature (for trees, grass, environment, ecology)
    * Physics
    * Biology
    * Chemistry

* Guidelines:

  1. If the note is about animals → return "Animals"
  2. If about plants, trees, environment → return "Plants & Nature"
  3. If about AI concepts (embeddings, LLMs, NLP) → return "Artificial Intelligence"
  4. If about coding/frontend tools → return "Frontend Development"
  5. If about backend/APIs/databases → return "Backend Development"
  6. If multiple topics exist → choose the dominant one
  7. Avoid overly generic categories if a better one exists

Return ONLY the category name.

`;
  const response = await llm.invoke([
    new SystemMessage(prompt),
    new HumanMessage(`Title: ${title}\nContent: ${text.slice(0, 1000)}`)
  ]);

  const topic = response.content || response;
  return topic.replace(/["']/g, "").trim();
}
export { generateTags, extractTagsFromQuery, generateCollectionName, generateTopic }