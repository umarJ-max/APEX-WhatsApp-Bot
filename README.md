# 🤖 APEX WhatsApp Bot

A powerful, feature-rich WhatsApp bot built with Node.js and whatsapp-web.js. APEX runs 24/7 and responds to commands with style.

---

## ✨ Features

| Category | Commands |
|----------|----------|
| **AI** | `.ai` — Chat with AI |
| **Fun** | `.meme`, `.joke`, `.quote`, `.roll`, `.flip` |
| **Reactions** | `.pat`, `.hug`, `.slap`, `.bite`, `.poke`, `.wave`, `.wink`, `.blush`, `.dance`, `.kill` & more |
| **Islamic** | `.quran`, `.hadith`, `.prayertime` |
| **Music** | `.play`, `.search` |
| **Stickers** | `.sticker`, `.toimg` |
| **Downloader** | `.yt`, `.ig`, `.tiktok` |
| **Group** | `.kick`, `.promote`, `.demote`, `.mute`, `.tagall` |
| **Owner** | `.broadcast`, `.block`, `.shutdown` |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/umarJ-max/APEX-WhatsApp-Bot.git
cd APEX-WhatsApp-Bot
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Edit `.env` and add your WhatsApp number:

```env
OWNER_NUMBER=1234567890
```

### 3. Run

```bash
node index.js
```

### 4. Connect

- Open WhatsApp on your phone
- Go to **Settings → Linked Devices → Link a Device**
- Scan the QR code in your terminal

---

## 📋 Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.x |
| npm | Latest |

---

## 🛠️ Commands

```
.ai <message>     🤖  AI chat
.meme             😂  Random meme
.quran <surah>    📖  Get Quran verses
.play <song>      🎵  Play music
.sticker          🖼️  Convert image to sticker
.yt <query>       📹  Download YouTube video
.ig <url>         📸  Download Instagram post
```

Type `.menu` or `.help` to see all commands.

---

## 📁 Project Structure

```
APEX-WhatsApp-Bot/
├── index.js          # Main entry point
├── ai.js             # AI chat module
├── fun.js            # Fun & entertainment
├── reactions.js      # Reaction GIFs
├── islam.js          # Islamic content
├── music.js          # Music player
├── sticker.js        # Sticker tools
├── downloader.js     # Social media downloader
├── group.js          # Group management
├── owner.js          # Owner-only commands
├── cooldown.js       # Rate limiting
├── permissions.js    # Access control
├── .env.example      # Environment template
└── package.json      # Dependencies
```

---

## ⚙️ Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `OWNER_NUMBER` | Your WhatsApp number (with country code, no +) | ✅ Yes |

---

## 🔒 Security

- `.env` file is **gitignored** — never push secrets
- Session data stored locally, not uploaded
- Owner-only commands protected

---

## 📜 License

MIT License — feel free to use, modify, and distribute.

---

## 👤 Author

**Umar J** — [GitHub](https://github.com/umarJ-max)

---

<div align="center">

_Built with ❤️ using whatsapp-web.js_

</div>