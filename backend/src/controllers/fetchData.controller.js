import axios from 'axios';
import mongoose from 'mongoose';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import pkgr from '@mozilla/readability';
const { Readability } = pkgr;
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import ytdl from 'ytdl-core';
import fetch from "node-fetch";
import fs from "fs";
import imagekit from '../config/imagekit.js';

import notesModel from '../models/notes.model.js';
import {generateTags,extractTagsFromQuery,generateCollectionName,generateTopic} from '../services/Ai.service.js';
import collectionModel from "../models/collection.model.js";
import getVideoId from 'get-video-id';

import { CloudClient } from "chromadb";


const client = new CloudClient({
  apiKey: 'ck-85zRV14BLTxhaUtTpY4p78fWZz8V5yMPprkZgqfQHYTo',
  tenant: '6d33d8ba-fa58-404f-8812-31739e90c1ff',
  database: 'Memora'
});

// --- Hugging Face API ---
const EMBEDDING_MODEL = "sentence-transformers/paraphrase-MiniLM-L6-v2";
const HF_EMBED_URL = `https://router.huggingface.co/hf-inference/models/${EMBEDDING_MODEL}/pipeline/feature-extraction`;

// --- Utility Functions ---

// 1️⃣ Detect link type
async function isPDF(url) {
  if (url.toLowerCase().endsWith(".pdf")) return true;
  try {
    const res = await axios.head(url);
    return res.headers["content-type"] === "application/pdf";
  } catch {
    return false;
  }
}

function isYouTube(url) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
}
function isTwitter(url) {
  return /^(https?:\/\/)?(www\.)?(mobile\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/.test(url);
}



async function isImage(url) {
  try {
    // 1️⃣ Try HEAD request first
    try {
      const headRes = await axios.head(url, { timeout: 5000 });
      const contentType = headRes.headers["content-type"];
      if (contentType && contentType.startsWith("image/")) return true;
    } catch (_) {
      // HEAD might fail, fallback to GET
    }

    // 2️⃣ GET first bytes (magic number check)
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 5000 });
    const buffer = Buffer.from(res.data);
    const header = buffer.slice(0, 8).toString("hex").toUpperCase();

    if (header.startsWith("FFD8FF")) return true; // JPEG
    if (header.startsWith("89504E47")) return true; // PNG
    if (header.startsWith("47494638")) return true; // GIF
    if (header.startsWith("424D")) return true;     // BMP
    if (header.startsWith("3C3F786D") || header.includes("SVG")) return true; // SVG

    return false;
  } catch (err) {
    console.error("Image detection failed:", err.message);
    return false;
  }
}

async function detectLinkType(url) {
  if (await isPDF(url)) return "pdf";
  if (isYouTube(url)) return "youtube";
   if (await isImage(url)) return "image";
   if(isTwitter(url)) return "twitte"
  return "web";
}


// 2️⃣ Extract text
async function extractText(url, type) {
    try {
    // ---------- PDF ----------
    if (type === "pdf") {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const data = await pdf(response.data);

      return {
        text: data.text || "",
        title: data.info?.Title || url.split("/").pop()
      };
    }

    // ---------- YouTube ----------
    if (type === "youtube") {
      try {
        const { data } = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        const title = data.title || "YouTube Video";
        return {
          text: title,
          title: title
        };
      } catch (err) {
        return {
          text: "YouTube Video",
          title: "YouTube Video"
        };
      }
    }

    // ---------- Twitter ----------
    if (type === "twitte") {
      const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/);
      if (match) {
        const vxUrl = `https://api.vxtwitter.com/${match[1]}/status/${match[2]}`;
        try {
          const { data } = await axios.get(vxUrl);
          const title = `Tweet by @${data.user_name} (${data.user_screen_name})`;
          let text = data.text || url;
          let isVideo = false;
          
          if (data.media_extended && data.media_extended.length > 0) {
            if (data.media_extended.some(m => m.type === 'video')) {
              isVideo = true;
            }
          }
          
          return {
            text,
            title,
            isVideo
          };
        } catch (err) {
           // fallback if API fails
           return {
             text: `Tweet from ${match[1]} about ${url}`,
             title: `Tweet by @${match[1]}`,
             isVideo: false
           };
        }
      }
    }

    // ---------- Web ----------
    const { data: html } = await axios.get(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  }
});
    const doc = new JSDOM(html);

    const article = new Readability(doc.window.document).parse();

    return {
      text: article?.textContent || "",
      title: article?.title || doc.window.document.title || "Untitled"
    };

  } catch (err) {
    console.error("❌ Extraction failed:", err.message);
    return { text: "Link content could not be fully extracted.", title: url.split("/").pop() || "Failed to extract" };
  }
}

