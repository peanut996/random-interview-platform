import type { Question } from "./types"

export function getQuestions(): Question[] {
  // This would typically fetch from an API or JSON file
  return [
    {
      id: "1",
      type: "Coding",
      category: "Algorithms",
      difficulty: "Easy",
      translations: {
        en: {
          title: "Reverse a String",
          description:
            "Write a function to reverse a given string. For example, if the input is 'hello', the output should be 'olleh'.",
          topic: "Strings",
        },
        zh: {
          title: "反转字符串",
          description: "编写一个函数来反转给定的字符串。例如，如果输入是 'hello'，输出应该是 'olleh'。",
          topic: "字符串",
        },
      },
      testCases: [
        { input: "hello", output: "olleh" },
        { input: "world", output: "dlrow" },
      ],
    },
    {
      id: "2",
      type: "Question",
      category: "TCP",
      difficulty: "Medium",
      translations: {
        en: {
          title: "Explain TCP Handshake",
          description:
            "Describe the three-way handshake process in TCP. What happens at each step, and why is this process necessary?",
          topic: "Networking",
        },
        zh: {
          title: "解释 TCP 握手",
          description: "描述 TCP 三次握手过程。每一步发生了什么，为什么这个过程是必要的？",
          topic: "网络",
        },
      },
    },
  ]
}

