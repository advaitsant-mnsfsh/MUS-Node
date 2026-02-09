// Queue disabled and replaced with direct background processing to avoid Redis dependency.
export const auditQueue = {
    add: async () => console.log('Queue disabled: processing directly instead.')
};
export default auditQueue;
