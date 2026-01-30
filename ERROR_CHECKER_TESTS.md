# LaTeX 错误检查测试用例

## 测试数据

### 测试 1：括号不匹配
```latex
\frac{1}{2} + \sqrt{4
```
**预期错误：** 花括号不匹配（1个缺失）

---

### 测试 2：环境不闭合
```latex
\begin{equation}
x = y + z
```
**预期错误：** 环境不匹配

---

### 测试 3：$ 符号错误
```latex
设 $x = 1 为一个变量，$y = 2$
```
**预期错误：** 未配对的 $ 符号

---

### 测试 4：中文在数学模式
```latex
$$圆的半径 r = 2$$
```
**预期错误：** 数学模式中包含中文

---

### 测试 5：多个错误
```latex
\begin{align}
\frac{a{b} + $x + \sqrt{9
% ❌ 包含多个错误
```
**预期错误：**
- 花括号不匹配
- 环境不闭合  
- $ 不匹配

---

### 测试 6：正确的代码（无错误）
```latex
\begin{equation}
\frac{a}{b} = \sqrt{c}
\end{equation}
```
**预期结果：** 无错误显示

---

## 错误检查器工作流

```
用户输入/处理代码
        ↓
LaTeX代码生成
        ↓
发送到输出框
        ↓
MutationObserver 监听到变化
        ↓
调用 validateAndDisplayErrors()
        ↓
LaTeXValidator.validate() 执行检查
        ↓
生成错误列表 (errors[])
        ↓
生成 HTML 显示错误面板
        ↓
用户查看/修复
```

## 检查优先级

1. **括号匹配** - 最基础，必须检查
2. **环境匹配** - 重要的结构检查
3. **数学模式** - 常见的使用错误
4. **中文混用** - 特定于中文用户的检查
5. **语法细节** - 其他 LaTeX 语法规则

## 扩展建议

未来可以添加的检查项：

```javascript
// 1. 命令拼写检查
checkCommandSpelling(text) {
    // 检查 \frc (应为 \frac)、\qrt (应为 \sqrt) 等
}

// 2. 参数数量检查
checkCommandArguments(text) {
    // 检查 \frac 是否有2个参数
}

// 3. 空白处理
checkWhitespace(text) {
    // 检查不必要的空行、制表符等
}

// 4. 性能检查
checkPerformance(text) {
    // 提示公式过长的警告
}
```
