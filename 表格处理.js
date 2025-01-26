/**
 * 将输入文本转换为LaTeX表格格式
 * @param {string} inputStr - 输入的文本内容
 * @returns {string} - 返回LaTeX格式的表格字符串
 */
function processInput(inputStr) {
    // 将输入字符串按换行符分割成数组
    const lines = inputStr.split('\n');
    
    // 初始化LaTeX表格结构
    let latex = '\\boxed{\n\\begin{array}{c|c}\n';
    
    // 处理每一行内容
    lines.forEach((line, index) => {
        // 添加当前行内容
        latex += line.trim(); // 使用trim()去除多余的空格
        
        // 如果不是最后一行，添加分隔线
        if (index < lines.length - 1) {
            latex += ' \\\\ \\hline\n';
        }
    });
    
    // 完成表格结构
    latex += '\n\\end{array}\n}';
    return latex;
}

/**
 * 主要处理函数，处理输入文本并转换为LaTeX格式
 */
function biaogechuli() {
    // 获取输入文本
    const inputText = document.getElementById('inputText').value;
    
    try {
        // 逐步处理文本
        const latexText = processTextToLaTeX(inputText);      // 转换为LaTeX格式
        const processedText = processLineBreaks(latexText);   // 处理换行符
        const addboxText = processInput(processedText);       // 添加表格结构
        const finalText = addDollarSigns1(addboxText);       // 添加数学模式符号
        
        // 更新输出内容
        const output = document.getElementById('outputText');
        output.textContent = finalText;
        
        // 复制到剪贴板
        copyText();
    } catch (error) {
        console.error('处理文本时发生错误:', error);
        alert('处理文本时发生错误，请检查输入格式是否正确');
    }
}
