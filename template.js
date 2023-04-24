const Template = {
    getTemplates() {
        return [
            { code: "", name: "默认" },
            { code: "content_rewrite", name: "重写文案" },
            { code: "translate_chinese", name: "翻译中文" }
        ]
    },
    getTemplateInfo(code) {
        return {
            code: "content_rewrite",
            name: "重写文案",
            hasConfig: true,
            template: "Your task is to rewrite the entire text in better words and make it unique with natural language.output shall be in ${language}. The text to rewrite it is this:${prompt}\nPlease write in ${tone} tone, ${style} writing style.",
            config: [
                { code: "language", name: "语言", options: [{ code: "", name: "默认" }, { code: "Chinese", name: "中文" }] },
                { code: "tone", name: "语调", options: [{ code: "", name: "默认" }, { code: "emotional", name: "情感" }] },
                { code: "style", name: "风格", options: [{ code: "", name: "默认" }, { code: "poetic", name: "诗意" }] }
            ]
        }
    }
}
export { Template }