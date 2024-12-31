function processInput(inputStr) {
    let lines = inputStr.split('\n');
    let latex = '\\boxed{\n\\begin{array}{c|c}\n';
    lines.forEach((line, index) => {
        latex += line;
        if (index < lines.length - 1) {
            latex += ' \\\\ \\hline\n';
        }
    });
    latex += '\n\\end{array}\n}';
    return latex;
}

function biaogechuli() {
    let inputText = document.getElementById('inputText').value;
    
    // 假设这些函数在代码的其他地方定义了
    let latexText = processTextToLaTeX(inputText);
    let processedText = processLineBreaks(latexText);
    let addboxText = processInput(processedText);
    let finalText = addDollarSigns1(addboxText);
    
    // 将处理后的文本更新到页面上
    const outputElement = document.getElementById('outputText');
    outputElement.innerHTML = `<pre class="latex-highlight">${finalText}</pre>`;  
    // 进行代码高亮
    highlightTex();
    copyText();
    
}

// 注意：确保 `processTextToLaTeX`, `processLineBreaks`, `addDollarSigns1`, 和 `copyText` 已经在你的代码的其他地方定义了。
