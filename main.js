// 布局调整功能
let isResizing = false;
const container = document.querySelector('.editor-container');
const handle = document.querySelector('.resize-handle');

const initResize = (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
    });
};

const resize = (e) => {
    if (!isResizing) return;
    
    const rect = container.getBoundingClientRect();
    if (window.innerWidth > 768) {
        const xPos = e.clientX - rect.left;
        container.style.gridTemplateColumns = `${xPos}px 8px 1fr`;
    } else {
        const yPos = e.clientY - rect.top;
        container.style.gridTemplateRows = `${yPos}px 8px 1fr`;
    }
};

function processWithWrap(processor) {
    const output = document.getElementById('outputText');
    const loader = createLoader();
    
    try {
        output.textContent = '';
        processor();
        void output.offsetHeight;
        highlightLatex();
        
        addToHistory({
            input: document.getElementById('inputText').value,
            output: output.textContent,
            timestamp: new Date().toISOString()
        });
        
        setTimeout(() => {
            output.style.cssText += `
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
            `;
            loader.remove();
        }, 100);
    } catch (error) {
        output.innerHTML = `<span class="error">处理出错: ${error.message}</span>`;
        console.error(error);
        loader.remove();
    }
}

function highlightLatex() {
    const output = document.getElementById('outputText');
    output.classList.remove('hljs');
    const newCode = document.createElement('code');
    newCode.textContent = output.textContent;
    output.innerHTML = '';
    output.appendChild(newCode);
    hljs.highlightElement(newCode);
    output.innerHTML = newCode.innerHTML;
    output.style.cssText += `
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
    `;
}

function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'processing-loader';
    document.body.appendChild(loader);
    return loader;
}

async function copyText() {
    try {
        await navigator.clipboard.writeText(outputText.textContent);
        showToast('内容已复制到剪贴板！');
    } catch (err) {
        showToast('复制失败，请手动选择内容复制');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        animation: fadeInOut 2.5s;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// 历史记录功能
function addToHistory(record) {
    let history = JSON.parse(localStorage.getItem('latexHistory') || '[]');
    history.unshift(record);
    history = history.slice(0, 10);
    localStorage.setItem('latexHistory', JSON.stringify(history));
    updateHistoryPanel();
}

function updateHistoryPanel() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('latexHistory') || '[]');
    
    historyList.innerHTML = history.map((record, index) => `
        <div class="history-item" onclick="restoreHistory(${index})">
            <div class="history-item-time">${new Date(record.timestamp).toLocaleString()}</div>
            <div class="history-item-preview">${record.input.substring(0, 50)}...</div>
        </div>
    `).join('');
}

function restoreHistory(index) {
    const history = JSON.parse(localStorage.getItem('latexHistory') || '[]');
    const record = history[index];
    
    document.getElementById('inputText').value = record.input;
    const output = document.getElementById('outputText');
    output.textContent = record.output;
    highlightLatex();
}

function clearHistory() {
    localStorage.removeItem('latexHistory');
    updateHistoryPanel();
}

function toggleHistory() {
    const panel = document.getElementById('historyPanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        updateHistoryPanel();
    }
}

function toggleTempStorage() {
    const panel = document.getElementById('tempStoragePanel');
    panel.classList.toggle('active');
}

function clearTempStorage() {
    const tempStorage = document.getElementById('tempStorageArea');
    tempStorage.value = '';
}

// 修改现有的点击空白处关闭面板的事件监听器
document.addEventListener('click', (e) => {
    const historyPanel = document.getElementById('historyPanel');
    const historyBtn = document.querySelector('.history-btn');
    const tempStoragePanel = document.getElementById('tempStoragePanel');
    const tempStorageBtn = document.querySelector('.temp-storage-btn');
    
    // 处理历史记录面板
    if (historyPanel.classList.contains('active') && 
        !historyPanel.contains(e.target) && 
        !historyBtn.contains(e.target)) {
        historyPanel.classList.remove('active');
    }
    
    // 处理暂存内容面板
    if (tempStoragePanel.classList.contains('active') && 
        !tempStoragePanel.contains(e.target) && 
        !tempStorageBtn.contains(e.target)) {
        tempStoragePanel.classList.remove('active');
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    handle.addEventListener('mousedown', initResize);
    updateHistoryPanel();
    
    // 输入框Tab支持
    document.getElementById('inputText').addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = 
                e.target.value.substring(0, start) + 
                '    ' + 
                e.target.value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
        }
    });
});

