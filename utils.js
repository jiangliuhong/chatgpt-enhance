

/**
 * 封装字符串工具方法
 */
const StringUtils = {

    /**
     * 模版替换，支持${xx}占位符替换，支持 if else 条件判断
     * 模版示例： this:${prompt}.{{ if (tone != null && tone != '') }}Please write in ${tone} tone.{{ endif }}{{ if (style) }}${style} writing style{{ endif }}.
     * @param {*} template 
     * @param {*} variables 
     * @returns 
     */
    replaceTemplate(template, variables) {
        const pattern = /\$\{(\w+)\}/g;
        let result = template.replace(pattern, function (match, variable) {
            return variables[variable];
        });

        const ifPattern = /\{\{\s*if\s+(.+?)\s*\}\}([\s\S]*?)\{\{\s*endif\s*\}\}/g;
        let replacedResult = '';
        let startIndex = 0;
        let match;
        while (match = ifPattern.exec(result)) {
            const [ifBlock, condition, codeBlock] = match;
            const replacedCondition = condition.replace(pattern, function (match, variable) {
                return variables[variable];
            });
            const shouldInclude = new Function('replacedCondition', ...Object.keys(variables), "return eval(replacedCondition)")(replacedCondition, ...Object.values(variables));
            const endIndex = match.index;
            replacedResult += result.substring(startIndex, endIndex);
            if (shouldInclude) {
                const replacedCodeBlock = codeBlock.replace(pattern, function (match, variable) {
                    return variables[variable];
                });
                const nestedResult = this.replaceTemplate(replacedCodeBlock, variables);
                replacedResult += nestedResult;
            }
            startIndex = ifPattern.lastIndex;
        }
        replacedResult += result.substring(startIndex);

        return replacedResult;
    }
}

export { StringUtils }