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

// 清空输入框
function clearInput() {
    document.getElementById('inputText').value = '';
}

// 切换查找替换框的显示状态
function toggleFindReplace() {
    const findReplaceBox = document.getElementById('findReplaceBox');
    findReplaceBox.style.display = findReplaceBox.style.display === 'none' ? 'block' : 'none';
}

// 查找并替换一次
function findAndReplace() {
    const inputText = document.getElementById('inputText');
    const findText = document.getElementById('findText').value;
    const replaceText = document.getElementById('replaceText').value;
    
    if (findText === '') return;
    
    const content = inputText.value;
    const newContent = content.replace(findText, replaceText);
    inputText.value = newContent;
}

// 查找并替换所有
function findAndReplaceAll() {
    const inputText = document.getElementById('inputText');
    const findText = document.getElementById('findText').value;
    const replaceText = document.getElementById('replaceText').value;
    
    if (findText === '') return;
    
    const content = inputText.value;
    const newContent = content.replaceAll(findText, replaceText);
    inputText.value = newContent;
}

// 切换输出框查找替换框的显示状态
function toggleFindReplaceOutput() {
    const findReplaceBox = document.getElementById('findReplaceBoxOutput');
    findReplaceBox.style.display = findReplaceBox.style.display === 'none' ? 'block' : 'none';
}

// 查找并替换输出框内容（一次）
function findAndReplaceOutput() {
    const output = document.getElementById('outputText');
    const findText = document.getElementById('findTextOutput').value;
    const replaceText = document.getElementById('replaceTextOutput').value;
    
    if (findText === '') return;
    
    const content = output.textContent;
    const newContent = content.replace(findText, replaceText);
    output.textContent = newContent;
    highlightLatex();
}

