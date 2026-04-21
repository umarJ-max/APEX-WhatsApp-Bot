import { apexWrap, apexThinking, apexError } from './apexWrap.js';

export const commands = ['.quran', '.surah', '.prayertime', '.dua'];

export async function handle(msg, body, client) {

  // .quran — random verse
  if (body === '.quran') {
    await msg.react('📖');
    await client.sendMessage((msg._chatId || msg.from), apexThinking('fetching a verse...'));
    try {
      const randomAyah = Math.floor(Math.random() * 6236) + 1;
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/quran-uthmani,en.asad`);
      const data = await res.json();
      const arabic = data.data[0];
      const english = data.data[1];
      await client.sendMessage((msg._chatId || msg.from), apexWrap(
        `📖 *Quran — ${arabic.surah.englishName} (${arabic.surah.name})*\n*Ayah ${arabic.numberInSurah}*\n\n${arabic.text}\n\n_"${english.text}"_`
      ));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('could not fetch verse, try again'));
    }
    return;
  }

  // .surah <number or name>
  if (body.startsWith('.surah')) {
    await msg.react('📖');
    const query = body.slice(7).trim();
    if (!query) {
      await client.sendMessage((msg._chatId || msg.from), apexError('usage: .surah <number>\nexample: .surah 1'));
      return;
    }
    await client.sendMessage((msg._chatId || msg.from), apexThinking('fetching surah...'));
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${query}/en.asad`);
      const data = await res.json();
      if (data.code !== 200) throw new Error('Not found');
      const surah = data.data;
      const preview = surah.ayahs.slice(0, 3).map((a, i) => `${i + 1}. _${a.text}_`).join('\n\n');
      await client.sendMessage((msg._chatId || msg.from), apexWrap(
        `📖 *${surah.englishName}*\n_${surah.englishNameTranslation}_\n\n${preview}\n\n_...${surah.numberOfAyahs} ayahs total_`
      ));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError('surah not found. use a number between 1-114'));
    }
    return;
  }

  // .prayertime <city>
  if (body.startsWith('.prayertime')) {
    await msg.react('🕌');
    const city = body.slice(12).trim() || 'Karachi';
    await client.sendMessage((msg._chatId || msg.from), apexThinking('fetching prayer times...'));
    try {
      const today = new Date();
      const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=PK&method=1`);
      const data = await res.json();
      if (data.code !== 200) throw new Error('City not found');
      const t = data.data.timings;
      await client.sendMessage((msg._chatId || msg.from), apexWrap(
        `🕌 *Prayer Times — ${city}*\n\n🌅 Fajr: *${t.Fajr}*\n☀️ Sunrise: *${t.Sunrise}*\n🌤️ Dhuhr: *${t.Dhuhr}*\n🌇 Asr: *${t.Asr}*\n🌆 Maghrib: *${t.Maghrib}*\n🌙 Isha: *${t.Isha}*`
      ));
    } catch {
      await client.sendMessage((msg._chatId || msg.from), apexError(`could not find prayer times for "${city}"`));
    }
    return;
  }

  // .dua — random dua
  if (body === '.dua') {
    await msg.react('🤲');
    const duas = [
      { arabic: 'رَبِّ زِدْنِي عِلْمًا', english: 'My Lord, increase me in knowledge.', ref: 'Quran 20:114' },
      { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', english: 'Our Lord, give us good in this world and good in the Hereafter.', ref: 'Quran 2:201' },
      { arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', english: 'My Lord, expand my chest and ease my task for me.', ref: 'Quran 20:25-26' },
      { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', english: 'Allah is sufficient for us and He is the best disposer of affairs.', ref: 'Quran 3:173' },
      { arabic: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', english: 'Our Lord, do not take us to task if we forget or make mistakes.', ref: 'Quran 2:286' },
    ];
    const dua = duas[Math.floor(Math.random() * duas.length)];
    await client.sendMessage((msg._chatId || msg.from), apexWrap(`🤲 *Daily Dua*\n\n${dua.arabic}\n\n_"${dua.english}"_\n\n📚 ${dua.ref}`));
    return;
  }
}