// 文本转LaTeX模块
const TextToLatex = {
    processLineBreaks(text) {
        let lines = text.split('\n');
        return lines.join('\n');
    },

    addDollarSigns(text) {
        let lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            line = line.replace(/([\[\]0-9a-zA-Z\(\)\\.,+\-\_\^△□○★▲●◆=\{\}\s\%\:\/π\w]+)/g, '$$$1$$');
            if (line.endsWith('.$')) {
                line = line.slice(0, -1);
            }
            lines[i] = line;
        }
        return lines.join('\n');
    },

    processTextToLaTeX(line) {
        // 删除已有的 $ 符号
        line = line.replace(/\$/g, '');
        // 删除 left和 right 关键字
        line = line.replace(/\\left/g, '');
        line = line.replace(/\\right/g, '');
        // 将 \frac 和 \tfrac 替换为 \dfrac
        line = line.replace(/\\frac/g, '\\dfrac');
        line = line.replace(/\\tfrac/g, '\\dfrac');
        // 替换 "{...} \over {...}" 分数格式为 \dfrac
        line = line.replace(/{(.*?)}\s*\\over\s*{(.*?)}/g, '\\dfrac{$1}{$2}');
        line = line.replace(/{(.*?)}\s*\\over\s*(.*?)/g, '\\dfrac{$1}{$2}');
        line = line.replace(/(.*?)\s*\\over\s*{(.*?)}/g, '\\dfrac{$1}{$2}');
        line = line.replace(/(.*?)\s*\\over\s*(.*?)/g, '\\dfrac{$1}{$2}');
        // 删除多余空格
        line = line.replace(/[^\S\n]+/g, '');
        line = line.replace(/ /g, '');
        line = line.replace(/ /g, '');
        // 删除 \rm 关键字
        line = line.replace(/\\rm/g, '');
        // 替换特殊符号和标点符号
        line = line.replace(/##/g, '或');
        line = line.replace(/：/g, ':');
        line = line.replace(/∶/g, ':');
        line = line.replace(/（/g, '(');
        line = line.replace(/）/g, ')');
        line = line.replace(/＝/g, '=');
        line = line.replace(/﹣/g, '-');
        line = line.replace(/＋/g, '+');
        line = line.replace(/－/g, '-');
        line = line.replace(/−/g, '-');
        line = line.replace(/［/g, '[');
        line = line.replace(/］/g, ']');
        line = line.replace(/,/g, '，');
        line = line.replace(/\.$/g, '。');

        // 添加将(a，b)类型替换为(a,b)的逻辑
        line = line.replace(/\((\w+)\，(\w+)\)/g, '($1,$2)');

        // 替换中括号和小括号
        line = this.replaceBrackets(line);
        // 处理单位
        line = this.convertUnits(line);
        // 为空括号和空方括号增加空白
        line = line.replace(/\(\)/g, '(\\ \\ \\ \\ \\ \\ )');
        line = line.replace(/\[\]/g, '[\\ \\ \\ \\ \\ \\ ]');
        // 替换数学运算符为 LaTeX  
        line = line.replace(/×/g, '\\times ');
        line = line.replace(/÷/g, '\\div ');
        line = line.replace(/\(/g, '\\left(');
        line = line.replace(/\)/g, '\\right)');
        line = line.replace(/\[/g, '\\left[');
        line = line.replace(/\]/g, '\\right]');
        line = line.replace(/([a-zA-Z0-9]+)@([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, '$1\\dfrac{$2}{$3}');
        // 排除m/s，km/h，m/min
        line = line.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)(?<!\b(m\/s|km\/h|m\/min)\b)/g, '\\dfrac{$1}{$2}');
        line = line.replace(/{(.*?)}\s*\/\s*{(.*?)}(?<!\bm\/s\b|\bkm\/h\b|\bm\/min\b)/g, '\\dfrac{$1}{$2}');
        line = line.replace(/>/g, '\\gt ');
        line = line.replace(/</g, '\\lt ');
        line = line.replace(/≠/g, '\\not= ');
        line = line.replace(/≥/g, '\\geqslant ');
        line = line.replace(/≤/g, '\\leqslant ');
        line = line.replace(/%/g, '\\% ');
        line = line.replace(/∠/g, '\\angle ');
        line = line.replace(/°/g, '\\degree ');
        line = line.replace(/\.\.\./g, '\\cdots ');
        line = line.replace(/…/g, '\\cdots ');
        line = line.replace(/≈/g, '\\approx ');
        line = line.replace(/\\varDelta/g, '△');
        line = line.replace(/\\Delta/g, '△');
        line = line.replace(/~/g, '\\sim ');
        line = line.replace(/⊥/g, '\\perp ');
        line = line.replace(/∥/g, '∥');
        line = line.replace(/\\dot/g, '\\overset{\\bullet}');
        line = line.replace(/π/g, '\\mathrm{π}');
        line = line.replace(/\\pi/g, '\\mathrm{π}');
        line = line.replace(/±/g, '\\pm ');
        line = line.replace(/(\d+)\\rm/g, '$1\\rm\\ ');
        line = line.replace(/\\dfrac{m}{mi}n/g, 'm/min');
        return line;
    },

    replaceBrackets(line) {
        function replaceRecursive(str) {
            return str.replace(/\(([^()]*[\u4e00-\u9fff][^()]*)\)/g, '（$1）');
        }

        while (/\(([^()]*[\u4e00-\u9fff][^()]*)\)/.test(line)) {
            line = replaceRecursive(line);
        }

        return line;
    },

    convertUnits(line) {
        const units = ['km/h', 'm/s', 'm/min', 'mm', 'cm', 'dm', 'm', 'km', 'g', 'kg', 't', 's', 'min', 'h', 'mL', 'L', 'ml'];
        // 按长度降序排序，避免短单位匹配到长单位的一部分
        const sortedUnits = units.sort((a, b) => b.length - a.length);
        const unitsPattern = sortedUnits.join('|');
        
        // 处理括号内的单位（带^指数）
        line = line.replace(/\((\s*)((?:${unitsPattern}))(\^[0-9]+)?(\s*)\)/g, (_, p1, unit, exp, p4) => {
            return `${p1}(\\rm{${unit}${exp || ''}})${p4}`;
        });

        // 处理数字后的单位（带^指数）
        line = line.replace(new RegExp(`(\\d+)(\\s*)(${unitsPattern})(\\^[0-9]+)?`, 'g'), (_, num, space, unit, exp) => {
            return `${num}\\rm{${unit}${exp || ''}}`;
        });

        // 处理单独的单位（非数字后），排除已处理的\rm{}
        const unitPattern = new RegExp(
            `(\\\\rm\\{[^}]*})|\\b(${unitsPattern})(\\^\\d+)?\\b`,
            'g'
        );
        
        return line.replace(unitPattern, (match, rmGroup, unit, exp) => {
            if (rmGroup) {
                return rmGroup;
            }
            return `\\rm{${unit}${exp || ''}}`;
        });
    }
};

