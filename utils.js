

const StringUtils = {
    replaceTemplate(template, variables) {
        return template.replace(/\$\{(\w+)\}/g, function (match, variable) {
            return variables[variable];
        });
    }
}

export { StringUtils }