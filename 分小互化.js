function processNumber(inputStr) {
    let outputText = document.getElementById('outputText');
    if (inputStr.includes('@')) {
        // 带分数形式
        let [whole, frac] = inputStr.split('@');
        let [num, denom] = frac.split('/').map(Number);
        let decimal = parseInt(whole) + num / denom;
        outputText.innerText = `小数：${decimal}\n分数：\\dfrac{${num + denom * parseInt(whole)}}{${denom}}\n带分数：${whole}\\dfrac{${num}}{${denom}}`;
    } else if (inputStr.includes('/')) {
        // 分数形式
        let [num, denom] = inputStr.split('/').map(Number);
        let decimal = num / denom;
        if (num < denom) {
            outputText.innerText = `小数：${decimal}\n分数：\\dfrac{${num}}{${denom}}\n带分数：无`;
        } else {
            let whole = Math.floor(num / denom);
            num = num % denom;
            outputText.innerText = `小数：${decimal}\n分数：\\dfrac{${num}}{${denom}}\n带分数：${whole}\\dfrac{${num}}{${denom}}`;
        }
    } else {
        // 小数形式
        let decimal = parseFloat(inputStr);
        let [integerPart, decimalPart] = decimal.toString().split('.');
        let num = parseInt(decimalPart);
        let denom = Math.pow(10, decimalPart.length);
        let gcd = (a, b) => b ? gcd(b, a % b) : a;
        let divisor = gcd(num, denom);
        num /= divisor;
        denom /= divisor;
        if (parseInt(integerPart) === 0) {
            outputText.innerText = `小数：${decimal}\n分数：\\dfrac{${num}}{${denom}}\n带分数：无`;
        } else {
            let whole = parseInt(integerPart);
            outputText.innerText = `小数：${decimal}\n分数：\\dfrac{${num + denom * whole}}{${denom}}\n带分数：${whole}\\dfrac{${num}}{${denom}}`;
        }
    }
}

function fenxiaohuhua() {
    let inputText = document.getElementById('inputText').value;
    processNumber(inputText);
}