// Chunk text for large documents
function chunkText(text, chunkSize = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}


// 3️⃣ Generate embedding via Hugging Face
async function generateEmbedding(text) {
  const HF_API_TOKEN = process.env.HUGGINGFACE_TOKEN;
  const res = await axios.post(
    HF_EMBED_URL,
    { inputs: text },
    { headers: { Authorization: `Bearer ${HF_API_TOKEN}`, "Content-Type": "application/json" } }
  );
  const data = res.data;
  let embedding = [];
  if (Array.isArray(data) && typeof data[0] === 'number') {
    embedding = data;
  } else if (Array.isArray(data[0])) {
    embedding = data[0];
  } else {
    embedding = data.embedding || [];
  }
  const magnitude = Math.sqrt(embedding.reduce((s, v) => s + v*v, 0));
  return embedding.map(v => v / magnitude);
}

async function saveNote(userId, url,title,text) {
   let finalText = text;
  let finalTitle = title;

  let type = await detectLinkType(url);
  console.log(type)
  if(type==='image'){
    await saveImage(userId, url,title,text)
    return;
  }
  
  if (!text && !title) {
    const result = await extractText(url, type);
    finalText = result.text || "";
    finalTitle = result.title || url.split("/").pop();
  } else if (!text) {
    const result = await extractText(url, type);
    finalText = result.text || "";
  } else if (!title) {
    const result = await extractText(url, type);
    finalTitle = result.title || url.split("/").pop();
  }
  
  const tags = await generateTags(finalText, finalTitle);
  const topic = await generateTopic(finalText, finalTitle);
  const chunks = chunkText(finalText, 500);

  // Save full note in MongoDB
  const note = await notesModel.create({ userId, url, type, title:finalTitle, text:finalText, tags, topic });
  const noteId = note._id.toString();

  // Save embeddings in Chroma Cloud
  const collection = await client.getOrCreateCollection({ name: "notes" });
  for (let i = 0; i < chunks.length; i++) {
    const emb = await generateEmbedding(chunks[i]);
    await collection.add({
      ids: [`${noteId}-${i}`],
      embeddings: [emb],
      metadatas: [{ userId, url, type, title, chunkIndex: i, tags: tags, topic }]
    });
  }

  console.log("Saved note & embeddings:", title);
}



