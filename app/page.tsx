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
  const [results, setResults] = useState(null)
  const [answer, setAnswer] = useState(null)
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

    try {
      // Call OpenAI to evaluate the answer
      const evaluationResults = await evaluateAnswer(currentQuestion, userAnswer.content, language)

      setResults(evaluationResults)
      setShowResultsModal(true)
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast({
        title: t("toast.error.title"),
        description: t("toast.error.description"),
        variant: "destructive",
        duration: 5000,
      })
    }
  }

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
      setConfirmationStep((prevStep) => prevStep + 1)
    } else {
      setShowConfirmationModal(false)

      try {
        // Show loading state
        toast({
          title: t("toast.loading.title"),
          description: t("toast.loading.description"),
          duration: 3000,
        })

        // Call OpenAI to get the model answer
        const modelAnswer = await getModelAnswer(currentQuestion, language)

        setAnswer(modelAnswer)
        setShowAnswerModal(true)
        setIsSubmitted(true)
      } catch (error) {
        console.error("Error getting model answer:", error)
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

