<p align="center">
   <img src="public/logo.svg" alt="AI Interview Simulator Logo" width="120" height="120" />
   <br>  中文 | <a href="README_EN.md">English</a>
</p>

# AI 随机面试模拟器

一个技术面试模拟平台，拥有 Apple 风格的 UI，旨在帮助你练习和提高你的编码和技术技能。

## 功能特性

*   **真实的面试模拟：** 体验真实的面试环境，包含编码挑战和技术问题。
*   **Apple 风格 UI：** 干净、现代且直观的用户界面，灵感来自 Apple 的设计原则。
*   **AI 驱动的反馈：** 接收由 OpenAI 提供支持的详细反馈和改进建议。
*   **可定制的设置：** 配置问题类型、类别、难度级别，甚至你的 OpenAI API 端点和模型。
*   **多语言支持：** 使用你喜欢的语言进行练习（目前支持英语和中文）。
*   **个性化学习：** 平台会跟踪你的错误并优先处理你需要加强的问题。
*   **"非我的技术栈" 功能：** 排除与你的技术栈无关的问题。
*   **历史记录跟踪：** 查看你过去的表现并确定需要改进的领域。
*   **GitHub 集成：** 通过 GitHub 贡献新问题或报告问题。

## 使用的技术

*   [React](https://reactjs.org/) (或你选择的前端框架)
*   [Node.js](https://nodejs.org/en/) (或你选择的后端环境)
*   [Express](https://expressjs.com/) (或你选择的后端框架)
*   [OpenAI API](https://openai.com/api/)
*   [react-i18next](https://react.i18next.com/) (或你选择的 i18n 库)
*   [Monaco Editor](https://microsoft.github.io/monaco-editor/) (或类似的编辑器)

## 设置说明

1.  **克隆存储库：**

    ```bash
    git clone https://github.com/your-username/ai-interview-simulator.git
    cd ai-interview-simulator
    ```

2.  **安装依赖项：**

    ```bash
    npm install  # 或 yarn install
    ```

3.  **配置你的 OpenAI API 密钥：**

    *   设置 `OPENAI_API_KEY` 环境变量。 例如：

        ```bash
        export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
        ```

    *   **重要提示：** 安全地存储你的 API 密钥，不要将其提交到你的存储库。

4.  **配置 i18n：**

    *   确保你已使用必要的语言文件（`en.json`、`zh.json` 等）正确配置了你的 i18n 库（例如 `react-i18next`）。
    *   有关详细说明，请参阅你选择的 i18n 库的文档。

5.  **运行应用程序：**

    ```bash
    npm start  # 或 yarn start
    ```

6.  **在浏览器中访问应用程序：** `http://localhost:3000` （或你的应用程序正在运行的端口）。

## 贡献

欢迎贡献！ 请参阅我们的 [CONTRIBUTING.md](CONTRIBUTING.md) 文件，了解如何贡献新问题、报告错误或提出改进建议的详细信息。

*   **添加问题：** 通过创建包含格式正确的 JSON 文件的拉取请求来提交新问题。 有关详细信息，请参阅[问题数据结构](#question-data-structure)。
*   **报告问题：** 使用 GitHub 问题跟踪器来报告错误或提出新功能。

## 问题数据结构

问题存储在具有以下结构的 JSON 文件中：

```json
[
  {
    "id": "1",
    "type": "Coding",
    "category": "Algorithms",
    "difficulty": "Easy",
    "translations": {
      "en": {
        "title": "Reverse a String",
        "description": "Write a function to reverse a string.",
        "topic": "Strings"
      },
      "zh": {
        "title": "反转字符串",
        "description": "编写一个函数来反转给定的字符串。",
        "topic": "字符串"
      }
    },
    "testCases": [
      {
        "input": "hello",
        "output": "olleh"
      }
    ]
  }
]
```

## 许可证

[MIT](LICENSE)