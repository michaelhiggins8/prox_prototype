import React, { useState } from 'react'
import ReceiveTemplate from './ReceiveTemplate/ReceiveTemplate'
import SendTemplate from './SendTemplate/SendTemplate'
import DisplayTemplete from './DisplayTemplete/DisplayTemplete'
import './Landing.css'

const frontendAddress = import.meta.env.VITE_FRONT_END_ADDRESS;
const backendAddress = import.meta.env.VITE_BACK_END_ADDRESS;

export default function Landing() {
  const [scrapedData, setScrapedData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleScrapedData = (data) => {
    setScrapedData(data)
  }

  const handleLoadingState = (loading) => {
    setIsLoading(loading)
  }

  return (
    <div className="landing-container">
      {/* Environment Variables: Frontend: {frontendAddress}, Backend: {backendAddress} */}
      <ReceiveTemplate />
      <SendTemplate onDataReceived={handleScrapedData} onLoadingChange={handleLoadingState} />
      <DisplayTemplete scrapedData={scrapedData} isLoading={isLoading} />
    </div>
  )
}
