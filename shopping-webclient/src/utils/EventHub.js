import mitt from 'mitt';

// Create a new event emitter instance
export const eventHub = mitt();

// Export default for backward compatibility
export default eventHub;
