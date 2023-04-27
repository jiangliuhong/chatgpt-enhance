
import { ApiConversation, CacheName, Version } from './config.js'
import { StringUtils, LocalData } from './utils.js'
import { Template } from './template.js'
import Client from './client.js'

const ChatGPTEnhance = {
    fetch: (window._fetch = window._fetch || window.fetch),
    templateInfo: null,
    templateConfigValues: {},
    debug: true,
    async init() {
        console.log('ChatGPT Enhance start init');
        await this.initData()
        this.addWindowFetch();
        this.addBodyObserver();
        console.log('ChatGPT Enhance end init');
    },
    async initData() {
        const version = await Client.requestVersion();
        // 校验插件版本，提示更新
        const pluginVersion = version.pluginVersion;
        if (Version != pluginVersion) {
            // TODO notify 提醒
            console.log('发现新版本：' + pluginVersion);
        }
        // 校验数据版本，判断是否更新数据缓存
        const dataVersion = version.dataVersion;
        const localDataVersion = LocalData.get(CacheName.DataVersion)
        if (!localDataVersion || localDataVersion != dataVersion) {
            this.log('start request data')
            const globalConfig = await Client.requestGlobalConfig();
            LocalData.setObject(CacheName.GlobalConfig, globalConfig);
            const templates = await Client.requestTemplates();
            LocalData.setObject(CacheName.Templates, templates);
            LocalData.set(CacheName.DataVersion, dataVersion)
        }
    },
    addWindowFetch() {
        window.fetch = async (...args) => {
            if (args[0] !== ApiConversation) {
                return this.fetch(...args);
            }
            if (!this.templateInfo || !this.templateInfo.template) {
                return this.fetch(...args);
            }
            try {
                // 解析原始数据
                const options = args[1];
                const body = JSON.parse(options.body);
                const prompt = body.messages[0].content.parts[0];
                // 处理模版
                const variables = {
                    prompt: prompt
                }
                for (const key in this.templateConfigValues) {
                    variables[key] = this.templateConfigValues[key];
                }
                const newPrompt = StringUtils.replaceTemplate(this.templateInfo.template, variables);
                this.log('new prompt:' + newPrompt);
                body.messages[0].content.parts[0] = newPrompt;
                // 执行请求
                options.body = JSON.stringify(body);
                return this.fetch(args[0], options);
            } catch (err) {
                // TODO 增加NotifyMessage提示
                console.error('解析模版失败,使用原prompt请求.', err);
                return this.fetch(...args);
            }
        };
    },
    /**添加页面Body监听器 */
    addBodyObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(async (mutation) => {
                if (mutation.type !== 'childList' && mutation.addedNodes.length == 0) {
                    return;
                }
                const node = mutation.addedNodes[0];
                if (!node || !node.querySelector) {
                    return;
                }
                await this.handleElementAdded(node);
            });
        });
        observer.observe(document.body, { subtree: true, childList: true });
    },
    /** 处理DOM元素添加事件 */
    async handleElementAdded(e) {
        // 如果添加的是顶部的版本Model标题，一般是切换聊天框时触发
        if (e.querySelector('h1.text-4xl')) {
            this.addMainContainer();
        }
        if (document.querySelector('.text-base.xl\\:max-w-3xl')) {
            this.addMainContainer();
        }
    },
    /**
     * 增加模版主容器
     */
    addMainContainer() {
        const textarea = document.querySelector(`form textarea`);
        if (!textarea) {
            console.warn('not found form textarea')
            return;
        }
        let container = document.createElement('div')
        container.id = 'chatgpt-enhance';
        container.className = 'chatgpt_enhance';
        // 判断主容器是否存在
        if (textarea.parentElement.querySelector(`#${container.id}`)) {
            container = textarea.parentElement.querySelector(`#${container.id}`);
        } else {
            textarea.parentElement.prepend(container);
        }
        const templates = Template.getTemplates()
        let templateSelectOptionsHTML = '';
        templates.forEach((template) => {
            let selected = "";
            if (this.templateInfo && this.templateInfo.code == template.code) {
                selected = "selected";
            }
            templateSelectOptionsHTML += `<option ${selected} value="${template.code}">${template.name}</option>`;
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
        if (this.templateInfo) {
            // 已选中，需要重新增加操作页面
            this.addTemplateOptions();
        }
        container.querySelector("#chatgptEnhanceContinue").addEventListener('click', () => {
            this.log('contine button click')
        });
        const templateSelect = container.querySelector("#chatgptEnhanceTemplate")
        container.querySelector("#chatgptEnhanceTemplate").addEventListener('change', () => {
            if (templateSelect.value == "") {
                this.templateInfo = null;
            } else {
                this.templateInfo = Template.getTemplateInfo(templateSelect.value);
            }
            // 根据新的模版，设置默认值
            var newConfigValues = {}
            if (this.templateInfo != null && this.templateInfo.config) {
                this.templateInfo.config.forEach(config => {
                    newConfigValues[config.code] = null;
                })
            }
            this.templateConfigValues = newConfigValues;
            this.addTemplateOptions();
        });
    },
    /**
     * 新增模版选项HTML内容
     */
    addTemplateOptions() {
        const templateOptions = document.querySelector("#chatgptEnhanceOptions")
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
                let configSelectValue = this.templateConfigValues[config.code]
                if (!configSelectValue) {
                    configSelectValue = config.defaultValue;
                }
                selectHTML += `<label>${config.name}:</label><select name="chatgptEnhanceOptions" data-code="${config.code}">`;
                config.options.forEach((option) => {
                    let selected = "";
                    if (configSelectValue == option.code) {
                        selected = "selected";
                    }
                    selectHTML += `<option ${selected} value="${option.code}">${option.name}</option>`;
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
        const chatgptEnhanceOptions = templateOptions.querySelectorAll(`[name="chatgptEnhanceOptions"]`);
        if (chatgptEnhanceOptions.length > 0) {
            chatgptEnhanceOptions.forEach(chatgptEnhanceOption => {
                chatgptEnhanceOption.addEventListener('change', dom => this.templateOptionsChangeEvent(dom));
            });
        }
    },
    /** 模版选项值改变事件 */
    templateOptionsChangeEvent(dom) {
        const configCode = dom.target.dataset.code;
        const configValue = dom.target.value
        this.log(configCode, configValue);
        this.templateConfigValues[configCode] = configValue;
    },
    log(...args) {
        if (this.debug == true) {
            console.log(...args)
        }
    }
}

ChatGPTEnhance.init();