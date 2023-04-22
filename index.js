
import { ApiConversation } from './config.js'

const ChatGPTEnhance = {
    fetch: (window._fetch = window._fetch || window.fetch),
    async init() {
        console.log('ChatGPT Enhance start init');
        this.addWindowFetch();
        this.addMainContainer();
        console.log('ChatGPT Enhance end init');
    },
    addWindowFetch() {
        window.fetch = async (...args) => {
            if (args[0] !== ApiConversation) {
                return this.fetch(...args);
            }
            debugger
            try {
                // 解析原始数据
                const options = args[1];
                const body = JSON.parse(options.body);
                const prompt = body.messages[0].content.parts[0];
                // 处理模版
                const newPrompt = `Your task is to rewrite the entire text in better words and make it unique with natural language.output shall be in Chinese. The text to rewrite it is this:${prompt}
            Please write in emotional tone, poetic writing style.`;
                body.messages[0].content.parts[0] = newPrompt;
                // 执行请求
                options.body = JSON.stringify(body);
                return this.fetch(args[0], options);
            } catch (err) {
                console.error(err);
                return this.fetch(...args);
            }
        };
    },
    addMainContainer() {
        const container = document.createElement('div')
        container.id = 'chatgpt-enhance';
        container.className = 'chatgpt_enhance';
        const textarea = document.querySelector(`form textarea`);
        textarea.parentElement.prepend(container);
        container.innerHTML = `
        <div class="chatgpt_enhance">
            <div class="chatgpt_enhance_line_item">
                <div class="chatgpt_enhance_line_item" id="chatgptEnhanceOptions">
                    <label for="select1">语言:</label>
                    <select id="select1">
                        <option value="1">默认</option>
                        <option value="2">中文</option>
                        <option value="3">英文</option>
                    </select>
                </div>
                <div class="chatgpt_enhance_line_item">
                    <label for="select2">语调:</label>
                    <select id="select2">
                        <option value="1">默认</option>
                        <option value="2">有情调的</option>
                    </select>
                </div>
                <div class="chatgpt_enhance_line_item">
                    <label for="select3">风格:</label>
                    <select id="select3">
                        <option value="1">默认</option>
                        <option value="2">有诗意的</option>
                    </select>
                </div>
            </div>
        </div>
        `;
    }
}

ChatGPTEnhance.init();