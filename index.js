
import { ApiConversation } from './config.js'
import { StringUtils } from './utils.js'
import { Template } from './template.js'

const ChatGPTEnhance = {
    fetch: (window._fetch = window._fetch || window.fetch),
    mainContainer: null,
    templateInfo: null,
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
        this.mainContainer = container
        container.id = 'chatgpt-enhance';
        container.className = 'chatgpt_enhance';
        const textarea = document.querySelector(`form textarea`);
        textarea.parentElement.prepend(container);
        const templates = Template.getTemplates()
        let templateSelectOptionsHTML = '';
        templates.forEach((template) => {
            templateSelectOptionsHTML += `<option value="${template.code}">${template.name}</option>`;
        })
        container.innerHTML = `
        <div class="chatgpt_enhance chatgpt_enhance_font">
            <div class="chatgpt_enhance_line">
                <div class="chatgpt_enhance_line_item">
                    <label>模版:</label>
                    <select id="chatgptEnhanceTemplate">
                        ${templateSelectOptionsHTML}
                    </select>
                </div>
                <div class="chatgpt_enhance_line_item button_box_right">
                    <button id="chatgptEnhanceContinue">继续</button>
                </div>
            </div>
            <div class="chatgpt_enhance_line" id="chatgptEnhanceOptions">
                
            </div>
        </div>
        `;
        container.querySelector("#chatgptEnhanceContinue").addEventListener('click', () => {
            console.log('contine button click')
        });
        const templateSelect = container.querySelector("#chatgptEnhanceTemplate")
        container.querySelector("#chatgptEnhanceTemplate").addEventListener('change', () => {
            if (templateSelect.value == "") {
                this.templateInfo = null;
            } else {
                this.templateInfo = Template.getTemplateInfo(templateSelect.value);
            }
            this.addTemplateOptions();
        });

    },
    addTemplateOptions() {
        const templateOptions = this.mainContainer.querySelector("#chatgptEnhanceOptions")
        if (!this.templateInfo) {
            templateOptions.innerHTML = "";
            return;
        }

        if (!this.templateInfo.hasConfig) {
            templateOptions.innerHTML = "";
            return;
        }
        let configHTML = "";
        for (var i = 0; i < 3; i++) {
            let selectHTML = "";
            if (i < this.templateInfo.config.length) {
                const config = this.templateInfo.config[i];
                selectHTML += `<label>${config.name}:</label><select id="chatgpt_enhance_options_${config.name}">`;
                config.options.forEach((option) => {
                    selectHTML += `<option value="${option.code}">${option.name}</option>`;
                });
                selectHTML += "</select>";
            }
            configHTML += `
            <div class="chatgpt_enhance_line_item">
                ${selectHTML}
            </div>
            `
        }
        templateOptions.innerHTML = configHTML;
    }
}

ChatGPTEnhance.init();