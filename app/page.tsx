"use client"

import Header from "@/components/header"
import QuestionArea from "@/components/question-area"
import AnswerArea from "@/components/answer-area"
import FooterArea from "@/components/footer-area"
import ResultsModal from "@/components/modals/results-modal"
import ConfirmationModal from "@/components/modals/confirmation-modal"
import SettingsModal from "@/components/modals/settings-modal"
import HistoryModal from "@/components/modals/history-modal"
import QuestionLoading from "@/components/question-loading"
import AnswerDisplay from "@/components/answer-display"
import { useState, useEffect, useCallback } from "react"
import type { Question, UserAnswer, QuestionHistory } from "@/lib/types"
import { QuestionType } from "@/lib/types"
import { generateRandomQuestion } from "@/lib/question"
import { useTranslation } from "@/lib/i18n"
import { useToast } from "@/hooks/use-toast"
// Update the onSubmit function to use the OpenAI API for evaluation
import { evaluateAnswer, getModelAnswer } from "@/lib/api"
import {jsonrepair} from "jsonrepair";

export default function Page() {
  const { t, language, setLanguage } = useTranslation()
  const { toast } = useToast()

  // Question states
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([])

  // Answer states
  const [userAnswer, setUserAnswer] = useState<UserAnswer>({ content: "" })
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerWarning, setTimerWarning] = useState(false)

  // Result and confirmation modal states
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  // Settings and history modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // Editor language state
  const [editorLanguage, setEditorLanguage] = useState("java")

  // Answer modal states
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [showInlineAnswer, setShowInlineAnswer] = useState(false)
  const [parsedAnswer, setParsedAnswer] = useState<any>(null)

  // Initialize by loading questionHistory from localStorage
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      try {
        const savedHistory = localStorage.getItem("questionHistory")
        if (savedHistory) {
          setQuestionHistory(JSON.parse(savedHistory))
        }
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
        // Reset the timer and start it when question loading is complete
        setTimeRemaining(600);
        setIsTimerRunning(true);
      }
    };
    fetchQuestion();
  }, []);

  useEffect(() => {
    // Only run the timer if isTimerRunning is true and we're not loading a question
    if (!isTimerRunning || isLoadingQuestion) {
      return;
    }

    // Don't auto-submit when timer reaches zero, just show a warning
    if (timeRemaining <= 0) {
      setTimerWarning(true);
      return;
    }

    if (timeRemaining <= 60) {
      setTimerWarning(true);
    } else {
      setTimerWarning(false);
    }

    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemaining, isTimerRunning, isLoadingQuestion]);

  const onSubmit = async () => {
    // Stop the timer when submitting
    setIsTimerRunning(false);
    
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
    // Reset answer states when getting a new question
    setUserAnswer({ content: "" });
    setIsSubmitted(false);
    setTimeRemaining(600);
    setIsLoadingQuestion(true);
    // Reset timer state
    setIsTimerRunning(false);
    
    // Close any open answer displays
    setShowAnswerModal(false);
    setShowInlineAnswer(false);
    setAnswer(null);
    setParsedAnswer(null);
    
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
      // Start the timer after loading is complete
      setIsTimerRunning(true);
    }
  }, [toast, t, language]);

  const onViewAnswer = () => {
    setConfirmationStep(0)
    setShowConfirmationModal(true)
  }

  // Updated handleConfirmation function to show answers inline
  const handleConfirmation = async () => {
    // Make sure modals are properly managed
    setShowAnswerModal(false);
    
    if (confirmationStep < 2) {
      setConfirmationStep((prevStep) => prevStep + 1)
      return
    }

    // Reset to start
    setConfirmationStep(0)
    setShowConfirmationModal(false)
    
    if (!currentQuestion) {
      return
    }

    // Stop the timer when viewing answer
    setIsTimerRunning(false);

    // Set streaming state and prepare to display inline answer
    setIsStreaming(true)
    setShowInlineAnswer(true)
    setAnswer("")
    setParsedAnswer(null)

    try {
      // Call OpenAI to get the model answer with streaming
      // Pass the editor language as a code language hint
      await getModelAnswer(currentQuestion, language, (streamingAnswer) => {
        // 直接设置最新内容，不进行累加
        setAnswer(streamingAnswer);
      }, editorLanguage) // Pass the editor language as a hint

      // Once streaming is complete
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

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false)
  }

  const handleNotMyStack = () => {
    // Close any open answer displays before moving to the next question
    setShowAnswerModal(false);
    setShowInlineAnswer(false);
    setAnswer(null);
    setParsedAnswer(null);

    // Move to the next question
    onNextQuestion()
  }

  const onCloseResultsModal = () => {
    setShowResultsModal(false)
  }

  const onCloseAnswerModal = () => {
    setShowAnswerModal(false)
    // For inline answers
    setShowInlineAnswer(false)
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
    setCurrentQuestion(historyItem.question)
    setIsLoadingQuestion(false)
    setUserAnswer({ content: "" })
    setIsSubmitted(false)
    setTimeRemaining(600)
    setIsTimerRunning(true)
    setShowHistoryModal(false)

    // Reset answer states
    setShowAnswerModal(false)
    setShowInlineAnswer(false)
    setAnswer(null)
    setParsedAnswer(null)

    // If the question type requires a code editor but we're not in code mode
    if (historyItem.question.type === QuestionType.Coding && editorLanguage !== "java") {
      // Set a default coding language
      setEditorLanguage("java")
      toast({
        title: t("toast.switchedToCode.title") || "Switched to Code Editor",
        description: t("toast.switchedToCode.description") || "The question type has been changed to coding",
        duration: 3000,
      });
    }
  };

  // Add a handler function to close the inline answer display
  const handleCloseInlineAnswer = () => {
    setShowInlineAnswer(false);
  }

  // Add a handler function to edit the answer
  const handleEditAnswer = () => {
    setShowInlineAnswer(false);
  }

  // Add a handler function to retry generating answer
  const handleRetry = async () => {
    if (!currentQuestion) {
      return
    }

    // Set streaming state and prepare to regenerate answer
    setIsStreaming(true)
    setAnswer("")
    setParsedAnswer(null)

    try {
      // Call OpenAI to get the model answer with streaming
      // Pass the editor language as a code language hint
      await getModelAnswer(currentQuestion, language, (streamingAnswer) => {
        // 直接设置最新内容，不进行累加
        setAnswer(streamingAnswer);
      }, editorLanguage) // Pass the editor language as a hint

      // Once streaming is complete
      setIsStreaming(false)
      
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenSettings={onOpenSettings}
        onOpenHistory={onOpenHistory}
      />

      <main className="container mx-auto px-4 py-8 pb-24 max-w-5xl flex-grow">
        {isLoadingQuestion ? (
          <QuestionLoading />
        ) : currentQuestion ? (
          <>
            <QuestionArea question={currentQuestion} language={language} onNotMyStack={handleNotMyStack} />
            
            {/* Show AI answer if requested */}
            {showInlineAnswer ? (
              <AnswerDisplay 
                answer={answer || ""}
                language={language} 
                isStreaming={isStreaming}
                parsedAnswer={parsedAnswer}
                onClose={handleCloseInlineAnswer}
                onEdit={handleEditAnswer}
                onRetry={handleRetry}
              />
            ) : (
              <AnswerArea 
                question={currentQuestion} 
                userAnswer={userAnswer} 
                setUserAnswer={setUserAnswer}
                onEditorLanguageChange={setEditorLanguage} 
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <p>{t("question.error")}</p>
          </div>
        )}
      </main>

      <FooterArea
        isTimerWarning={timerWarning}
        timeRemaining={timeRemaining}
        onSubmit={onSubmit}
        onViewAnswer={onViewAnswer}
        onNextQuestion={onNextQuestion}
        isSubmitted={isSubmitted}
        showViewAnswer={!isSubmitted && !showInlineAnswer}
        isLoadingQuestion={isLoadingQuestion}
        disableSubmit={!userAnswer.content || isSubmitted || isLoadingQuestion}
      />

      {showResultsModal && (
        <ResultsModal
          open={showResultsModal}
          onClose={onCloseResultsModal}
          results={results}
          question={currentQuestion}
          isLoading={isStreaming}
          language={language}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          open={showConfirmationModal}
          onConfirm={handleConfirmation}
          onCancel={handleCancelConfirmation}
          step={confirmationStep}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          open={showSettingsModal}
          onClose={onCloseSettings}
          onReload={onNextQuestion}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          open={showHistoryModal}
          onClose={onCloseHistory}
          history={questionHistory}
          onSelect={loadQuestionFromHistory}
          language={language}
        />
      )}
    </div>
  )
}
