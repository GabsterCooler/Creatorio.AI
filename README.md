# 🚀 Creatorio.AI

Creatorio.AI is a **Next.js web application** that offers different creative AI applications. Right now, only PC Builder AI is available. 
First, the algorithm asks an AI to give the best PC build based on a filled form by the user. Then, the algorithm checks in a dataset (The inventory) the top-k most similar components to the one suggested for each category (CPU, PSU, Motherboard, etc.). Finally, the AI is asked again to create a PC build by picking in a range of the most similar components to the one previously suggested. This project is inspired by the concept of RAG (Retrieval-Augmented Generation), but uses the idea of constrained generation.

Dataset source: [PC Part Dataset](https://github.com/docyx/pc-part-dataset/tree/main)

You will need an OpenRouter API Key to communicate.

---

## 🌟 Features

- Generate PC builds by specifying **usage, budget, resolution, and performance goals**  
- Instant **total price calculation** for your build  
- AI-powered build generation using **OpenRouter API**  
- Copy builds easily for sharing  
- Smooth animations powered by **Framer Motion**  
- Responsive, modern UI built with **Tailwind CSS**

---

## 🛠️ Getting Started

Before following these steps, make sure you have Node.js and a package manager installed between npm, yarn, pnpm or bun.

### 1️⃣ Navigate to the projer

```bash
cd ./app
```
### 2️⃣ Install dependencies
```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

### 3️⃣ Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then visit the app at: http://localhost:3000