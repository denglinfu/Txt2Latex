function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function processMixedNumber(inputStr) {
    const [wholeStr, fractionStr] = inputStr.split('@');
    const whole = parseInt(wholeStr, 10);
    let [num, denom] = fractionStr.split('/').map(Number);
    
    // 约分分数部分
    const fracGcd = gcd(num, denom);
    num /= fracGcd;
    denom /= fracGcd;

    const totalNum = whole * denom + num;
    const totalGcd = gcd(totalNum, denom);
    const simplifiedNum = totalNum / totalGcd;
    const simplifiedDenom = denom / totalGcd;

    return {
        decimal: whole + num / denom,
        fraction: `\\dfrac{${simplifiedNum}}{${simplifiedDenom}}`,
        mixed: `${whole}\\dfrac{${num}}{${denom}}`
    };
}

function processFraction(inputStr) {
    let [num, denom] = inputStr.split('/').map(Number);
    const fracGcd = gcd(num, denom);
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
}

function processDecimal(inputStr) {
    const decimal = parseFloat(inputStr);
    const [integerPart, decimalPart = ''] = decimal.toString().split('.');
    const wholeNumber = parseInt(integerPart, 10) || 0;

    let num = decimalPart ? parseInt(decimalPart, 10) : 0;
    let denom = decimalPart ? Math.pow(10, decimalPart.length) : 1;

    // 约分小数部分
    const decGcd = gcd(num, denom);
    num /= decGcd;
    denom /= decGcd;

    const totalNum = wholeNumber * denom + num;
    const totalGcd = gcd(totalNum, denom);
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
}

function processNumber(inputStr) {
    if (inputStr.includes('@')) {
        return processMixedNumber(inputStr);
    } else if (inputStr.includes('/')) {
        return processFraction(inputStr);
    } else {
        return processDecimal(inputStr);
    }
}

function fenxiaohuhua() {
    let inputText = document.getElementById('inputText').value;
    const result = processNumber(inputText);
    const output = document.getElementById('outputText');
    
    // 拼接最终结果（保持 LaTeX 格式）
    output.textContent = `小数：${result.decimal}\n分数：${result.fraction}\n带分数：${result.mixed}`;
}