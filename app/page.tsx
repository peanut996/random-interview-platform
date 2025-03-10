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
import type { Question, UserAnswer } from "@/lib/types"
import { generateRandomQuestion } from "@/lib/data"
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

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)

  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoadingQuestion(true);
      try {
        const question = await generateRandomQuestion();
        setCurrentQuestion(question);
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
  }, [toast, t]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenSettings={onOpenSettings}
        onOpenHistory={onOpenHistory}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl flex-grow">
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

      {showHistoryModal && <HistoryModal language={language} onClose={onCloseHistory} />}

      <LoadingQuestionModal isOpen={isLoadingQuestion} />
    </div>
  )
}
