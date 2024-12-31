// 处理换行符
function processLineBreaks(text) {
    // 将输入文本按换行符分割成多行
    let lines = text.split('\n');

    // 将多行文本重新拼接成文本（这里是实际中已不再调用 processLine 函数）
    text = lines.join('\n');

    return text;
}

// 分组增加 $$ 符号
function addDollarSigns(text) {
    // 将输入文本按照换行符分割成多行
    let lines = text.split('\n');

    // 遍历每一行
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // 使用正则表达式在每个指定区域两边添加 $$ 符号
        line = line.replace(/([\[\]0-9a-zA-Z\(\)\\.+\-\_\^△□○★▲●◆=\{\}\s\%\:\/π]+)/g, '$$$1$$');
        // 如果行尾是单一的“.$”字符，移除最后的 $
        if (line.endsWith('.$')) {
            line = line.slice(0, -1);
        }
        // 更新处理后的行
        lines[i] = line;
    }

    // 将处理后的行重新拼接成文本
    text = lines.join('\n');
    return text;
}

// 处理文本为 LaTeX 格式
function processTextToLaTeX(line) {
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
    line = line.replace(/{(.*?)}\s*\\over\s*([\d]+)/g, '\\dfrac{$1}{$2}');
    line = line.replace(/([\d]+)\s*\\over\s*{(.*?)}/g, '\\dfrac{$1}{$2}');
    line = line.replace(/([\d]+)\s*\\over\s*([\d]+)/g, '\\dfrac{$1}{$2}');
    // 删除多余空格
    line = line.replace(/ /g, '');
    line = line.replace(/　/g, '');
    line = line.replace(/ /g, '');
    line = line.replace(/ /g, '');
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

    // 使用递归函数替换含有中文字符括号内容
    function replaceBrackets(line) {
        function replaceRecursive(str) {
            return str.replace(/\(([^()]*[\u4e00-\u9fff][^()]*)\)/g, '（$1）');
        }

        while (/\(([^()]*[\u4e00-\u9fff][^()]*)\)/.test(line)) {
            line = replaceRecursive(line);
        }

        return line;
    }

    line = replaceBrackets(line);

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
    line = line.replace(/(\d+)@(\d+)\/(\d+)/g, '$1\\dfrac{$2}{$3}');
    line = line.replace(/(\d+)\/(\d+)/g, '\\dfrac{$1}{$2}');
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
    line = line.replace(/±/g, '\\pm ');
    // 替换单位并转换为 LaTeX 格式
    const units = ['km/h','m/s','m/min','mm', 'cm', 'dm', 'm', 'km', 'g', 'kg', 't', 's', 'min', 'h', 'mL', 'L', 'ml'];

    units.forEach(unit => {
        const regex = new RegExp(`(\\d+(\\.\\d+)?)(\\s*\\(?\\（?\\s*${unit}(\\^([23]))?\\s*\\)?\\）?\\s*)`, 'g');
        line = line.replace(regex, '$1\\rm\\ {$3}');
    });

    return line;
}

// 主处理函数
function chuliwenben() {
    // 获取输入文本
    let inputText = document.getElementById('inputText').value;
    
    // 处理文本为 LaTeX 格式
    let latexText = processTextToLaTeX(inputText);
    
    // 处理换行符
    let processedText = processLineBreaks(latexText);
    
    // 增加 $$ 符号
    let finalText = addDollarSigns(processedText);
    
    // 将处理后的文本更新到页面上
    document.getElementById('outputText').innerText = finalText;
    // 执行拷贝文本的操作（假设已实现 copyText 函数）
    copyText();
    
    // 输出最终处理的 LaTeX 文本
    console.log('Processed LaTeX Text:', finalText);
}
