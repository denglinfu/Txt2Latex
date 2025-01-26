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