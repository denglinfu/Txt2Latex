# 📝 静态网页使用指南

## ✅ 现已支持直接打开 HTML 文件

您现在可以通过以下任一方式使用：

### 方式一：直接在 Finder 中打开（推荐）
1. 打开 Finder
2. 导航到：`/Users/fudenglin/Desktop/付登临相关资料/2023_坚果云资料/2024_编程内容/文本转Latex/Txt2Latex`
3. 双击 `index.html` 即可在默认浏览器中打开

### 方式二：通过终端打开
```bash
open /Users/fudenglin/Desktop/付登临相关资料/2023_坚果云资料/2024_编程内容/文本转Latex/Txt2Latex/index.html
```

### 方式三：创建桌面快捷方式
右键点击 `index.html` → "Make Alias" → 将别名拖到桌面

---

## 📋 如何编辑片段

打开 `snippets.js` 文件，修改 `UNCOMMON_SNIPPETS` 数组中的内容：

```javascript
const UNCOMMON_SNIPPETS = [
  {
    "title": "片段名称",
    "code": "LaTeX 代码"
  }
];
```

### 添加新片段示例
```javascript
{
  "title": "红色框",
  "code": "\\fcolorbox{red}{white}{文本}"
}
```

保存 `snippets.js` 后，重新加载浏览器页面即可看到新片段。

---

## 🎯 功能说明

- **顶部导航栏** → 点击 "✂️ 片段" 按钮
- **右侧侧边栏** → 显示所有 LaTeX 片段
- **复制按钮** → 点击📋按钮将代码复制到剪贴板

### 已包含的默认片段
- 颜色（\textcolor、\color）
- 背景色（\colorbox）
- 加粗、斜体、下划线
- 脚注、注释

---

## 💾 数据存储
- 片段数据完全保存在 `snippets.js` 中（无需服务器）
- 收藏夹等数据存储在浏览器 localStorage 中
