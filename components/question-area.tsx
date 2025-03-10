"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Question } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface QuestionAreaProps {
  question: Question;
  language: string;
  onNotMyStack: () => void;
}

export default function QuestionArea({
  question,
  language,
  onNotMyStack,
}: QuestionAreaProps) {
  const { t } = useTranslation();

  const title =
    question.translations[language]?.title || question.translations.en.title;
  const description =
    question.translations[language]?.description ||
    question.translations.en.description;
  const topic =
    question.translations[language]?.topic || question.translations.en.topic;

  const correctedDescription = description.replace(/\n/g, "<br>");

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            >
              {question.type}
            </Badge>
            <Badge
              variant="outline"
              className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
            >
              {topic}
            </Badge>
            <Badge
              variant="outline"
              className={`
              ${question.difficulty === "Easy" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" : ""}
              ${question.difficulty === "Medium" ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" : ""}
              ${question.difficulty === "Hard" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : ""}
            `}
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {correctedDescription}
          </ReactMarkdown>

          {question.type === "Coding" && question.testCases && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">
                {t("question.testCases")}
              </h3>
              <div className="space-y-2">
                {question.testCases.map((testCase, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
                  >
                    <div>
                      <strong>{t("question.input")}:</strong>{" "}
                      {JSON.stringify(testCase.input).replace(/\\n/g, "\n")}
                    </div>
                    <div>
                      <strong>{t("question.output")}:</strong>{" "}
                      {JSON.stringify(testCase.output).replace(/\\n/g, "\n")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onNotMyStack}>
            {t("button.notMyStack")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
