    // 复制文本函数
    function copyText() {
        var outputText = document.getElementById("outputText");
        var textArea = document.createElement("textarea");
        var textContent = outputText.innerText;  // 把 innerHTML 改成了 innerText
        textArea.value = textContent.replace(/<br>/g, "\r\n");
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
    }


    // 方程分段处理函数
    function chulifenduan() {
      var inputText = document.getElementById("inputText");
      var equations = inputText.value.split('=');
      var result = equations.join('\n=');
      inputText.value = result;
    }
    
    // 源代码处理函数
    function chuliyuandaima() {
      var inputText = document.getElementById("inputText");
      var text = inputText.value;
      text = text.replace(/\[p\]/g, ""); // 去除 "[p]" 字符
      text = text.replace(/\[\/p\]/g, "\n"); // 将 "[/p]" 替换为换行符 "\n"
      text = text.replace(/\[tex=\d+\.\d+x\d+\.\d+\]|%\[\/tex\]|\[img=\d+x\d+\]\d+\.png\[\/img\]|\[tex\]/g, ""); // 使用正则表达式移除不需要的字符和标签
      text = text.replace(/\[input=type:blank,size:4\]\[\/input\]/g, '______'); // 填空题的空白部分替换为 "______"
      text = text.replace(/\$\$/g, '$'); // 替换公式开始和结束标示符
      inputText.value = text;
    }