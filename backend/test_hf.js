import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const EMBEDDING_MODEL = "sentence-transformers/paraphrase-MiniLM-L6-v2";
const HF_EMBED_URL = `https://router.huggingface.co/hf-inference/models/${EMBEDDING_MODEL}/pipeline/feature-extraction`;
const HF_API_TOKEN = process.env.HUGGINGFACE_TOKEN;

async function run() {
  try {
    const res = await axios.post(
      HF_EMBED_URL,
      { inputs: "Hello world" },
      { headers: { Authorization: `Bearer ${HF_API_TOKEN}`, "Content-Type": "application/json" } }
    );
    console.log("Data type:", typeof res.data);
    console.log("Is array?", Array.isArray(res.data));
    console.log("Length:", res.data.length);
    console.log("First element type:", typeof res.data[0]);
    console.log("First element is array?", Array.isArray(res.data[0]));
  } catch (err) {
    console.error(err.message);
  }
}

run();
