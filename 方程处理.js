function denghaochuli(text){
    text = text.replace(/＝/g, '&=');
    text = text.replace(/=/g, '&=');
    text = text.replace(/&=/g, '&='); // 这里不需要 '&='
    return text;
}

function addsplit(text) {
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
}

function addDollarSigns1(text) {
    text = '$' + text + '$';
    return text;
}

function chulifangcheng() {
    let inputText = document.getElementById('inputText').value;

    let latexText = processTextToLaTeX(inputText);
    let processedText = processLineBreaks(latexText);
    let addsplitText = addsplit(processedText);
    let addDollarSignsText = addDollarSigns1(addsplitText);
    let finalText = denghaochuli(addDollarSignsText);

    // 将处理后的文本更新到页面上
    const output = document.getElementById('outputText');
    output.textContent = finalText; // 保持为纯文本 
    copyText();
}
