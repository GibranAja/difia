<template>
    <div class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span class="loading-text">Loading...</span>
      </div>
    </div>
  </template>
  
  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    background-color: rgba(255, 255, 255, 0.8); /* Optional: Add a semi-transparent background */
  }
  
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e8ba38;
    border-top: 4px solid #02163b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    color: #02163b;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.2rem;
    font-weight: 500;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  </style>