async function saveImage(userId, url, title, text) {
  // Ensure title/text are always strings
  title = title || "image";
  text = text || "Image content not extractable";

  const tags = ["image"];
  const topic = "image";
  const type = "image";

  // Save to MongoDB
  const note = await notesModel.create({ userId, url, type, title, text, tags, topic });
  return note;
}
// Semantic search
async function searchNotes(userId, queryText, topK = 5) {
  const queryEmbedding = await generateEmbedding(queryText);
  const collection = await client.getOrCreateCollection({ name: "notes" });

  const queryTags = extractTagsFromQuery(queryText);

  let whereClause = { userId };

  // ✅ Use tags if available
  if (queryTags.length > 0) {
    whereClause.tags = { $in: queryTags };
  }

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK * 2, // 🔥 get more results for better filtering
    where: whereClause
  });

  const distances = results.distances[0];
  const ids = results.ids[0];

  console.log("Distances:", distances);

  // ✅ Dynamic threshold
  const minDist = Math.min(...distances);
  const THRESHOLD = minDist + 0.3;

  // ✅ Filter relevant chunks
  const filtered = distances
    .map((dist, i) => ({
      id: ids[i],
      score: dist
    }))
    .filter(item => item.score <= THRESHOLD);

  if (filtered.length === 0) return [];

  // ✅ Extract noteIds
  const noteIds = filtered.map(item => item.id.split("-")[0]);
  const uniqueNoteIds = [...new Set(noteIds)];

  // ✅ Fetch notes
  return await notesModel.find({
    _id: { $in: uniqueNoteIds }
  });
}

async function searchNotesController(req, res) {
  try {
    const { query } = req.body;
    const { userId } = req.user;

    // ✅ Validation
    if (!userId || !query) {
      return res.status(400).json({
        error: "userId and query are required"
      });
    }

    // ✅ Call updated search (no 3rd param needed)
    const results = await searchNotes(userId, query);

    // ✅ Handle no results
    if (!results || results.length === 0) {
      return res.json({
        results: [],
        message: "No relevant notes found"
      });
    }

    // ✅ Safe response
    const formatted = results.map(n => ({
      id: n._id,
      title: n.title || "Untitled",
      preview: n.text ? n.text.slice(0, 200) : "",
      url: n.url || null
    }));

    res.json({ results: formatted });

  } catch (err) {
    console.error("❌ Search Error:", err.message);

    res.status(500).json({
      error: "Search failed",
      details: err.message
    });
  }
}
async function saveNoteController(req,res) {
   const { url,title,text } = req.body;
  const{userId} =req.user

  if (!userId || !url) {
    return res.status(400).json({ error: "userId and url are required" });
  }

  try {
    await saveNote(userId, url,title,text);
  
    res.json({ success: true, message: "Note saved and embeddings generated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save note" });
  }
}


async function generateCollections(userId) {
  const notes = await notesModel.find({ userId:new mongoose.Types.ObjectId(userId) });
  console.log(notes)
  if (!notes || notes.length === 0) return [];

  const grouped = {};

  notes.forEach(note => {
    let topicName;

    if (note.type === "image") {
      // All images go into one collection
      topicName = "Images";
    } else {
      // Fallbacks: 1st Generated Topic -> 2nd First Tag -> 3rd Title
      topicName = note.topic || (note.tags && note.tags.length > 0 ? note.tags[0] : note.title) || "Untitled";

      // Normalize format to title casing for aesthetic collections
      topicName = topicName.split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      // Append "Notes" if not already present
      if (!topicName.toLowerCase().includes("notes")) {
        topicName += " Notes";
      }
    }

    if (!grouped[topicName]) grouped[topicName] = [];
    grouped[topicName].push(note._id.toString());
  });

  const collections = Object.keys(grouped).map(topic => ({
    userId,
    name: topic,
    noteIds: grouped[topic],
    size: grouped[topic].length
  }));

  // Save to MongoDB
  await collectionModel.deleteMany({ userId });
  await collectionModel.insertMany(collections);

  return collections;
}

// Helper to compute dot product / cosine similarity (vectors are already L2 normalized)
function cosineSimilarity(vecA, vecB) {
  let sim = 0;
  for (let i = 0; i < vecA.length; i++) {
    sim += vecA[i] * vecB[i];
  }
  return sim;
}

