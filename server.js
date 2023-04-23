const express = require('express')
const path = require('path')
const http = require('http')
const next = require('next')
const socketio = require('socket.io')
const cors = require('cors')

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  let app = express()

  app.use(cors())

  const server = http.createServer(app)
  const io = new socketio.Server({
    cors: {
      origin: '*',
      methods: 'GET,POST',
    },
  })
  io.attach(server)

  app.use(express.static(path.join(__dirname, './public')))
  app.use('/_next', express.static(path.join(__dirname, './.next')))

  io.on('connection', (socket) => {
    console.log('A user connected')

    // Handle private messages
    socket.on('private message', (data) => {
      const { recipient, message } = data
      io.to(recipient).emit('private message', { message, sender: socket.id })
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })

  app.all('*', (req, res) => nextHandler(req, res))

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})

// This code is for React Native Expo
// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:3000");

// const PrivateChat = ({ recipient }) => {
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     socket.on("private message", (data) => {
//       setMessages((messages) => [...messages, data]);
//     });

//     return () => {
//       socket.off("private message");
//     };
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     socket.emit("private message", { recipient, message });
//     setMessage("");
//   };

//   return (
//     <div>
//       <h1>Private Chat with {recipient}</h1>
//       <ul>
//         {messages.map((msg, idx) => (
//           <li key={idx}>
//             {msg.sender}: {msg.message}
//           </li>
//         ))}
//       </ul>
//       <form onSubmit={handleSubmit}>
//         <input value={message} onChange={(e) => setMessage(e.target.value)} />
//         <button>Send</button>
//       </form>
//     </div>
//   );
// };

// export default PrivateChat;
