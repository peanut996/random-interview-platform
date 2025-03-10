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
import LoadingQuestionModal from "@/components/modals/loading-question-modal"
import { useState, useEffect, useCallback } from "react"
import type { Question, UserAnswer, QuestionHistory } from "@/lib/types"
import { generateRandomQuestion } from "@/lib/question"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/hooks/use-toast"
// Update the onSubmit function to use the OpenAI API for evaluation
import { evaluateAnswer, getModelAnswer } from "@/lib/api"

export default function Page() {
  const { t, language, setLanguage } = useTranslation()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
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
  const [isStreaming, setIsStreaming] = useState(false)
  const { toast } = useToast()
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([])

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)

  // 在组件加载时从本地存储加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem("questionHistory");
    if (savedHistory) {
      try {
        setQuestionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing question history:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoadingQuestion(true);
      try {
        const question = await generateRandomQuestion();
        setCurrentQuestion(question);
        
        // 记录新获取的问题到历史记录
        const newHistoryItem: QuestionHistory = {
          id: question.id,
          title: question.translations[language]?.title || question.translations.en.title,
          timestamp: new Date().toISOString(),
          answered: false,
          language: language,
          question: question
        };
        
        setQuestionHistory(prevHistory => {
          // 检查是否已存在相同ID的问题
          const exists = prevHistory.some(item => item.id === question.id);
          if (!exists) {
            const updatedHistory = [newHistoryItem, ...prevHistory];
            localStorage.setItem("questionHistory", JSON.stringify(updatedHistory));
            return updatedHistory;
          }
          return prevHistory;
        });
      } catch (error) {
        console.error("Error fetching question:", error);
        toast({
          title: t("toast.error.title"),
          description: t("toast.error.questionLoad"),
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsLoadingQuestion(false);
      }
    };
    fetchQuestion();
  }, []);

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
  }, [timeRemaining]) // Added onSubmit to dependency array

  const onSubmit = async () => {
    setShowResultsModal(true)
    setIsSubmitted(true)
    setResults(null)
    setIsStreaming(true)

    try {
      // Call OpenAI to evaluate the answer with streaming
      await evaluateAnswer(currentQuestion, userAnswer.content, language, (streamingResults) => {
        setResults(streamingResults)
      })

      setIsStreaming(false)
      
      // 更新历史记录中的问题状态为已回答
      if (currentQuestion) {
        setQuestionHistory(prevHistory => {
          const updatedHistory = prevHistory.map(item => 
            item.id === currentQuestion.id 
              ? { ...item, answered: true } 
              : item
          );
          localStorage.setItem("questionHistory", JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      setIsStreaming(false)
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.description"),
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const onNextQuestion = useCallback(async () => {
    setUserAnswer({ content: "" });
    setIsSubmitted(false);
    setTimeRemaining(600);
    setIsLoadingQuestion(true);
    try {
      const question = await generateRandomQuestion();
      setCurrentQuestion(question);
      
      // 记录新问题到历史
      const newHistoryItem: QuestionHistory = {
        id: question.id,
        title: question.translations[language]?.title || question.translations.en.title,
        timestamp: new Date().toISOString(),
        answered: false,
        language: language,
        question: question
      };
      
      setQuestionHistory(prevHistory => {
        // 检查是否已存在相同ID的问题
        const exists = prevHistory.some(item => item.id === question.id);
        if (!exists) {
          const updatedHistory = [newHistoryItem, ...prevHistory];
          localStorage.setItem("questionHistory", JSON.stringify(updatedHistory));
          return updatedHistory;
        }
        return prevHistory;
      });
    } catch (error) {
      console.error("Error fetching next question:", error);
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.questionLoad"),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [toast, t, language]);

  const onViewAnswer = () => {
    setConfirmationStep(0)
    setShowConfirmationModal(true)
  }

  // Updated handleConfirmation function with streaming support
  const handleConfirmation = async () => {
    if (confirmationStep < 2) {
      setConfirmationStep((prevStep) => prevStep + 1)
    } else {
      setShowConfirmationModal(false)
      setAnswer(null)
      setIsStreaming(true)
      setShowAnswerModal(true)

      try {
        // Call OpenAI to get the model answer with streaming
        await getModelAnswer(currentQuestion, language, (streamingAnswer) => {
          setAnswer(streamingAnswer)
        })

        setIsStreaming(false)
        setIsSubmitted(true)
        
        // 更新历史记录中的问题状态为已回答
        if (currentQuestion) {
          setQuestionHistory(prevHistory => {
            const updatedHistory = prevHistory.map(item => 
              item.id === currentQuestion.id 
                ? { ...item, answered: true } 
                : item
            );
            localStorage.setItem("questionHistory", JSON.stringify(updatedHistory));
            return updatedHistory;
          });
        }
      } catch (error) {
        console.error("Error getting model answer:", error)
        setIsStreaming(false)
        toast({
          title: t("toast.error.title"),
          description: t("toast.error.description"),
          variant: "destructive",
          duration: 5000,
        })
      }
    }
  }

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
  
  // 从历史记录加载问题
  const loadQuestionFromHistory = (historyItem: QuestionHistory) => {
    setCurrentQuestion(historyItem.question);
    setUserAnswer({ content: "" });
    setIsSubmitted(false);
    setTimeRemaining(600);
    setShowHistoryModal(false);
  };

  // 在 Page 组件中添加一个函数来清除历史记录
  const clearQuestionHistory = () => {
    localStorage.removeItem("questionHistory");
    setQuestionHistory([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenSettings={onOpenSettings}
        onOpenHistory={onOpenHistory}
      />

      <main className="container mx-auto px-4 py-8 pb-24 max-w-5xl flex-grow">
        {currentQuestion && !isLoadingQuestion ? (
          <>
            <QuestionArea question={currentQuestion} language={language} onNotMyStack={handleNotMyStack} />
            <AnswerArea question={currentQuestion} userAnswer={userAnswer} setUserAnswer={setUserAnswer} />
          </>
        ) : !currentQuestion && !isLoadingQuestion ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <p className="text-lg">{t("question.error")}</p>
          </div>
        ) : null}
      </main>

      <FooterArea
        timeRemaining={timeRemaining}
        timerWarning={timerWarning}
        onSubmit={onSubmit}
        onNextQuestion={onNextQuestion}
        onViewAnswer={onViewAnswer}
        isSubmitted={isSubmitted}
        onNotMyStack={handleNotMyStack}
      />

      {showResultsModal && (
        <ResultsModal results={results} language={language} onClose={onCloseResultsModal} isStreaming={isStreaming} />
      )}

      {showAnswerModal && (
        <AnswerModal answer={answer} language={language} onClose={onCloseAnswerModal} isStreaming={isStreaming} />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          step={confirmationStep}
          language={language}
          onConfirm={handleConfirmation}
          onCancel={handleCancelConfirmation}
        />
      )}

      {showSettingsModal && <SettingsModal language={language} onClose={onCloseSettings} />}

      {showHistoryModal && (
        <HistoryModal 
          language={language} 
          onClose={onCloseHistory} 
          history={questionHistory}
          onSelectQuestion={loadQuestionFromHistory}
          onClearHistory={clearQuestionHistory}
        />
      )}

      <LoadingQuestionModal isOpen={isLoadingQuestion} />
    </div>
  )
}
