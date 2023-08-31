const primaryColorArr = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', 
    '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047', '#7cb342', '#c0ca33', 
    '#fdd835', '#ffb300', '#fb8c00', '#f4511e', '#757575', '#546e7a'];

const hintIconMap = {
    'hint': 'icon-info',
    'success': 'icon-checkbox-checked',
    'warning': 'icon-warning',
    'error': 'icon-cancel-circle'
};

const myajax = {
    get: (url) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.send();
            xhr.addEventListener('readystatechange', (e) => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseText);
                }
            });
        });
    },
    getJson: (url) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.send()
            xhr.addEventListener('readystatechange', (e) => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 1) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                }
            });
        });
    },

    postJson: (url, data) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('post', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
            xhr.addEventListener('readystatechange', (e) => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.status === 1) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                }
            });
        });
    }
};

function hintBoxAnimate(targetTop) {
    const hintBox = document.getElementById('hint-box');

    // 当有动画正在进行时，不允许触发新的动画
    if (hintBox.timer !== undefined) {
        return undefined;
    }
    clearTimeout(hintBox.autoBloseTimer);

    // 所有参数整数化
    const animationTime = 300;
    const startTop = Math.floor(hintBox.offsetTop)
    hintBox.style.top = startTop + 'px';
    targetTop = Math.round(targetTop);
    const moveCount = Math.floor(Math.abs(targetTop - hintBox.offsetTop));
    if (moveCount === 0) {
        return undefined;
    }

    // 计算步进、结束条件、执行动画间隔
    let deltaTop;
    let isEnd;
    if (targetTop > hintBox.offsetTop) {
        deltaTop = 5;
        isEnd = () => {
            return hintBox.offsetTop >= targetTop;
        }
    } else {
        deltaTop = -5;
        isEnd = () => {
            return hintBox.offsetTop <= targetTop;
        }
    }
    const intervalTime = Math.ceil(Math.abs(deltaTop) * animationTime / moveCount);

    // 执行动画
    hintBox.timer = setInterval(() => {
        hintBox.style.top = `${hintBox.offsetTop + deltaTop}px`;
        if (isEnd()) {
            clearInterval(hintBox.timer);
            hintBox.timer = undefined;
            hintBox.style.top = `${targetTop}px`;
        }
    }, intervalTime);
}

function showHintBox(hintContent, hintType, animateType, animationTime) {
    // 检查hintType参数
    const iconClassName = hintIconMap[hintType];
    if (iconClassName === undefined) {
        throw `hintType参数只能取${Object.keys(hintIconMap).join(", ")}`;
    }

    // 检查animateType参数
    if (animateType !== 'to down' && animateType !== 'to up' && animateType !== 'up to down') {
        throw 'animateType参数只能取："to down"、"to up"、"up to down"';
    }

    // 更改样式
    const hintBox = document.getElementById('hint-box');
    hintBox.setAttribute('data-hint-type', hintType);
    hintBox.querySelector('.icon').className = `icon ${iconClassName}`;
    hintBox.querySelector('.text').innerHTML = hintContent;

    // 设置动画效果
    if (animateType === 'to up' && hintBox.offsetTop > 0) {
        hintBoxAnimate(-hintBox.offsetTop);
        return undefined;
    }

    if (animateType === 'to down' && hintBox.offsetTop < 0) {
        hintBoxAnimate(-hintBox.offsetTop);
    } else if (animateType === 'up to down') {
        clearInterval(hintBox.timer);
        hintBox.timer = undefined;
        hintBox.style.display = 'none';
        hintBox.style.top = '';
        hintBox.style.display = '';
        hintBoxAnimate(-hintBox.offsetTop);
    }

    // 自动关闭
    if (animationTime !== undefined) {
        hintBox.autoBloseTimer = setTimeout(() => {
            clearInterval(hintBox.timer);
            hintBox.timer = undefined;
            hintBoxAnimate(-hintBox.offsetTop);
        }, Math.ceil(animationTime));
    }
}

function getDeleteArticleFunction(url, articleId, successCallback) {
    return function(e) {
        const check = confirm('确定要删除此文章吗？');
        if (!check) {
            return undefined;
        }

        myajax.postJson(url, {'article-id': articleId}).then(
            (data) => {
                showHintBox(data['message'], 'success', 'up to down', 1500);
                if (successCallback !== undefined) {
                    successCallback(data);
                }
            },
            (data) => {
                showHintBox(data['message'], 'error', 'up to down');
            }
        );
    }
}

function appendLineNumToCode(codeBox) {
    // 生成显示行号的HTML
    const lineCount = codeBox.querySelector('pre code').innerHTML.match(/\n/g).length;
    const lineNumCodeHTML = [];
    for (let i = 1; i <= lineCount; i++) {
        lineNumCodeHTML.push(`<span class="n">${i}</span>`);
    }

    // 将行号添加到页面
    const lineNumBox = document.createElement('pre');
    const lineNumCode = document.createElement('code');
    lineNumBox.className = 'code-line-num';
    lineNumBox.appendChild(lineNumCode);
    lineNumCode.innerHTML = lineNumCodeHTML.join('\n');
    codeBox.insertBefore(lineNumBox, codeBox.querySelector('pre'));
}
