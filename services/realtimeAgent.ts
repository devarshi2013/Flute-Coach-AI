export const realtimeAgent = {
  connect: () => {
    // TODO: establish realtime connection
  },
  disconnect: () => {
    // TODO: close realtime connection
  },
  sendAudio: (chunk: ArrayBuffer) => {
    // TODO: stream audio chunk to agent
  },
  onFeedback: (callback: (feedback: unknown) => void) => {
    // TODO: register feedback listener
  },
};