// 表格处理模块
const TableProcessor = {
    processInput(inputStr) {
        const lines = inputStr.split('\n');
        let latex = '\\boxed{\n\\begin{array}{c|c}\n';
        lines.forEach((line, index) => {
            latex += line.trim();
            if (index < lines.length - 1) {
                latex += ' \\\\ \\hline\n';
            }
        });
        latex += '\n\\end{array}\n}';
        return latex;
    }
};

// 分数处理模块
const FractionProcessor = {
    gcd(a, b) {
        return b ? this.gcd(b, a % b) : a;
    },

    processMixedNumber(inputStr) {
        const [wholeStr, fractionStr] = inputStr.split('@');
        const whole = parseInt(wholeStr, 10);
        let [num, denom] = fractionStr.split('/').map(Number);
        
        const fracGcd = this.gcd(num, denom);
        num /= fracGcd;
        denom /= fracGcd;

        const totalNum = whole * denom + num;
        const totalGcd = this.gcd(totalNum, denom);
        const simplifiedNum = totalNum / totalGcd;
        const simplifiedDenom = denom / totalGcd;

        return {
            decimal: whole + num / denom,
            fraction: `\\dfrac{${simplifiedNum}}{${simplifiedDenom}}`,
            mixed: `${whole}\\dfrac{${num}}{${denom}}`
        };
    },

    processFraction(inputStr) {
        let [num, denom] = inputStr.split('/').map(Number);
        const fracGcd = this.gcd(num, denom);
        num /= fracGcd;
        denom /= fracGcd;

        const decimal = num / denom;
        const whole = Math.floor(num / denom);
        const remainder = num % denom;

        let mixed = '无';
        if (num >= denom) {
            mixed = remainder === 0 ? `${whole}` : `${whole}\\dfrac{${remainder}}{${denom}}`;
        }

        return {
            decimal,
            fraction: `\\dfrac{${num}}{${denom}}`,
            mixed
        };
    },

    processDecimal(inputStr) {
        const decimal = parseFloat(inputStr);
        const [integerPart, decimalPart = ''] = decimal.toString().split('.');
        const wholeNumber = parseInt(integerPart, 10) || 0;

        let num = decimalPart ? parseInt(decimalPart, 10) : 0;
        let denom = decimalPart ? Math.pow(10, decimalPart.length) : 1;

        const decGcd = this.gcd(num, denom);
        num /= decGcd;
        denom /= decGcd;

        const totalNum = wholeNumber * denom + num;
        const totalGcd = this.gcd(totalNum, denom);
        const simplifiedNum = totalNum / totalGcd;
        const simplifiedDenom = denom / totalGcd;

        let mixed = '无';
        if (wholeNumber !== 0) {
            mixed = num === 0 ? `${wholeNumber}` : `${wholeNumber}\\dfrac{${num}}{${simplifiedDenom}}`;
        }

        return {
            decimal: decimal,
            fraction: `\\dfrac{${simplifiedNum}}{${simplifiedDenom}}`,
            mixed: mixed
        };
    },

    processNumber(inputStr) {
        if (inputStr.includes('@')) {
            return this.processMixedNumber(inputStr);
        } else if (inputStr.includes('/')) {
            return this.processFraction(inputStr);
        } else {
            return this.processDecimal(inputStr);
        }
    }
};

