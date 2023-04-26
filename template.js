import { LocalData } from "./utils.js"
import { CacheName } from "./config.js"

const Template = {
    getTemplates() {
        const list = [{ code: "", name: "默认" }]
        const templates = LocalData.getObject(CacheName.Templates);
        if (templates) {
            templates.forEach(template => {
                list.push({
                    code: template.code,
                    name: template.name
                });
            })
        }
        return list
    },
    getTemplateInfo(code) {
        const templates = LocalData.getObject(CacheName.Templates);
        const globalConfig = LocalData.getObject(CacheName.GlobalConfig);
        let globalValue = {}
        if (globalConfig && globalConfig.globalValue) {
            globalValue = globalConfig.globalValue;
        }
        if (templates) {
            for (let i = 0; i < templates.length; i++) {
                if (code == templates[i].code) {
                    const newTemplate = Object.assign({}, templates[i]);
                    if (newTemplate.config && newTemplate.config.length > 0) {
                        newTemplate.hasConfig = true;
                        newTemplate.config.forEach(config => {
                            if (config.globalValue && globalValue[config.globalValue]) {
                                config.options = globalValue[config.globalValue];
                            }
                            if (!config.options) {
                                config.options = [];
                            }
                        })
                    }
                    return newTemplate;
                }
            }
            return null;
        } else {
            return null;
        }
    }
}
export { Template }