async function getGraphController(req, res) {
  const { userId } = req.user;
  try {
    const notes = await notesModel.find({ userId });
    
    // Create Nodes
    const nodesMap = new Map();
    const links = [];
    
    // Central concept lists
    const uniqueTopics = new Set();
    
    notes.forEach(note => {
      const id = note._id.toString();
      nodesMap.set(id, {
        id,
        name: note.title || "Untitled",
        type: "note",
        group: 1, // Visual color grouping
        val: 3 // Node size multiplier
      });
      
      // Node linking to its topic (Explicit edge)
      if (note.topic) {
          let tName = note.topic.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          uniqueTopics.add(tName);
          links.push({ source: id, target: `topic-${tName}`, type: "explicit" });
      }
    });
    
    uniqueTopics.forEach(topic => {
      nodesMap.set(`topic-${topic}`, {
        id: `topic-${topic}`,
        name: topic,
        type: "topic",
        group: 3,
        val: 5
      });
    });

    // Semantic Similarity Edges (Implicit Vectors)
    try {
      const collection = await client.getOrCreateCollection({ name: "notes" });
      const chromaData = await collection.get({
        where: { userId },
        include: ["embeddings", "metadatas"]
      });
      
      const { ids, embeddings } = chromaData;
      
      // We only compare the 0th chunk of every document to keep the graph lightweight & fast
      // But if there are multiple chunks we could average them. Let's strictly use the first chunk.
      // ids look like: "mongodbId-0" -> So we filter for "-0" suffixes or map them directly
      const noteToEmbedding = {};
      for(let i = 0; i < ids.length; i++){
          const [nId, chunkIdx] = ids[i].split('-');
          if(chunkIdx === "0") {
              noteToEmbedding[nId] = embeddings[i];
          }
      }
      
      const noteIdsWithVec = Object.keys(noteToEmbedding);
      // O(N^2) pairwise similarity
      for (let i = 0; i < noteIdsWithVec.length; i++) {
        for (let j = i + 1; j < noteIdsWithVec.length; j++) {
          const idA = noteIdsWithVec[i];
          const idB = noteIdsWithVec[j];
          const sim = cosineSimilarity(noteToEmbedding[idA], noteToEmbedding[idB]);
          
          if (sim > 0.65) { 
            // 0.65 threshold usually catches strong contextual matches in MiniLM
            // Only add if both actually exist in our nodesMap (to avoid deleted-node ghost links)
            if (nodesMap.has(idA) && nodesMap.has(idB)) {
                links.push({
                  source: idA,
                  target: idB,
                  type: "semantic",
                  strength: sim, // optional strength property for visual distance tweaking
                  color: "#6d28d9" // Memora accent color
                });
            }
          }
        }
      }
    } catch(e) {
      console.warn("Could not generate semantic edges, skipping:", e.message);
    }
    
    // Convert Map to Array format compatible with react-force-graph
    const nodes = Array.from(nodesMap.values());
    
    res.json({ nodes, links });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build graph data" });
  }
}

async function generateCollectionsController(req, res) {
  const { userId } = req.user;
  try {
    const collections = await generateCollections(userId);
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate collections" });
  }
}
async function getAllNotesController(req,res) {
  let {userId}=req.user
  let notes= await notesModel.find({userId})
  res.status(200).json({
    message:"notes fetched successfully",
    notes
  })
}
async function getAllCollectionsController(req,res) {
   let {userId}=req.user
   let collections=await collectionModel.find({userId})
     res.status(200).json({
    message:"notes fetched successfully",
    collections
  })
}

        

async function deleteNoteController(req, res) {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const note = await notesModel.findOne({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }
    await notesModel.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Error:', err.message);
    res.status(500).json({ error: 'Failed to delete note' });
  }
}

