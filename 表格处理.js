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
    const output = document.getElementById('outputText');
    output.textContent = finalText; // 保持为纯文本 
    copyText();
    
}
