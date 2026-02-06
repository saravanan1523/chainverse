import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
})

export const connectSocket = (userId: string) => {
    if (!socket.connected) {
        socket.auth = { userId }
        socket.connect()
    }
}

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect()
    }
}
