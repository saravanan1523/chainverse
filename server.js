"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var url_1 = require("url");
var next_1 = __importDefault(require("next"));
var socket_io_1 = require("socket.io");
var dev = process.env.NODE_ENV !== 'production';
var app = (0, next_1.default)({ dev: dev });
var handle = app.getRequestHandler();
app.prepare().then(function () {
    var server = (0, http_1.createServer)(function (req, res) {
        var parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    var ioInstance = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    global.io = ioInstance;
    var onlineUsers = new Set();
    ioInstance.on('connection', function (socket) {
        var userId = socket.handshake.auth.userId;
        if (userId) {
            socket.join(userId);
            onlineUsers.add(userId);
            console.log("User connected: ".concat(userId));
            // Broadcast online status
            ioInstance.emit('user_status', { userId: userId, status: 'online' });
        }
        socket.on('disconnect', function () {
            if (userId) {
                onlineUsers.delete(userId);
                console.log("User disconnected: ".concat(userId));
                // Broadcast offline status
                ioInstance.emit('user_status', { userId: userId, status: 'offline' });
            }
        });
        // Handle Real-time Messaging
        socket.on('send_message', function (data) {
            var recipientId = data.recipientId, message = data.message;
            if (recipientId) {
                ioInstance.to(recipientId).emit('new_message', message);
            }
        });
        socket.on('typing_start', function (data) {
            var recipientId = data.recipientId, conversationId = data.conversationId;
            if (recipientId) {
                ioInstance.to(recipientId).emit('user_typing', {
                    userId: userId,
                    conversationId: conversationId,
                    isTyping: true
                });
            }
        });
        socket.on('typing_stop', function (data) {
            var recipientId = data.recipientId, conversationId = data.conversationId;
            if (recipientId) {
                ioInstance.to(recipientId).emit('user_typing', {
                    userId: userId,
                    conversationId: conversationId,
                    isTyping: false
                });
            }
        });
        // Handle Notifications (already implemented but keeping for consistency)
        socket.on('send_notification', function (data) {
            var targetUserId = data.targetUserId, notification = data.notification;
            if (targetUserId) {
                ioInstance.to(targetUserId).emit('new_notification', notification);
            }
        });
        // Allow clients to check who is online
        socket.on('get_online_users', function () {
            socket.emit('online_users_list', Array.from(onlineUsers));
        });
    });
    var PORT = process.env.PORT || 3000;
    server.listen(PORT, function () {
        console.log("> Ready on http://localhost:".concat(PORT));
    });
});
