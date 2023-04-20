/**
 * 向页面增加样式文件
 * @param {*} url 
 */
function addStyle(href) {
    var link = document.createElement('link');
    link.href = chrome.runtime.getURL(href);
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.media = 'all';
    document.getElementsByTagName('HEAD')[0].appendChild(link);
}

/**
 * 向页面增加js脚本文件
 * @param {*} src 
 */
function addScript(src) {
    var nodeElement = document.getElementsByTagName('body')[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', src);
    nodeElement.appendChild(script);
}


// 以下是执行文件
addStyle('index.css')
addScript(chrome.runtime.getURL('index.js'))