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
    latex += '\\end{split}';
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

    document.getElementById('outputText').innerText = finalText;
    copyText();
}