// 查找并替换输出框内容（全部）
function findAndReplaceAllOutput() {
    const output = document.getElementById('outputText');
    const findText = document.getElementById('findTextOutput').value;
    const replaceText = document.getElementById('replaceTextOutput').value;
    
    if (findText === '') return;
    
    const content = output.textContent;
    const newContent = content.replaceAll(findText, replaceText);
    output.textContent = newContent;
    highlightLatex();
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

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const overlay = document.getElementById('overlay');
    const allPanels = document.querySelectorAll('.side-panel');
    
    // 关闭其他面板
    allPanels.forEach(p => {
        if (p.id !== panelId) {
            p.classList.remove('active');
        }
    });

    // 切换当前面板
    panel.classList.toggle('active');
    
    // 切换遮罩层
    if (panel.classList.contains('active')) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function toggleHistory() {
    togglePanel('historyPanel');
}

function toggleCalculator() {
    togglePanel('calculatorPanel');
}

function toggleTempStorage() {
    togglePanel('tempStoragePanel');
}

function toggleFavorites() {
    const panel = document.getElementById('favoritesPanel');
    panel.classList.toggle('active');
    loadFavorites();
}

document.getElementById('overlay').addEventListener('click', function() {
    const allPanels = document.querySelectorAll('.side-panel');
    allPanels.forEach(panel => panel.classList.remove('active'));
    this.classList.remove('active');
});

function clearTempStorage() {
    const tempStorage = document.getElementById('tempStorageArea');
    tempStorage.value = '';
}

// 计算器功能
function clearCalculator() {
    document.getElementById('calculatorInput').value = '';
    document.getElementById('calculatorOutput').textContent = '';
}

function appendToCalculator(value) {
    const input = document.getElementById('calculatorInput');
    input.value += value;
}

function calculateResult() {
    const input = document.getElementById('calculatorInput').value;
    const output = document.getElementById('calculatorOutput');
    
    try {
        let result;
        // 检查是否包含 LaTeX 公式
        if (input.includes('\\') || input.includes('$')) {
            // 移除 LaTeX 中的 $ 符号和等号
            let cleanInput = input.replace(/\$/g, '').replace(/=/g, '');
            
            // 首先移除所有的 \left 和 \right
            cleanInput = cleanInput.replace(/\\left/g, '').replace(/\\right/g, '');
            
            // 处理带分数格式 a\dfrac{b}{c}
            cleanInput = cleanInput.replace(/(\d+)\\dfrac\{(\d+)\}\{(\d+)\}/g, (_, whole, num, denom) => {
                return `(${whole}+${num}/${denom})`;
            });
            
            // 处理基本的 LaTeX 数学表达式
            cleanInput = cleanInput
                .replace(/\\dfrac{([^}]*)}{([^}]*)}/g, '($1)/($2)') // 处理普通分数
                .replace(/\\times/g, '*')  // 处理乘号
                .replace(/\\div/g, '/')    // 处理除号
                .replace(/\^/g, '**')      // 处理指数
                .replace(/\\pi|π/g, 'Math.PI') // 处理 π
                .replace(/\[/g, '(')        // 将中括号转换为小括号
                .replace(/\]/g, ')');       // 将中括号转换为小括号
                
            result = math.evaluate(cleanInput);
        } else {
            // 处理普通数学表达式
            let cleanInput = input.replace(/=/g, '')
                                .replace(/\[/g, '(')
                                .replace(/\]/g, ')')
                                .replace(/π/g, 'Math.PI');
            result = math.evaluate(cleanInput);
        }

        // 使用高精度计算
        const preciseResult = Number(result.toFixed(10));
        
        // 将结果转换为分数
        const fraction = math.fraction(result);
        
        // 生成带分数表示
        let mixedNumber = '无';
        if (Math.abs(fraction.n) >= Math.abs(fraction.d)) {
            const whole = Math.floor(Math.abs(fraction.n) / fraction.d);
            const remainder = Math.abs(fraction.n) % fraction.d;
            const sign = fraction.n < 0 ? '-' : '';
            mixedNumber = remainder === 0 ? 
                `${sign}${whole}` : 
                `${sign}${whole}\\dfrac{${remainder}}{${fraction.d}}`;
        }
        
        // 格式化输出
        output.innerHTML = 
            `小数：${preciseResult}\n` +
            `分数：\\dfrac{${fraction.n}}{${fraction.d}}\n` +
            `带分数：${mixedNumber}`;

    } catch (error) {
        output.textContent = `错误: ${error.message}`;
    }
}

// 添加分数计算辅助函数
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

function Fraction(numerator, denominator = 1) {
    this.numerator = numerator;
    this.denominator = denominator;
    
    this.simplify = function() {
        const divisor = gcd(this.numerator, this.denominator);
        this.numerator /= divisor;
        this.denominator /= divisor;
        if (this.denominator < 0) {
            this.numerator = -this.numerator;
            this.denominator = -this.denominator;
        }
        return this;
    };
    
    this.add = function(other) {
        const commonDenom = lcm(this.denominator, other.denominator);
        const newNum = this.numerator * (commonDenom / this.denominator) +
                      other.numerator * (commonDenom / other.denominator);
        return new Fraction(newNum, commonDenom).simplify();
    };
    
    this.subtract = function(other) {
        return this.add(new Fraction(-other.numerator, other.denominator));
    };
    
    this.multiply = function(other) {
        return new Fraction(
            this.numerator * other.numerator,
            this.denominator * other.denominator
        ).simplify();
    };
    
    this.divide = function(other) {
        return this.multiply(new Fraction(other.denominator, other.numerator));
    };
    
    this.toDecimal = function(precision = 10) {
        return Number((this.numerator / this.denominator).toPrecision(precision));
    };
    
    this.toMixed = function() {
        if (Math.abs(this.numerator) < this.denominator) return '无';
        const whole = Math.floor(Math.abs(this.numerator) / this.denominator);
        const remainder = Math.abs(this.numerator) % this.denominator;
        const sign = this.numerator < 0 ? '-' : '';
        return remainder === 0 ? 
            `${sign}${whole}` : 
            `${sign}${whole}\\frac{${remainder}}{${this.denominator}}`;
    };
    
    this.toString = function() {
        return `\\frac{${this.numerator}}{${this.denominator}}`;
    };
    
    this.simplify();
}

