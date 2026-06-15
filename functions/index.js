/**
 * Firebase Cloud Functions - Main Entry Point
 * Exports all cloud functions for the Giovanni e-commerce platform
 */

const sendOrderConfirmation = require('./sendOrderConfirmation');

// Export all functions
module.exports = {
  sendOrderConfirmationEmail: sendOrderConfirmation.sendOrderConfirmationEmail,
  sendOrderConfirmationRetry: sendOrderConfirmation.sendOrderConfirmationRetry,
};
