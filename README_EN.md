<p align="center">
   <img src="public/logo.svg" alt="AI Interview Simulator Logo" width="120" height="120" />
   <br> <a href="README.md">中文</a> | English
</p>

# AI Interview Simulator

A technical interview simulation platform with an Apple-style UI, designed to help you practice and improve your coding and technical skills.

## Features

*   **Realistic Interview Simulation:** Experience a realistic interview environment with coding challenges and technical questions.
*   **Apple-Style UI:**  Clean, modern, and intuitive user interface inspired by Apple's design principles.
*   **AI-Powered Feedback:**  Receive detailed feedback and improvement suggestions powered by OpenAI.
*   **Customizable Settings:**  Configure question types, categories, difficulty levels, and even your OpenAI API endpoint and model.
*   **Multi-Language Support:**  Practice in your preferred language (currently supports English and Chinese).
*   **Personalized Learning:**  The platform tracks your mistakes and prioritizes questions you need to work on.
*   **"Not My Stack" Feature:**  Exclude questions that are not relevant to your technology stack.
*   **History Tracking:** Review your past performance and identify areas for improvement.
*   **GitHub Integration:** Contribute new questions or report issues via GitHub.

## Technologies Used

*   [React](https://reactjs.org/) (or your chosen frontend framework)
*   [Node.js](https://nodejs.org/en/) (or your chosen backend environment)
*   [Express](https://expressjs.com/) (or your chosen backend framework)
*   [OpenAI API](https://openai.com/api/)
*   [react-i18next](https://react.i18next.com/) (or your chosen i18n library)
*   [Monaco Editor](https://microsoft.github.io/monaco-editor/) (or similar code editor)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/ai-interview-simulator.git
    cd ai-interview-simulator
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Configure your OpenAI API key:**

    *   Set the `OPENAI_API_KEY` environment variable.  For example:

        ```bash
        export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
        ```

    *   **Important:**  Store your API key securely and do not commit it to your repository.

4.  **Configure i18n:**

    *   Ensure that you have properly configured your i18n library (e.g., `react-i18next`) with the necessary language files (`en.json`, `zh.json`, etc.).
    *   Refer to the documentation of your chosen i18n library for detailed instructions.

5.  **Run the application:**

    ```bash
    npm start  # or yarn start
    ```

6.  **Access the application in your browser:** `http://localhost:3000` (or the port your application is running on).

## Contributing

We welcome contributions!  Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute new questions, report bugs, or suggest improvements.

*   **Adding Questions:** Submit new questions by creating a pull request with a properly formatted JSON file.  Refer to the [question data structure](#question-data-structure) for details.
*   **Reporting Issues:**  Use the GitHub issue tracker to report bugs or suggest new features.

## Question Data Structure

Questions are stored in a JSON file with the following structure:

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

## License

[MIT](LICENSE)
