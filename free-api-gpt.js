/**
 * @license
 * Copyright (c) 2025 Ciptik
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Author: Ciptik
 * Email: stepan.ciptik@yandex.ru
 */

class Bot {
    static #instance = null;
    #tempUserId;

    constructor() {
        if (Bot.#instance) {
            return Bot.#instance;
        }
        Bot.#instance = this;
    }

    static async init() {
        if (!Bot.#instance) {
            Bot.#instance = new Bot();
            await Bot.#instance.#initialize();
        }
        return Bot.#instance;
    }

    async #initialize() {
        this.#tempUserId = await this.#fetchTempUserId();
    }

    async #fetchTempUserId() {
        try {
            const response = await fetch('https://playground.julius.ai/api/temp_user_id');
            const data = await response.json();
            return data.temp_user_id;
        } catch (error) {
            console.error('Error fetching tempUserId:', error);
        }
    }

    async createChat() {
        if (!this.#tempUserId) throw new Error("Bot is not initialized yet.");

        try {
            const response = await fetch('https://playground.julius.ai/api/chat/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'is-demo': this.#tempUserId
                },
                body: JSON.stringify({
                    provider: 'default',
                    server_type: 'CPU',
                    template_id: null,
                    chat_type: null,
                    tool_preferences: null,
                    conversation_plan: null
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return new Chat(this.#tempUserId, data.id);
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }
}

class Chat {
    #tempUserId;
    #chatId;

    constructor(tempUserId, chatId) {
        this.#tempUserId = tempUserId;
        this.#chatId = chatId;
    }

    decodeUnicodeString(str) {
        return str.replace(/\\u([0-9A-Fa-f]{4})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        });
    }

    async sendMessage(messageContent) {
        try {
            const response = await fetch('https://playground.julius.ai/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'conversation-id': this.#chatId,
                    'is-demo': this.#tempUserId
                },
                body: JSON.stringify({
                    message: { content: messageContent },
                    provider: 'default',
                    chat_mode: 'auto',
                    client_version: '20240130',
                    theme: 'dark',
                    new_images: null,
                    new_attachments: null,
                    dataframe_format: 'json',
                    selectedModels: ['GPT-4o mini']
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const rawText = await response.text();
            const contentValues = [...rawText.matchAll(/"content":\s*"([^"]*)"/g)].map(m => m[1]);
            return this.decodeUnicodeString(contentValues.join(''));
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}
