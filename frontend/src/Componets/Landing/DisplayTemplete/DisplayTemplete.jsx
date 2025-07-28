import React from 'react'
import './DisplayTemplete.css'

export default function DisplayTemplete({ scrapedData, isLoading }) {
  // Debug logging
  console.log('DisplayTemplate - scrapedData:', scrapedData)
  console.log('DisplayTemplate - isLoading:', isLoading)

  if (isLoading) {
    return (
      <div className="display-template-container">
        <div className="display-template-card loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing your data...(this may take a minute)</p>
          </div>
        </div>
      </div>
    )
  }

  if (!scrapedData) {
    return (
      <div className="display-template-container">
        <div className="display-template-card empty">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Data Available</h3>
            <p>Upload a CSV file and start scraping to see results here</p>
          </div>
        </div>
      </div>
    )
  }

  const { results, zip_code, products_processed } = scrapedData

  return (
    <div className="display-template-container">
      <div className="display-template-card">
        <div className="card-header">
          <h2>Scraping Results</h2>
          <div className="summary-info">
            <div className="info-item">
              <span className="icon">📍</span>
              <span>Zip Code: {zip_code}</span>
            </div>
            <div className="info-item">
              <span className="icon">📦</span>
              <span>Products Processed: {products_processed}</span>
            </div>
          </div>
        </div>

        <div className="results-container">
          {results && results.length > 0 ? (
            <div className="results-grid">
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="product-header">
                    <h3 className="product-name">{result.product_name}</h3>
                    <span className="store-name">Smart & Final</span>
                  </div>
                  
                  <div className="product-details">
                    <div className="price-info">
                      <span className="price">{result.price}</span>
                    </div>
                    
                    <div className="product-meta">
                      <div className="meta-item">
                        <span className="label">Store:</span>
                        <span className="store-info">Smart & Final</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="product-actions">
                    <a 
                      href={result.product_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-product-btn"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No Results Found</h3>
              <p>No products were found for the given criteria. Try adjusting your search parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
