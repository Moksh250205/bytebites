// chatHistoryStore.js
const NodeCache = require('node-cache');

class ChatHistoryStore {
  constructor(ttlMinutes = 40) {
    this.cache = new NodeCache({
      stdTTL: ttlMinutes * 60, // Convert minutes to seconds
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // For better performance
      deleteOnExpire: true // Automatically delete expired items
    });
  }

  addMessage(userId, role, content) {
    const currentHistory = this.getChatHistory(userId);
    
    const updatedHistory = {
      history: [
        ...currentHistory,
        {
          role,
          parts: [{ text: content }]
        }
      ]
    };

    this.cache.set(userId, updatedHistory);
  }

  getChatHistory(userId) {
    const data = this.cache.get(userId);
    return data?.history || [];
  }

  clearUserHistory(userId) {
    this.cache.del(userId);
  }

  clearAllHistory() {
    this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }
}

// Create a singleton instance
const chatHistory = new ChatHistoryStore();

// Handle development hot reloading
console.log(process.env.NODE_ENV); 
if (process.env.NODE_ENV === 'development') {
  if (!global.chatHistory) {
    global.chatHistory = new ChatHistoryStore();
  }
  module.exports = { chatHistory: global.chatHistory };
} else {
  module.exports = { chatHistory: new ChatHistoryStore() };
}


// const NodeCache = require('node-cache');

// class ChatHistoryStore {
//   constructor(ttlMinutes = 40) {
//     this.cache = new NodeCache({
//       stdTTL: ttlMinutes * 60,
//       checkperiod: 60,
//       useClones: false,
//       deleteOnExpire: true
//     });
//   }

//   addMessage(userId, role, content) {
//     const currentHistory = this.getChatHistory(userId);
//     const updatedHistory = {
//       history: [
//         ...currentHistory,
//         { role, parts: [{ text: content }] }
//       ]
//     };
//     this.cache.set(userId, updatedHistory);
//   }

//   getChatHistory(userId) {
//     const data = this.cache.get(userId);
//     return data?.history || [];
//   }

//   clearUserHistory(userId) {
//     this.cache.del(userId);
//   }

//   clearAllHistory() {
//     this.cache.flushAll();
//   }

//   getStats() {
//     return this.cache.getStats();
//   }
// }

// // Ensure singleton instance
// const chatHistory = new ChatHistoryStore();

// module.exports = chatHistory;
