import { apexWrap, apexThinking, apexError } from './apexWrap.js';
import { askAI } from './ai.js';

const DISCLAIMER = '\n\n⚠️ _This is for info only. Always consult a real doctor._';

export const commands = [
  '.bmi', '.calories', '.medicine', '.symptoms',
  '.workout', '.diet', '.water', '.mentalhealth'
];

export async function handle(msg, body, client) {
  const chatId = msg._chatId || msg.from;

  // .bmi <weight kg> <height cm>
  // example: .bmi 70 175
  if (body.startsWith('.bmi ')) {
    const parts = body.slice(5).trim().split(' ');
    if (parts.length < 2) {
      await client.sendMessage(chatId, apexError('usage: .bmi <weight kg> <height cm>\nexample: .bmi 70 175'));
      return;
    }
    const weight = parseFloat(parts[0]);
    const height = parseFloat(parts[1]) / 100; // cm to m
    if (isNaN(weight) || isNaN(height) || height <= 0) {
      await client.sendMessage(chatId, apexError('invalid values\nexample: .bmi 70 175'));
      return;
    }
    await msg.react('⚖️');
    const bmi = (weight / (height * height)).toFixed(1);
    let category, emoji, advice;
    if (bmi < 18.5) {
      category = 'Underweight'; emoji = '😟';
      advice = 'You should eat more nutritious food and consult a doctor.';
    } else if (bmi < 25) {
      category = 'Normal weight'; emoji = '✅';
      advice = 'Great! Maintain your healthy lifestyle.';
    } else if (bmi < 30) {
      category = 'Overweight'; emoji = '⚠️';
      advice = 'Consider a balanced diet and regular exercise.';
    } else {
      category = 'Obese'; emoji = '🚨';
      advice = 'Please consult a doctor for a proper health plan.';
    }
    await client.sendMessage(chatId, apexWrap(
      `⚖️ *BMI Calculator*\n\n` +
      `👤 Weight: *${weight} kg*\n` +
      `📏 Height: *${parseFloat(parts[1])} cm*\n\n` +
      `📊 BMI: *${bmi}*\n` +
      `${emoji} Category: *${category}*\n\n` +
      `💡 ${advice}`
    ));
    return;
  }

  // .calories <food>
  if (body.startsWith('.calories ')) {
    const food = body.slice(10).trim();
    await msg.react('🍽️');
    await client.sendMessage(chatId, apexThinking('checking calories...'));
    try {
      const result = await askAI(`Give me the approximate calorie count and basic nutrition info (protein, carbs, fat) for: "${food}". Keep it short and formatted with emojis. Just the facts.`);
      await client.sendMessage(chatId, apexWrap(`🍽️ *Calories — ${food}*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not fetch calorie info'));
    }
    return;
  }

  // .medicine <name>
  if (body.startsWith('.medicine ')) {
    const med = body.slice(10).trim();
    await msg.react('💊');
    await client.sendMessage(chatId, apexThinking('looking up medicine...'));
    try {
      const result = await askAI(
        `Give me info about the medicine "${med}". Include:\n` +
        `- What it is used for\n` +
        `- Common dosage\n` +
        `- Common side effects\n` +
        `- Any important warnings\n` +
        `Keep it clear and short. Use emojis for each section.`
      );
      await client.sendMessage(chatId, apexWrap(`💊 *Medicine — ${med}*\n\n${result}${DISCLAIMER}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not find medicine info'));
    }
    return;
  }

  // .symptoms <symptoms>
  if (body.startsWith('.symptoms ')) {
    const symptoms = body.slice(10).trim();
    await msg.react('🩺');
    await client.sendMessage(chatId, apexThinking('analyzing symptoms...'));
    try {
      const result = await askAI(
        `A person has these symptoms: "${symptoms}"\n` +
        `Give 3 possible causes, what they might mean, and basic home remedies if safe.\n` +
        `Be clear, use emojis, keep it short. Do NOT diagnose — just inform.`
      );
      await client.sendMessage(chatId, apexWrap(`🩺 *Symptoms Check*\n\n${result}${DISCLAIMER}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not analyze symptoms'));
    }
    return;
  }

  // .workout <goal>
  // example: .workout weight loss
  if (body.startsWith('.workout ')) {
    const goal = body.slice(9).trim();
    await msg.react('💪');
    await client.sendMessage(chatId, apexThinking('building your workout...'));
    try {
      const result = await askAI(
        `Create a simple weekly workout plan for someone whose goal is: "${goal}".\n` +
        `Include exercise names, sets, reps, and rest days.\n` +
        `Keep it beginner-friendly, practical, and formatted with emojis.`
      );
      await client.sendMessage(chatId, apexWrap(`💪 *Workout Plan — ${goal}*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not generate workout plan'));
    }
    return;
  }

  // .diet <goal>
  // example: .diet weight loss
  if (body.startsWith('.diet ')) {
    const goal = body.slice(6).trim();
    await msg.react('🥗');
    await client.sendMessage(chatId, apexThinking('building your diet plan...'));
    try {
      const result = await askAI(
        `Give a simple daily diet plan for someone whose goal is: "${goal}".\n` +
        `Include breakfast, lunch, dinner, and snacks with approximate portions.\n` +
        `Keep it realistic, practical, and formatted with emojis.`
      );
      await client.sendMessage(chatId, apexWrap(`🥗 *Diet Plan — ${goal}*\n\n${result}`));
    } catch {
      await client.sendMessage(chatId, apexError('could not generate diet plan'));
    }
    return;
  }

  // .water <weight kg>
  // example: .water 70
  if (body.startsWith('.water ')) {
    const weight = parseFloat(body.slice(7).trim());
    if (isNaN(weight) || weight <= 0) {
      await client.sendMessage(chatId, apexError('usage: .water <weight in kg>\nexample: .water 70'));
      return;
    }
    await msg.react('💧');
    const liters = (weight * 0.033).toFixed(1);
    const glasses = Math.ceil(liters / 0.25);
    await client.sendMessage(chatId, apexWrap(
      `💧 *Daily Water Intake*\n\n` +
      `👤 Weight: *${weight} kg*\n\n` +
      `🚰 Recommended: *${liters} liters/day*\n` +
      `🥛 That's about *${glasses} glasses* (250ml each)\n\n` +
      `💡 Drink more if you exercise or it's hot outside.`
    ));
    return;
  }

  // .mentalhealth
  if (body === '.mentalhealth') {
    await msg.react('🧠');
    await client.sendMessage(chatId, apexThinking('loading mental health tips...'));
    try {
      const result = await askAI(
        `Give 5 practical mental health tips for everyday wellbeing.\n` +
        `Include tips for stress, anxiety, sleep, and mood.\n` +
        `Be warm, supportive, and use emojis. Keep each tip short.`
      );
      await client.sendMessage(chatId, apexWrap(`🧠 *Mental Health Tips*\n\n${result}\n\n💚 _You are not alone. It's okay to ask for help._`));
    } catch {
      await client.sendMessage(chatId, apexError('could not load tips'));
    }
    return;
  }
}