function parseFraction(str) {
    if (str.includes('/')) {
        const [num, denom] = str.split('/').map(Number);
        return new Fraction(num, denom);
    }
    const num = Number(str);
    if (Number.isInteger(num)) {
        return new Fraction(num);
    }
    const parts = str.split('.');
    const denominator = Math.pow(10, parts[1].length);
    const numerator = Number(parts.join(''));
    return new Fraction(numerator, denominator).simplify();
}

// 修改现有的点击空白处关闭面板的事件监听器
document.addEventListener('click', (e) => {
    const panels = [
        {
            panel: document.getElementById('historyPanel'),
            btn: document.querySelector('.history-btn')
        },
        {
            panel: document.getElementById('tempStoragePanel'),
            btn: document.querySelector('.temp-storage-btn')
        },
        {
            panel: document.getElementById('favoritesPanel'),
            btn: document.querySelector('button[onclick="toggleFavorites()"]')
        }
    ];
    
    panels.forEach(({panel, btn}) => {
        if (panel.classList.contains('active') && 
            !panel.contains(e.target) && 
            !btn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
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
            line = line.replace(/([\[\]0-9a-zA-Z\(\)\\.,+\-\_\^△□○★☆▲●◆=\{\}\|\s\%\:\/π\w]+)/g, '$$$1$$');
            if (line.endsWith('.$')) {
                line = line.slice(0, -1);
            }
            lines[i] = line;
        }
        return lines.join('\n');
    },

    processAbsoluteValue(line) {
        // 首先检查是否包含 l|
        if (line.includes('l|')) {
            // 步骤1：将 l| 替换为 \left|
            line = line.replace(/l\|/g, '\\left|');
            
            // 步骤2：将未处理的 | 替换为 \right|，但要避免处理已经是 \left| 的情况
            let positions = [];
            let regex = /\|/g;
            let match;
            
            // 找出所有单独的 | 的位置
            while ((match = regex.exec(line)) !== null) {
                // 确保这个 | 不是 \left| 的一部分
                let prefix = line.substring(Math.max(0, match.index - 5), match.index);
                if (!prefix.endsWith('left')) {
                    positions.push(match.index);
                }
            }
            
            // 从后向前替换，以避免位置改变影响其他替换
            for (let i = positions.length - 1; i >= 0; i--) {
                let pos = positions[i];
                line = line.slice(0, pos) + '\\right|' + line.slice(pos + 1);
            }
            
            return line;
        } else {
            // 如果没有 l|，使用原有逻辑
            const regex = /\|(?!\\right)([^|]+)(?<!\\left)\|/g;
            return line.replace(regex, '\\left|$1\\right|');
        }
    },

    processTextToLaTeX(line) {


        // \$删除 $ 符号
        // \\,删除 \, 符号
        // \\left删除 \left 关键字
        // \\right删除 \right 关键字
        // [^\S\n]+删除非换行的空白字符
        // \\+$删除行尾的反斜杠
        // \\rm\mathrm删除 \rm\mathrm 关键字
        // &删除 & 符号
        line = line.replace(/\$|\\,|\\left|\\right|[^\S\n]+|\\+$|\\rm|\\mathrm|&/gm, '');    // 删除所有 $ 符号和 \, 符号
        // 将 \frac 和 \tfrac 替换为 \dfrac
        line = line.replace(/\\tfrac|\\frac/g, '\\dfrac'); // 删除所有 \tfrac 关键字
        // 替换 "{...} \over {...}" 分数格式为 \dfrac
        line = line.replace(/\\over/g, '\/'); // 删除所有 \over 关键字
        // 替换特殊符号和标点符号
        line = line.replace(/##/g, '或');   // 替换 ##
        line = line.replace(/：|∶/g, ':'); // 替换冒号
        line = line.replace(/（/g, '(');    // 替换小括号
        line = line.replace(/）/g, ')');    // 替换小括号
        line = line.replace(/＝/g, '=');    // 替换等号
        line = line.replace(/﹣|－|−/g, '-');    // 替换减号
        line = line.replace(/＋/g, '+');    // 替换加号
        line = line.replace(/［/g, '[');    // 替换中括号
        line = line.replace(/］/g, ']');      // 替换中括号
        line = line.replace(/,/g, '，');    // 替换中文逗号
        line = line.replace(/\.$/g, '。');  // 替换句号

        // 添加将(a，b)类型替换为(a,b)的逻辑
        line = line.replace(/\((\w+)\，(\w+)\)/g, '($1,$2)');   // 替换中文逗号为英文逗号

        // 替换中括号和小括号
        line = this.replaceBrackets(line);  // 替换中括号和小括号
        // 处理单位
        line = this.convertUnits(line); // 处理单位
        // 为空括号和空方括号增加空白
        line = line.replace(/\(\)/g, '(\\ \\ \\ \\ \\ \\ )');    // 替换空括号
        line = line.replace(/\[\]/g, '[\\ \\ \\ \\ \\ \\ ]');   // 替换空方括号
        // 替换数学运算符为 LaTeX  
        line = line.replace(/×|\\times/g, '\\times ');  // 替换乘号
        line = line.replace(/÷|\\div/g, '\\div ');  // 替换除号
        line = line.replace(/\(/g, '\\left(');  // 替换左括号
        line = line.replace(/\)/g, '\\right)'); // 替换右括号
        line = line.replace(/\[/g, '\\left['); // 替换左方括号
        line = line.replace(/\]/g, '\\right]'); // 替换右方括号
        line = line.replace(/([a-zA-Z0-9]+)@([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, '$1\\dfrac{$2}{$3}');
        // 排除m/s，km/h，m/min
        line = line.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)(?<!\b(m\/s|km\/h|m\/min)\b)/g, '\\dfrac{$1}{$2}');
        line = line.replace(/{(.*?)}\s*\/\s*{(.*?)}(?<!\bm\/s\b|\bkm\/h\b|\bm\/min\b)/g, '\\dfrac{$1}{$2}');
        line = line.replace(/\{\\dfrac\{([^{}]+)\}\{([^{}]+)\}\}/g, '\\dfrac{$1}{$2}');        // 处理 {\dfrac{a}{b}}
        line = line.replace(/\\dfrac\{\{([^{}]+)\}\{([^{}]+)\}\}/g, '\\dfrac{$1}{$2}');        // 处理 \dfrac{{a}{b}}
        line = line.replace(/℃|°C/g, '\\ \\degree\\mathrm{C}'); // 处理 ℃ 和 °C
        line = line.replace(/°F/g, '\\ \\degree\\mathrm{F}'); // 处理 °F
        line = line.replace(/\\gt|>|＞/g, '\\gt '); // 处理 > 和 ＞
        line = line.replace(/\\lt|<|＜/g, '\\lt '); // 处理 < 和 ＜
        line = line.replace(/≠|\\neq/g, '\\not= '); // 处理 ≠
        line = line.replace(/≥|\\geqslant/g, '\\geqslant '); // 处理 ≥ 和 ≥
        line = line.replace(/≤|\\leqslant/g, '\\leqslant '); // 处理 ≤ 和 ≤
        line = line.replace(/\\%/g, '\%');  // 处理 \%
        line = line.replace(/%/g, '\\% '); // 处理 %
        line = line.replace(/∠|\\angle/g, '\\angle '); // 处理 ∠ 和 ∠
        line = line.replace(/°|\\degree|\\circ/g, '\\degree '); // 处理 ° 和 °
        line = line.replace(/\.\.\.|\\cdots|…|···|\\ldots/g, '\\cdots ');   // 处理 ... 和 …
        line = line.replace(/≈|\\approx/g, '\\approx ');     // 处理 ≈ 和 ≈
        line = line.replace(/\\varDelta|\\Delta|\\triangle|△/g, '\\triangle '); // 处理 Δ 和 △
        line = line.replace(/▽/g, '\\bigtriangledown '); // 处理 ▽
        line = line.replace(/\\square|\\Box/g, '□'); // 处理 □
        line = line.replace(/~|\\sim/g, '\\sim '); // 处理 ~ 和 ~
        line = line.replace(/⊥|\\perp/g, '\\perp '); // 处理 ⊥ 和 ⊥
        line = line.replace(/∥/g, '∥'); // 处理 ∥
        line = line.replace(/\\dot/g, '\\overset{\\bullet}'); // 处理 \dot
        line = line.replace(/π|\\pi/g, '\\mathrm{π}'); // 处理 π
        line = line.replace(/±|\\pm/g, '\\pm '); // 处理 ± 和 ±
        line = line.replace(/(\d+)\\mathrm/g, '$1\\ \\mathrm'); // 处理数字后面的 \mathrm
        line = line.replace(/\\dfrac{m}{mi}n/g, 'm/min'); // 处理 m/min
        line = line.replace(/\/line/g, '\\overline'); // 处理 /line
        line = line.replace(/²/g, '^2'); // 处理 ²
        line = line.replace(/³/g, '^3'); // 处理 ³
        // 处理希腊字母
        line = line.replace(/α|\\alpha/g, '\\alpha '); // 处理 \alpha
        line = line.replace(/β|\\beta/g, '\\beta '); // 处理 \beta
        line = line.replace(/γ|\\gamma/g, '\\gamma '); // 处理 \gamma
        line = line.replace(/δ|\\delta/g, '\\delta '); // 处理 \delta
        line = line.replace(/ε|\\epsilon/g, '\\epsilon '); // 处理 \epsilon
        line = line.replace(/ζ|\\zeta/g, '\\zeta '); // 处理 \zeta
        line = line.replace(/η|\\eta/g, '\\eta '); // 处理 \eta
        line = line.replace(/θ|\\theta/g, '\\theta '); // 处理 \theta
        line = line.replace(/ι|\\iota/g, '\\iota '); // 处理 \iota
        line = line.replace(/κ|\\kappa/g, '\\kappa '); // 处理 \kappa
        line = line.replace(/λ|\\lambda/g, '\\lambda '); // 处理 \lambda
        line = line.replace(/μ|\\mu/g, '\\mu '); // 处理 \mu
        line = line.replace(/ν|\\nu/g, '\\nu '); // 处理 \nu
        line = line.replace(/ξ|\\xi/g, '\\xi '); // 处理 \xi
        line = line.replace(/ο|\\omicron/g, '\\omicron '); // 处理 \omicron
        line = line.replace(/ρ|\\rho/g, '\\rho '); // 处理 \rho
        line = line.replace(/σ|\\sigma/g, '\\sigma '); // 处理 \sigma
        line = line.replace(/ω|\\omega/g, '\\omega '); // 处理 \omega
        line = line.replace(/φ|\\phi/g, '\\phi '); // 处理 \phi
        line = line.replace(/ψ|\\psi/g, '\\psi '); // 处理 \psi
        line = line.replace(/χ|\\chi/g, '\\chi '); // 处理 \chi
        // 在其他处理之后处理绝对值
        line = this.processAbsoluteValue(line);
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
        // 将单位分为两类：始终处理的单位和可选处理的单位
        const alwaysUnits = ['km/h', 'm/s', 'm/min', 'mm', 'cm', 'dm', 'km', 'kg', 'mL', 'ml'];
        const optionalUnits = ['m', 'g', 't', 's', 'h', 'L'];
        
        // 根据复选框状态确定要处理的单位
        let unitsToProcess = [...alwaysUnits];
        if (document.getElementById('treatAsUnits').checked) {
            unitsToProcess.push(...optionalUnits);
        }
        
        // 按长度降序排序，避免短单位匹配到长单位的一部分
        const sortedUnits = unitsToProcess.sort((a, b) => b.length - a.length);
        const unitsPattern = sortedUnits.join('|');
        
        // 处理括号内的单位（带^指数）
        line = line.replace(/\((\s*)((?:${unitsPattern}))(\^[0-9]+)?(\s*)\)/g, (_, p1, unit, exp, p4) => {
            return `${p1}(\\mathrm{${unit}${exp || ''}})${p4}`;
        });

        // 处理数字后的单位（带^指数）
        line = line.replace(new RegExp(`(\\d+)(\\s*)(${unitsPattern})(\\^[0-9]+)?`, 'g'), (_, num, space, unit, exp) => {
            return `${num}\\mathrm{${unit}${exp || ''}}`;
        });

        // 处理单独的单位（非数字后），排除已处理的\mathrm{}
        const unitPattern = new RegExp(
            `(\\\\mathrm\\{[^}]*})|\\b(${unitsPattern})(\\^\\d+)?\\b`,
            'g'
        );
        
        return line.replace(unitPattern, (match, rmGroup, unit, exp) => {
            if (rmGroup) {
                return rmGroup;
            }
            return `\\mathrm{${unit}${exp || ''}}`;
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
    // 获取输入文本
    const inputText = document.getElementById('inputText').value;
    // 先进行 LaTeX 处理
    const processedText = TextToLatex.processTextToLaTeX(inputText);
    // 将处理后的文本设置到计算器输入框
    document.getElementById('calculatorInput').value = processedText;
    // 调用计算器计算结果
    calculateResult();
    // 获取计算结果
    const result = document.getElementById('calculatorOutput').textContent;
    // 将结果显示在输出框中
    document.getElementById('outputText').textContent = result;
    // 高亮显示
    highlightLatex();
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

// 收藏夹相关函数
function toggleFavorites() {
    const panel = document.getElementById('favoritesPanel');
    panel.classList.toggle('active');
    loadFavorites();
}

function addFavoriteInput() {
    const favoritesList = document.getElementById('favoritesList');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'favorite-item';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'favorite-input';
    input.addEventListener('change', saveFavorites);
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-favorite';
    copyBtn.textContent = '复制';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(input.value).catch(err => {
            console.error('复制失败:', err);
        });
    };
    
    itemDiv.appendChild(input);
    itemDiv.appendChild(copyBtn);
    favoritesList.appendChild(itemDiv);
    saveFavorites();
}

function removeFavoriteInput() {
    const favoritesList = document.getElementById('favoritesList');
    if (favoritesList.lastChild) {
        favoritesList.removeChild(favoritesList.lastChild);
        saveFavorites();
    }
}

function saveFavorites() {
    const favorites = [];
    document.querySelectorAll('.favorite-input').forEach(input => {
        favorites.push(input.value);
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    favorites.forEach(text => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'favorite-item';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'favorite-input';
        input.value = text;
        input.addEventListener('change', saveFavorites);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-favorite';
        copyBtn.textContent = '📋';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(input.value).catch(err => {
                console.error('复制失败:', err);
            });
        };
        
        itemDiv.appendChild(input);
        itemDiv.appendChild(copyBtn);
        favoritesList.appendChild(itemDiv);
    });
}

// 修改现有的点击空白处关闭面板的事件监听器
document.addEventListener('click', (e) => {
    const panels = [
        {
            panel: document.getElementById('historyPanel'),
            btn: document.querySelector('.history-btn')
        },
        {
            panel: document.getElementById('tempStoragePanel'),
            btn: document.querySelector('.temp-storage-btn')
        },
        {
            panel: document.getElementById('favoritesPanel'),
            btn: document.querySelector('button[onclick="toggleFavorites()"]')
        }
    ];
    
    panels.forEach(({panel, btn}) => {
        if (panel.classList.contains('active') && 
            !panel.contains(e.target) && 
            !btn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
});
