import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true)
        handle(req, res, parsedUrl)
    })

    const ioInstance = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    })

        // Expose io for use in API routes
        ; (global as any).io = ioInstance

    const onlineUsers = new Set<string>()

    ioInstance.on('connection', (socket) => {
        const userId = socket.handshake.auth.userId

        if (userId) {
            socket.join(userId)
            onlineUsers.add(userId)
            console.log(`User connected: ${userId}`)

            // Broadcast online status
            ioInstance.emit('user_status', { userId, status: 'online' })
        }

        socket.on('disconnect', () => {
            if (userId) {
                onlineUsers.delete(userId)
                console.log(`User disconnected: ${userId}`)
                // Broadcast offline status
                ioInstance.emit('user_status', { userId, status: 'offline' })
            }
        })

        // Handle Real-time Messaging
        socket.on('send_message', (data) => {
            const { recipientId, message } = data
            if (recipientId) {
                ioInstance.to(recipientId).emit('new_message', message)
            }
        })

        socket.on('typing_start', (data) => {
            const { recipientId, conversationId } = data
            if (recipientId) {
                ioInstance.to(recipientId).emit('user_typing', {
                    userId,
                    conversationId,
                    isTyping: true
                })
            }
        })

        socket.on('typing_stop', (data) => {
            const { recipientId, conversationId } = data
            if (recipientId) {
                ioInstance.to(recipientId).emit('user_typing', {
                    userId,
                    conversationId,
                    isTyping: false
                })
            }
        })

        // Handle Notifications (already implemented but keeping for consistency)
        socket.on('send_notification', (data) => {
            const { targetUserId, notification } = data
            if (targetUserId) {
                ioInstance.to(targetUserId).emit('new_notification', notification)
            }
        })

        // Allow clients to check who is online
        socket.on('get_online_users', () => {
            socket.emit('online_users_list', Array.from(onlineUsers))
        })
    })

    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => {
        console.log(`> Ready on http://localhost:${PORT}`)
    })
})
