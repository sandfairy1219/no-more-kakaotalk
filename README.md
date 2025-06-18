# Next.js Chat Service

This project is a simple chat service built with Next.js. It allows users to create or join chat rooms, set their nicknames, and interact with others in real-time.

## Features

- Create a new chat room
- Join an existing chat room using a room code
- Set a nickname before entering a chat room
- Real-time messaging within chat rooms

## Project Structure

```
nextjs-chat-service
├── src
│   ├── app
│   │   ├── globals.css          # Global CSS styles
│   │   ├── layout.tsx           # Layout component for consistent structure
│   │   ├── page.tsx             # Main entry point with room options
│   │   └── room
│   │       └── [roomId]
│   │           └── page.tsx     # Chat room interface for specific room
│   ├── components
│   │   ├── CreateRoomButton.tsx  # Button for creating a new chat room
│   │   ├── JoinRoomForm.tsx      # Form for joining a chat room
│   │   ├── NicknameModal.tsx      # Modal for setting user nickname
│   │   └── ChatRoom.tsx           # Component for displaying chat room
│   ├── lib
│   │   └── utils.ts               # Utility functions
│   └── types
│       └── index.ts               # TypeScript interfaces and types
├── public                          # Static assets
├── package.json                   # npm configuration
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # Project documentation
```

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd nextjs-chat-service
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to access the chat service.

## Usage

- On the main page, you can choose to create a new room or join an existing one by entering the room code.
- Before entering a chat room, you will be prompted to set a nickname.
- Once in the chat room, you can send and receive messages in real-time.

## License

This project is licensed under the MIT License.