import React, { useState } from 'react'
import './ReceiveTemplate.css'

export default function ReceiveTemplate() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDownloadTemplate = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_END_ADDRESS}/download-template`)
      
      if (!response.ok) {
        throw new Error('Failed to download template')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'member_template.csv'
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (err) {
      setError('Failed to download template. Please try again.')
      console.error('Download error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="receive-template-card">
      <div className="card-header">
        <h3>Download CSV Template</h3>
        <p>Get the template to prepare your product list</p>
      </div>
      
      <div className="card-content">
        <div className="template-info">
          <div className="info-item">
            <span className="icon">📋</span>
            <span>CSV template with product columns</span>
          </div>
          <div className="info-item">
            <span className="icon">⚡</span>
            <span>Ready to fill with your products</span>
          </div>
          <div className="info-item">
            <span className="icon">📥</span>
            <span>Instant download</span>
          </div>
        </div>
        
        <button 
          className={`download-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleDownloadTemplate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Downloading...
            </>
          ) : (
            <>
              <span className="icon">📄</span>
              Download Template
            </>
          )}
        </button>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}


