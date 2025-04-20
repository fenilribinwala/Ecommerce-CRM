import mitt from 'mitt';

// Create a new event emitter instance
export const eventBus = mitt();

// Export default for backward compatibility
export default eventBus;
