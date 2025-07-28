import React, { useState } from 'react'
import './SendTemplate.css'

export default function SendTemplate({ onDataReceived, onLoadingChange }) {
  const [zipCode, setZipCode] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      setMessage('')
    } else {
      setMessage('Please select a valid CSV file')
      setCsvFile(null)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!zipCode || !csvFile) {
      setMessage('Please provide both zip code and CSV file')
      return
    }

    setIsLoading(true)
    setMessage('')
    onLoadingChange(true)

    try {
      const formData = new FormData()
      formData.append('csv_file', csvFile)
      formData.append('zip_code', zipCode)

      const response = await fetch(`${import.meta.env.VITE_BACK_END_ADDRESS}/scrape`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setMessage('Scraping completed successfully!')
        console.log('SendTemplate - Results:', data)
        onDataReceived(data)
      } else {
        setMessage('Error: Failed to process request')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setIsLoading(false)
      onLoadingChange(false)
    }
  }

  return (
    <div className="send-template-container">
      <div className="send-template-card">
        <h2>Upload CSV Template</h2>
        <p>Upload your CSV file with product names and enter a zip code to start scraping</p>
        
        <form onSubmit={handleSubmit} className="send-template-form">
          <div className="form-group">
            <label htmlFor="zipCode">Zip Code:</label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter zip code"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="csvFile">CSV File:</label>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
            <small>Upload a CSV file with a 'product_name' column</small>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !zipCode || !csvFile}
            className="submit-button"
          >
            {isLoading ? 'Processing...' : 'Start Scraping'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
