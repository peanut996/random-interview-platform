"use client"

import Header from "@/components/header"
import QuestionArea from "@/components/question-area"
import AnswerArea from "@/components/answer-area"
import FooterArea from "@/components/footer-area"
import ResultsModal from "@/components/modals/results-modal"
import AnswerModal from "@/components/modals/answer-modal"
import ConfirmationModal from "@/components/modals/confirmation-modal"
import SettingsModal from "@/components/modals/settings-modal"
import HistoryModal from "@/components/modals/history-modal"
import { useState, useEffect, useCallback } from "react"
import type { Question, UserAnswer } from "@/lib/types"
import { getQuestions } from "@/lib/data"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/hooks/use-toast"
// Update the onSubmit function to use the OpenAI API for evaluation
import { evaluateAnswer, getModelAnswer } from "@/lib/api"

export default function Page() {
  const { t, language, setLanguage } = useTranslation()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState<UserAnswer>({ content: "" })
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [timerWarning, setTimerWarning] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [answer, setAnswer] = useState<any>(null)
  const { toast } = useToast() // Move useToast here

  useEffect(() => {
    setQuestions(getQuestions())
  }, [])

  useEffect(() => {
    if (timeRemaining <= 0) {
      onSubmit()
      return
    }

    if (timeRemaining <= 60) {
      setTimerWarning(true)
    } else {
      setTimerWarning(false)
    }

    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeRemaining])

  const currentQuestion = questions[currentQuestionIndex]

  // Replace the onSubmit function
  const onSubmit = async () => {
    setIsSubmitted(true)
    
    // 创建一个临时结果对象，用于存储流式响应的结果
    let tempResults = {
      overallScore: 0,
      categoryScores: {
        correctness: 0,
        efficiency: 0,
        readability: 0
      },
      feedback: {
        en: "",
        zh: ""
      },
      improvementSuggestions: []
    }
    
    // 显示加载状态
    setResults(tempResults)
    setShowResultsModal(true)

    try {
      // 使用流式响应评估答案，但只累积文本而不尝试解析 JSON
      let fullResponse = "";
      
      await evaluateAnswer(currentQuestion, userAnswer.content, language, {
        onChunk: (chunk) => {
          // 直接将每个块添加到反馈中，不尝试解析 JSON
          fullResponse += chunk;
          tempResults.feedback.en = fullResponse;
          tempResults.feedback.zh = fullResponse;
          setResults({...tempResults});
        }
      });
      
      // 评估完成后，尝试解析完整的响应为 JSON
      try {
        const finalResult = JSON.parse(fullResponse);
        setResults(finalResult);
      } catch (e) {
        console.error("Error parsing final JSON:", e);
        // 如果无法解析，保留文本格式
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.description"),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const onNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
    setUserAnswer({ content: "" })
    setIsSubmitted(false)
    setTimeRemaining(600)
  }, [])

  const onViewAnswer = () => {
    setConfirmationStep(0)
    setShowConfirmationModal(true)
  }

  // Replace the handleConfirmation function
  const handleConfirmation = async () => {
    if (confirmationStep < 2) {
      setConfirmationStep((prevStep) => prevStep + 1);
    } else {
      setShowConfirmationModal(false);

      // 创建一个临时答案对象，用于存储流式响应的结果
      let tempAnswer = {
        answer: {
          en: "",
          zh: ""
        }
      };
      
      // 显示加载状态
      setAnswer(tempAnswer);
      setShowAnswerModal(true);

      try {
        // 显示加载状态
        toast({
          title: t("toast.loading.title"),
          description: t("toast.loading.description"),
          duration: 3000,
        });

        // 使用流式响应获取模型答案，但只累积文本
        let fullResponse = "";
        
        await getModelAnswer(currentQuestion, language, {
          onChunk: (chunk) => {
            // 直接将每个块添加到答案中，不尝试解析 JSON
            fullResponse += chunk;
            tempAnswer.answer.en = fullResponse;
            tempAnswer.answer.zh = fullResponse;
            setAnswer({...tempAnswer});
          }
        });
        
        // 完成后，尝试解析完整的响应为 JSON
        try {
          const finalAnswer = JSON.parse(fullResponse);
          setAnswer(finalAnswer);
        } catch (e) {
          console.error("Error parsing final JSON:", e);
          // 如果无法解析，保留文本格式
        }
        
        setIsSubmitted(true);
      } catch (error) {
        console.error("Error getting model answer:", error);
        toast({
          title: t("toast.error.title"),
          description: t("toast.error.description"),
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false)
  }

  const handleNotMyStack = useCallback(() => {
    // Mark the current question as "not my stack"
    const notMyStackQuestions = JSON.parse(localStorage.getItem("notMyStackQuestions") || "[]")
    if (currentQuestion && !notMyStackQuestions.includes(currentQuestion.id)) {
      notMyStackQuestions.push(currentQuestion.id)
      localStorage.setItem("notMyStackQuestions", JSON.stringify(notMyStackQuestions))

      // Show toast notification here instead
      toast({
        title: t("toast.notMyStack.title"),
        description: t("toast.notMyStack.description"),
        duration: 3000,
      })
    }

    // Move to the next question
    onNextQuestion()
  }, [currentQuestion, onNextQuestion, toast, t])

  const onCloseResultsModal = () => {
    setShowResultsModal(false)
  }

  const onCloseAnswerModal = () => {
    setShowAnswerModal(false)
  }

  const onOpenSettings = () => {
    setShowSettingsModal(true)
  }

  const onCloseSettings = () => {
    setShowSettingsModal(false)
  }

  const onOpenHistory = () => {
    setShowHistoryModal(true)
  }

  const onCloseHistory = () => {
    setShowHistoryModal(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenSettings={onOpenSettings}
        onOpenHistory={onOpenHistory}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl flex-grow">
        {currentQuestion && (
          <>
            <QuestionArea question={currentQuestion} language={language} onNotMyStack={handleNotMyStack} />
            <AnswerArea question={currentQuestion} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />
          </>
        )}
      </main>

      <FooterArea
        timeRemaining={timeRemaining}
        timerWarning={timerWarning}
        onSubmit={onSubmit}
        onNextQuestion={onNextQuestion}
        onViewAnswer={onViewAnswer}
        isSubmitted={isSubmitted}
      />

      {showResultsModal && <ResultsModal results={results} language={language} onClose={onCloseResultsModal} />}

      {showAnswerModal && <AnswerModal answer={answer} language={language} onClose={onCloseAnswerModal} />}

      {showConfirmationModal && (
        <ConfirmationModal
          step={confirmationStep}
          language={language}
          onConfirm={handleConfirmation}
          onCancel={handleCancelConfirmation}
        />
      )}

      {showSettingsModal && <SettingsModal language={language} onClose={onCloseSettings} />}

      {showHistoryModal && <HistoryModal language={language} onClose={onCloseHistory} />}
    </div>
  )
}

