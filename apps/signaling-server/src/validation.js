const allowedJoinTypes = new Set(['doctor', 'patient', 'unknown'])

export function validateJoinPayload(message) {
  if (message.type !== 'join') {
    return { success: false, error: 'message type must be join' }
  }

  if (!message.from) {
    return { success: false, error: 'missing from field' }
  }

  if (!message.roomId) {
    return { success: false, error: 'missing roomId field' }
  }

  const data = message.data
  if (typeof data !== 'object' || data === null) {
    return { success: false, error: 'join payload requires data object' }
  }

  const userType = data.userType
  if (typeof userType !== 'string' || !allowedJoinTypes.has(userType)) {
    return { success: false, error: 'userType must be doctor|patient|unknown' }
  }

  return {
    success: true,
    data: {
      ...message,
      data: {
        userType,
        metadata: typeof data.metadata === 'object' ? data.metadata : undefined,
      },
    },
  }
}
