/**
 * Detect user intent from message and current page context
 * @param {string} message - User message
 * @param {string} currentPage - Current page context
 * @returns {string} - Intent type: 'course_recommendation', 'product_recommendation', 'studio_reservation', 'general_help'
 */
export function detectIntent(message, currentPage) {
  const lowerMessage = message.toLowerCase();

  // Course-related keywords
  if (
    lowerMessage.includes('course') ||
    lowerMessage.includes('learn') ||
    lowerMessage.includes('training') ||
    lowerMessage.includes('class') ||
    lowerMessage.includes('lesson') ||
    currentPage?.includes('course')
  ) {
    return 'course_recommendation';
  }

  // Studio/Reservation-related keywords
  if (
    lowerMessage.includes('studio') ||
    lowerMessage.includes('book') ||
    lowerMessage.includes('reserve') ||
    lowerMessage.includes('appointment') ||
    lowerMessage.includes('session') ||
    currentPage?.includes('studio')
  ) {
    return 'studio_reservation';
  }

  // Product-related keywords
  if (
    lowerMessage.includes('product') ||
    lowerMessage.includes('buy') ||
    lowerMessage.includes('shop') ||
    lowerMessage.includes('purchase') ||
    lowerMessage.includes('item') ||
    currentPage?.includes('shop') ||
    currentPage?.includes('product')
  ) {
    return 'product_recommendation';
  }

  // Default to general help
  return 'general_help';
}

/**
 * Generate contextual AI response based on intent and available data
 * @param {string} message - User message
 * @param {string} intent - Detected intent
 * @param {object} data - Available data (courses, services, products)
 * @param {array} conversationHistory - Previous messages in conversation
 * @returns {string} - AI response
 */
export function generateResponse(message, intent, data, conversationHistory) {
  const { courses, studioServices, products } = data;

  switch (intent) {
    case 'course_recommendation':
      return generateCourseResponse(message, courses, conversationHistory);

    case 'studio_reservation':
      return generateStudioResponse(message, studioServices, conversationHistory);

    case 'product_recommendation':
      return generateProductResponse(message, products, conversationHistory);

    case 'general_help':
    default:
      return generateGeneralResponse(message, conversationHistory);
  }
}

/**
 * Generate course recommendation response
 */
function generateCourseResponse(message, courses, history) {
  if (courses.length === 0) {
    return "I'd love to help you find the perfect course! Unfortunately, we don't have any courses available at the moment. Please check back soon or contact our support team for more information.";
  }

  const courseList = courses
    .slice(0, 3)
    .map((c) => `• ${c.name || c.title}`)
    .join('\n');

  return `Based on your interest in courses, here are some great options we offer:\n\n${courseList}\n\nWould you like more details about any of these courses?`;
}

/**
 * Generate studio reservation response
 */
function generateStudioResponse(message, services, history) {
  if (services.length === 0) {
    return "I'd be happy to help you book a studio session! We currently don't have any services available for booking. Please contact our team directly to inquire about availability.";
  }

  const serviceList = services
    .slice(0, 3)
    .map((s) => `• ${s.name || s.title}`)
    .join('\n');

  return `Great! We have several studio services available for you:\n\n${serviceList}\n\nWhich service interests you? I can help you book a session!`;
}

/**
 * Generate product recommendation response
 */
function generateProductResponse(message, products, history) {
  if (products.length === 0) {
    return "I'd love to help you find the right product! We have a great selection available. Let me show you some popular items that might interest you.";
  }

  const productList = products
    .slice(0, 3)
    .map((p) => `• ${p.name || p.title}`)
    .join('\n');

  return `Here are some products I think you'll love:\n\n${productList}\n\nWould you like to know more about any of these items?`;
}

/**
 * Generate general help response
 */
function generateGeneralResponse(message, history) {
  // Simple contextual response based on message
  if (
    message.toLowerCase().includes('help') ||
    message.toLowerCase().includes('support')
  ) {
    return "I'm here to help! I can assist you with:\n• Finding courses\n• Booking studio sessions\n• Recommending products\n• Answering general questions\n\nWhat would you like help with?";
  }

  if (
    message.toLowerCase().includes('hello') ||
    message.toLowerCase().includes('hi')
  ) {
    return "Hello! Welcome! I'm the IWS Assistant. How can I help you today? Feel free to ask about our courses, studio services, products, or anything else!";
  }

  return "Thanks for your message! I'm here to help. Could you tell me more about what you're looking for? I can help with courses, studio bookings, products, or general questions.";
}