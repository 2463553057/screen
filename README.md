# Screen Sharing Application

A real-time screen sharing application built with Next.js, WebRTC, and PeerJS. Create or join rooms to share your screen with others instantly.

## ✨ Features

- Real-time screen and audio sharing
- Room-based sharing system
- Cross-browser support
- Simple and intuitive interface

## 📱 Device Support

- **Hosting**: Desktop/laptop browsers only
- **Viewing**: Works on all devices (desktop, tablet, mobile)

## 🌐 Browser Support

| Browser             | Screen Sharing | Audio Sharing                |
| ------------------- | -------------- | ---------------------------- |
| **Google Chrome**   | ✅             | ✅ (Only when sharing a tab) |
| **Microsoft Edge**  | ✅             | ✅ (Only when sharing a tab) |
| **Mozilla Firefox** | ✅             | ❌                           |
| **Apple Safari**    | ✅             | ❌                           |

### Important Notes

- For audio sharing to work, users have to select the **tab option** when sharing in **Google Chrome** or **Microsoft Edge**.

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [PeerJS](https://peerjs.com/) - WebRTC abstraction
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 🚀 Getting Started

First, clone the repository:

```bash
git clone https://github.com/tonghohin/screen-sharing.git
```

Navigate to the project directory:

```bash
cd screen-sharing
```

### Using npm

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### Using Docker

Start the development container:

```bash
docker compose up
```

## 📦 Deployment

### Cloud Platform

This application can be deployed on any cloud platform that supports static site hosting.

### Self Hosting

You can self-host this application using Docker:

```bash
docker run -p 3000:3000 -d --name screen-sharing ghcr.io/tonghohin/screen-sharing:latest
```

## 👥 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📄 License
工作流程
主持人流程:
创建新房间，自动生成唯一的房间ID
与观看者建立连接
当有观看者连接时，可以开始共享屏幕
可以随时结束共享会话
观看者流程:
输入房间码或点击共享链接
连接到主持人的房间
等待主持人开始共享屏幕
实时观看共享内容
技术实现细节
使用 PeerJS 简化 WebRTC 的复杂连接过程
利用 WebRTC 的 MediaDevices.getDisplayMedia() API 获取屏幕共享流
房间系统基于 PeerJS 的唯一ID
响应式设计，适配各种设备屏幕
支持跨浏览器使用，但音频共享仅在特定浏览器和特定模式下可用

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