async function uploadPdfController(req, res) {
  try {
    const { userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname || 'upload.pdf';
    const customTitle = req.body.title?.trim() || '';

    // 1️⃣ Upload to ImageKit
    const uploadResponse = await new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: buffer,
          fileName: `${Date.now()}_${originalName}`,
          folder: '/memora/pdfs',
          useUniqueFileName: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const pdfUrl = uploadResponse.url;
    console.log('✅ ImageKit upload:', pdfUrl);

    // 2️⃣ Extract text from buffer
    let pdfText = '';
    let pdfTitle = customTitle;
    try {
      const parsed = await pdf(buffer);
      pdfText = parsed.text || '';
      if (!pdfTitle) {
        pdfTitle = parsed.info?.Title || originalName.replace('.pdf', '');
      }
    } catch (e) {
      console.warn('PDF text extraction failed, using filename as fallback:', e.message);
      pdfText = `PDF document: ${originalName}`;
      if (!pdfTitle) pdfTitle = originalName.replace('.pdf', '');
    }

    // 3️⃣ AI tags + topic
    const tags = await generateTags(pdfText, pdfTitle);
    const topic = await generateTopic(pdfText, pdfTitle);

    // 4️⃣ Save to MongoDB
    const note = await notesModel.create({
      userId,
      url: pdfUrl,
      type: 'pdf',
      title: pdfTitle,
      text: pdfText,
      tags,
      topic,
    });
    const noteId = note._id.toString();

    // 5️⃣ Save embeddings in ChromaDB
    const chunks = chunkText(pdfText, 500);
    const collection = await client.getOrCreateCollection({ name: 'notes' });
    for (let i = 0; i < chunks.length; i++) {
      const emb = await generateEmbedding(chunks[i]);
      await collection.add({
        ids: [`${noteId}-${i}`],
        embeddings: [emb],
        metadatas: [{ userId, url: pdfUrl, type: 'pdf', title: pdfTitle, chunkIndex: i, tags, topic }],
      });
    }

    console.log('✅ PDF note saved:', pdfTitle);
    res.json({ success: true, message: 'PDF saved successfully', noteId });
  } catch (err) {
    console.error('❌ PDF Upload Error:', err.message);
    res.status(500).json({ error: 'Failed to upload PDF', details: err.message });
  }
}

// --- Highlights & Memory Resurfacing ---

async function toggleHighlightController(req, res) {
  const { id } = req.params;
  const { userId } = req.user;
  
  try {
    const note = await notesModel.findOne({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or not authorized' });
    }
    
    // Toggle the boolean
    note.isHighlight = !note.isHighlight;
    await note.save();
    
    res.status(200).json({ success: true, isHighlight: note.isHighlight, message: 'Highlight toggled successfully' });
  } catch (err) {
    console.error('❌ Toggle Highlight Error:', err.message);
    res.status(500).json({ error: 'Failed to toggle highlight' });
  }
}

async function getHighlightedNotesController(req, res) {
  const { userId } = req.user;
  try {
    const notes = await notesModel.find({ userId, isHighlight: true });
    res.status(200).json({
      message: "Highlighted notes fetched successfully",
      notes
    });
  } catch (err) {
    console.error('❌ Get Highlights Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch highlighted notes' });
  }
}

async function getResurfacedNotesController(req, res) {
  const { userId } = req.user;
  try {
    // Generate an ObjectId for 7 days ago to filter out recent notes
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hexSeconds = Math.floor(sevenDaysAgo.getTime() / 1000).toString(16);
    const objectIdForSevenDaysAgo = new mongoose.Types.ObjectId(hexSeconds + "0000000000000000");

    // We want to fetch ~3 random older notes for the "Memory Lane" feature
    const notes = await notesModel.aggregate([
      { $match: { userId: userId, _id: { $lt: objectIdForSevenDaysAgo } } },
      { $sample: { size: 3 } }
    ]);
    
    res.status(200).json({
      message: "Resurfaced notes fetched successfully",
      notes
    });
  } catch (err) {
    console.error('❌ Get Resurfaced Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resurfaced notes' });
  }
}

export default {
  saveNoteController,
  searchNotesController,
  generateCollectionsController,
  getAllNotesController,
  getAllCollectionsController,
  deleteNoteController,
  getGraphController,
  uploadPdfController,
  toggleHighlightController,
  getHighlightedNotesController,
  getResurfacedNotesController
};
