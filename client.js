import { Endpoint } from "./config.js"

const Client = {
    /** 处理结果 */
    handleResponse(response, resolve, reject) {
        if (response.status == 200) {
            resolve(response.json())
        } else {
            console.error(response);
            reject("网络请求失败");
        }

    },
    request(uri, config) {
        return new Promise((resolve, reject) => {
            fetch(`${Endpoint}${uri}`, config || {})
                .then(response => {
                    this.handleResponse(response, resolve, reject);
                }).catch(err => {
                    reject(err);
                })
        });
    },
    /**
     * 
     * @returns 版本信息
     */
    requestVersion() {
        return this.request('/data/version.json')
    },
    /**
     * 获取全局配置
     * @returns 全局配置
     */
    requestGlobalConfig() {
        return this.request('/data/config.json')
    },
    /**
     * 获取模版数据
     * @returns 模版数据
     */
    requestTemplates() {
        return this.request('/data/template.json')
    }
}

export default Client