// 方程处理模块
const EquationProcessor = {
    denghaochuli(text) {
        text = text.replace(/＝/g, '&=');
        text = text.replace(/=/g, '&=');
        text = text.replace(/&=/g, '&=');
        return text;
    },

    addsplit(text) {
        let lines = text.split('\n');
        let latex = '\\begin{split}\n';
        lines.forEach((line, index) => {
            latex += line;
            if (index < lines.length - 1) {
                latex += ' \\\\ \n';
            }
        });
        latex += '\n\\end{split}';
        return latex;
    },

    addDollarSigns(text) {
        return '$' + text + '$';
    }
};

// 辅助功能模块
const Utils = {
    copyText() {
        var outputText = document.getElementById("outputText");
        var textArea = document.createElement("textarea");
        var textContent = outputText.innerText;
        textArea.value = textContent.replace(/<br>/g, "\r\n");
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
    },

    chulifenduan() {
        var inputText = document.getElementById("inputText");
        var equations = inputText.value.split('=');
        var result = equations.join('\n=');
        inputText.value = result;
    },

    chuliyuandaima() {
        var inputText = document.getElementById("inputText");
        var text = inputText.value;
        text = text.replace(/\[p\]/g, "");
        text = text.replace(/\[\/p\]/g, "\n");
        text = text.replace(/\[tex=\d+\.\d+x\d+\.\d+\]|%\[\/tex\]|\[img=\d+x\d+\]\d+\.png\[\/img\]|\[tex\]/g, "");
        text = text.replace(/\[input=type:blank,size:4\]\[\/input\]/g, '______');
        text = text.replace(/\$\$/g, '$');
        inputText.value = text;
    }
};

// 处理函数
function chuliwenben() {
    let inputText = document.getElementById('inputText').value;
    let latexText = TextToLatex.processTextToLaTeX(inputText);
    let processedText = TextToLatex.processLineBreaks(latexText);
    let finalText = TextToLatex.addDollarSigns(processedText);
    
    const output = document.getElementById('outputText');
    output.textContent = finalText;
    Utils.copyText();
}

function biaogechuli() {
    const inputText = document.getElementById('inputText').value;
    try {
        const latexText = TextToLatex.processTextToLaTeX(inputText);
        const processedText = TextToLatex.processLineBreaks(latexText);
        const addboxText = TableProcessor.processInput(processedText);
        const finalText = EquationProcessor.addDollarSigns(addboxText);
        
        const output = document.getElementById('outputText');
        output.textContent = finalText;
        Utils.copyText();
    } catch (error) {
        console.error('处理文本时发生错误:', error);
        alert('处理文本时发生错误，请检查输入格式是否正确');
    }
}

function fenxiaohuhua() {
    let inputText = document.getElementById('inputText').value;
    const result = FractionProcessor.processNumber(inputText);
    const output = document.getElementById('outputText');
    output.textContent = `小数：${result.decimal}\n分数：${result.fraction}\n带分数：${result.mixed}`;
}

function chulifangcheng() {
    let inputText = document.getElementById('inputText').value;
    let latexText = TextToLatex.processTextToLaTeX(inputText);
    let processedText = TextToLatex.processLineBreaks(latexText);
    let addsplitText = EquationProcessor.addsplit(processedText);
    let addDollarSignsText = EquationProcessor.addDollarSigns(addsplitText);
    let finalText = EquationProcessor.denghaochuli(addDollarSignsText);

    const output = document.getElementById('outputText');
    output.textContent = finalText;
    Utils.copyText();
} 