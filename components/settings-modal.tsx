"use client"

import { useState, useEffect } from 'react'

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [endpoint, setEndpoint] = useState('')
  const [token, setToken] = useState('')
  const [model, setModel] = useState('')

  // 加载保存的设置
  useEffect(() => {
    if (isOpen) {
      setEndpoint(localStorage.getItem('openai_endpoint') || '')
      setToken(localStorage.getItem('openai_token') || '')
      setModel(localStorage.getItem('openai_model') || 'gpt-4')
    }
  }, [isOpen])

  // 保存设置
  const saveSettings = () => {
    if (endpoint) localStorage.setItem('openai_endpoint', endpoint)
    else localStorage.removeItem('openai_endpoint')
    
    if (token) localStorage.setItem('openai_token', token)
    else localStorage.removeItem('openai_token')
    
    if (model) localStorage.setItem('openai_model', model)
    else localStorage.removeItem('openai_model')
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">OpenAI API 设置</h2>
        
        <div className="mb-4">
          <label className="block mb-2">API Endpoint (可选)</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
          <p className="text-sm text-gray-500 mt-1">留空使用服务器默认设置</p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">API Token (可选)</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sk-..."
            className="w-full p-2 border rounded dark:bg-gray-700"
          />
          <p className="text-sm text-gray-500 mt-1">留空使用服务器默认设置</p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">模型</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            取消
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
} 