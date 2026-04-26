<div align="center">

# ⚡ A P E X — WhatsApp Bot

**A powerful, free, self-hosted WhatsApp bot with 80+ commands**
*AI-powered • Group Management • Health • Entertainment • Tools*

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![WhatsApp Web.js](https://img.shields.io/badge/whatsapp--web.js-v1.23-brightgreen?style=flat-square&logo=whatsapp)](https://github.com/pedroslopez/whatsapp-web.js)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Made by](https://img.shields.io/badge/Made%20by-Umar%20J-black?style=flat-square)](https://github.com/umarj-max)

</div>

---

## 🖤 What is APEX?

APEX is a feature-rich WhatsApp bot built on **whatsapp-web.js** — completely free to run, no WhatsApp Business API needed. It runs on your own number and handles everything from AI conversations to group management, health tools, entertainment, and much more.

> Built and maintained by **Umar J** — [@umarj-max](https://github.com/umarj-max)

---

## ✨ Features

- 🤖 **Triple AI fallback** — David API → Groq (Llama 3) → Gemini 2.0 Flash
- 👥 **Full group management** — antilink, warn system, welcome/goodbye, rules
- 🏥 **Health tools** — BMI, calories, medicine info, symptoms checker
- 🎵 **Media** — stickers, TTS audio, music search, downloaders
- 🛠️ **Utility** — weather, crypto, currency, Wikipedia, QR codes, URL shortener
- 🎮 **Entertainment** — memes, trivia, polls, roasts, would-you-rather
- 🕌 **Islamic** — Quran verses, duas, prayer times
- ⚡ **15s cooldown** per user to prevent spam

---

## 📋 Command List

<details>
<summary>🤖 AI Commands</summary>

| Command | Description |
|---------|-------------|
| `.ai <question>` | Ask the AI anything |
| `.joke` | Random funny joke |
| `.fact` | Random mind-blowing fact |
| `.roast` | Savage roast (reply to target) |

</details>

<details>
<summary>🧠 Smart Commands</summary>

| Command | Description |
|---------|-------------|
| `.summarize` | Reply to a message to summarize it |
| `.fix <text>` | Fix grammar and spelling |
| `.translate <lang> <text>` | Translate to any language |
| `.wiki <topic>` | Wikipedia summary |
| `.zodiac <sign>` | Daily horoscope |

</details>

<details>
<summary>🛠️ Tools</summary>

| Command | Description |
|---------|-------------|
| `.weather <city>` | Current weather |
| `.crypto <coin>` | Live crypto price |
| `.currency <amt> <from> <to>` | Currency conversion |
| `.calc <expression>` | Calculator |
| `.remind <mins> <msg>` | Set a reminder |
| `.qr <text>` | Generate QR code |
| `.shorturl <url>` | Shorten a URL |
| `.define <word>` | Dictionary definition |
| `.time <timezone>` | Current time anywhere |
| `.tts <text>` | Text to audio message |
| `.news [category]` | Latest headlines |
| `.meme` | Random meme |
| `.lyrics <song>` | Song lyrics |

</details>

<details>
<summary>🏥 Health</summary>

| Command | Description |
|---------|-------------|
| `.bmi <weight> <height>` | BMI calculator |
| `.water <weight kg>` | Daily water intake |
| `.calories <food>` | Calorie info |
| `.medicine <name>` | Medicine details & warnings |
| `.symptoms <symptoms>` | Possible causes |
| `.workout <goal>` | Weekly workout plan |
| `.diet <goal>` | Daily diet plan |
| `.mentalhealth` | Mental health tips |

</details>

<details>
<summary>👥 Group Management</summary>

| Command | Description |
|---------|-------------|
| `.antilink on/off` | Auto-delete links |
| `.warn on/off` | Enable warn system |
| `.warn` | Warn a member (reply) |
| `.warnings` | Check warnings (reply) |
| `.clearwarn` | Clear warnings (reply) |
| `.welcome on/off` | Welcome new members |
| `.goodbye on/off` | Goodbye messages |
| `.setrules <text>` | Set group rules |
| `.rules` | View group rules |
| `.groupinfo` | Group details & admins |
| `.tagall` | Mention everyone |
| `.kick` | Remove a member (reply) |
| `.promote` | Promote to admin (reply) |
| `.demote` | Demote admin (reply) |
| `.invite` | Get invite link |
| `.opengroup` | Open group for all |
| `.closegroup` | Admins only mode |

</details>

<details>
<summary>🎮 Fun & Games</summary>

| Command | Description |
|---------|-------------|
| `.wyr` | Would You Rather |
| `.trivia` | Random trivia question |
| `.poll <q> \| <opt1> \| <opt2>` | Create a poll |
| `.compliment` | Random compliment |
| `.insult` | Playful insult |
| `.ascii <text>` | ASCII art |
| `.ship <n1> & <n2>` | Compatibility score |
| `.8ball <question>` | Magic 8-ball |
| `.flipcoin` | Flip a coin |
| `.truth` | Truth question |
| `.dare` | Dare challenge |

</details>

<details>
<summary>🎨 Sticker & Media</summary>

| Command | Description |
|---------|-------------|
| `.sticker` | Convert image to sticker |
| `.take <name>` | Rename a sticker |
| `.take <name> \| <author>` | Rename with author |

</details>

<details>
<summary>🕌 Islamic</summary>

| Command | Description |
|---------|-------------|
| `.quran` | Random Quran verse |
| `.dua` | Random supplication |
| `.surah <number>` | Get a surah |
| `.prayertime <city>` | Prayer times |

</details>

<details>
<summary>👤 User & Owner</summary>

| Command | Description |
|---------|-------------|
| `.ping` | Bot latency check |
| `.uptime` | Bot uptime |
| `.info` | Bot info |
| `.menu` | Full command list |
| `.help` | Contact owner |
| `.shutdown` | Turn off bot (owner) |
| `.broadcast <msg>` | Broadcast message (owner) |

</details>

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18 or higher
- A WhatsApp account (personal number works)

### 1. Clone the repository
```bash
git clone https://github.com/umarj-max/APEX-WhatsApp-Bot.git
cd APEX-WhatsApp-Bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file in the root folder:
```env
OWNER_NUMBER=923xxxxxxxxx
WEATHER_API_KEY=your_openweathermap_key
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Get your free API keys

| Key | Where to get | Required? |
|-----|-------------|-----------|
| `WEATHER_API_KEY` | [openweathermap.org](https://openweathermap.org/api) | Yes (for weather) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Recommended |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) | Optional |

### 5. Start the bot
```bash
node index.js
```

Scan the QR code with WhatsApp (**Settings → Linked Devices → Link a Device**)

---

## 🤖 AI Fallback System

APEX uses a **3-layer AI chain** to ensure commands always respond:

```
David API (primary)
    ↓ fails
Groq — Llama 3.3 70B (secondary)
    ↓ fails
Gemini 2.0 Flash (tertiary)
    ↓ fails
Error message shown
```

This means even if one AI provider goes down, your bot keeps working seamlessly.

---

## 📁 Project Structure

```
APEX-WhatsApp-Bot/
├── index.js          # Main entry point & message handler
├── ai.js             # AI fallback chain (David → Groq → Gemini)
├── fun.js            # Fun commands
├── reactions.js      # Reaction GIF commands
├── group.js          # Group management
├── events.js         # Welcome/goodbye/rules
├── warn.js           # Warning system
├── health.js         # Health commands
├── tools.js          # Utility tools
├── smart.js          # Smart AI commands
├── extras.js         # Extra fun commands
├── islam.js          # Islamic commands
├── sticker.js        # Sticker commands
├── music.js          # Music commands
├── downloader.js     # Media downloaders
├── owner.js          # Owner-only commands
├── user.js           # User commands
├── apexWrap.js       # Message formatting
├── cooldown.js       # Cooldown system
└── permissions.js    # Admin/owner checks
```

---

## ⚠️ Disclaimer

- This bot is for **personal/educational use only**
- Health commands (medicine, symptoms) are **informational only** — always consult a real doctor
- Using bots on WhatsApp personal accounts may violate WhatsApp's ToS — use responsibly

---

## 📸 Connect

Built by **Umar J**
- Instagram: [@umar.j0_](https://instagram.com/umar.j0_)
- GitHub: [@umarj-max](https://github.com/umarj-max)
- Telegram: [@umarj_1](https://t.me/umarj_1)

---

<div align="center">

**⚡ APEX — Built different. Built free. Built by Umar J 🖤**

</div>
