# Chapii Demo

A modern AI assistant chat application built with React, TypeScript, and Vapi integration.

## 🚀 Features

- 🤖 AI Assistant conversations with Vapi Web SDK
- 📱 Responsive design with Tailwind CSS
- 🎯 Component-based architecture
- 💬 Real-time messaging interface
- 🎨 Modern UI with custom components
- 🔧 TypeScript for type safety
- ⚡ Vite for fast development

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: Vapi Web SDK
- **Build Tools**: Vite, ESLint
- **Package Manager**: npm/pnpm

## 📁 Project Structure

```
chapii/
├── chapii-app/              # Main React application
│   ├── src/
│   │   ├── features/        # Feature-based components
│   │   │   ├── Assistant/   # Assistant selection and Vapi integration
│   │   │   ├── Character/   # Character display components
│   │   │   └── Messages/    # Message and conversation components
│   │   ├── components/      # Shared UI components
│   │   ├── lib/            # Utilities and type definitions
│   │   └── config/         # Configuration files
│   └── ...
└── README.md
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/chapii_demo/chapii_demo.git
   cd chapii_demo
   ```

2. **Install dependencies**
   ```bash
   cd chapii-app
   npm install
   ```

3. **Configure your Vapi credentials**
   - Set up your Vapi API keys in the environment configuration
   - Update `src/config/env.config.ts` with your settings

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 🔧 Available Scripts

In the `chapii-app` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Features

### Assistant Integration
- Seamless Vapi Web SDK integration
- Real-time voice and text conversations
- Assistant selection and management

### Modern UI/UX
- Responsive design that works on all devices
- Clean, modern interface with Tailwind CSS
- Smooth animations and transitions

### Developer Experience
- TypeScript for enhanced development experience
- Hot module replacement with Vite
- ESLint for code quality
- Component-based architecture

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](chapii-app/LICENSE) file for details.

## 🔗 Links

- [Vapi Documentation](https://docs.vapi.ai)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

---

Built with ❤️ using Vapi AI
