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
    
    document.getElementById('outputText').innerText = finalText;
    copyText();
    
}

// 注意：确保 `processTextToLaTeX`, `processLineBreaks`, `addDollarSigns1`, 和 `copyText` 已经在你的代码的其他地方定义了。
