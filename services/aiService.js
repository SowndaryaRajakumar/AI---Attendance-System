const { getChatlogs } = require('../db/mongo');
const { getStudentAttendanceSummary } = require('./attendanceService');
const { logError } = require('../utils/logger');
const crypto = require('crypto');

async function generateChatResponse(userId, queryText) {
    let context = "You are a friendly, concise AI assistant for a College Attendance Management System.";

    // Inject real-time DB context context
    try {
        const summary = await getStudentAttendanceSummary(userId);
        console.log("AI DEBUG SUMMARY:", summary);
        if (summary) {
            context += `\nThe student talking to you has ${summary.percentage}% attendance. They attended ${summary.present} out of ${summary.total} classes.`;
            if (summary.total > 0 && summary.percentage < 75) {
                context += ` Highly encourage them to attend the next classes to reach the 75% required attendance threshold.`;
            } else if (summary.percentage === 100 && summary.total > 0) {
                context += ` Congratulate them on their perfect streak!`;
            }
        }
    } catch (e) {
        logError('Failed to inject student context for AI', e);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
        throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const payload = {
        model: "openai/gpt-3.5-turbo",
        messages: [
            { role: "system", content: context },
            { role: "user", content: queryText }
        ]
    };

    let responseText = "";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Attendance Manager AI",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            responseText = data.choices[0].message.content;
        } else {
            responseText = "I'm sorry, I couldn't process your request right now. AI Model returned no response.";
            logError('OpenRouter response error', data);
        }
    } catch (apiError) {
        logError('OpenRouter fetch error', apiError);
        responseText = "I'm currently unable to connect to my AI thought process.";
    }

    try {
        const chatlogsColl = getChatlogs();
        await chatlogsColl.insertOne({
            id: crypto.randomUUID(),
            userId,
            query: queryText,
            response: responseText,
            timestamp: new Date()
        });
    } catch (dbError) {
        logError('Failed to save chatlog', dbError);
    }

    return responseText;
}

module.exports = { generateChatResponse };
