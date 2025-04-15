"use client";

import { ArrowLeft, Users, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Peer from "peerjs";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

// 全局交互状态管理
let hasUserInteractedWithDocument = false;

// 设置全局用户交互监听
if (typeof window !== 'undefined') {
    // 用于检测用户是否与文档交互
    const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll', 'mousedown'];
    
    const handleGlobalInteraction = () => {
        hasUserInteractedWithDocument = true;
        
        // 移除所有事件监听器
        interactionEvents.forEach(event => {
            window.removeEventListener(event, handleGlobalInteraction);
        });
    };
    
    // 添加事件监听器
    interactionEvents.forEach(event => {
        window.addEventListener(event, handleGlobalInteraction);
    });
}

export default function JoinPage() {
    const [roomId, setRoomId] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // 默认静音开始
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [pendingInteraction, setPendingInteraction] = useState(false);
    const reconnectAttempts = useRef(0);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const connectionRef = useRef<any>(null);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const { toast } = useToast();
    const t = useTranslations("join");
    const params = useParams();
    const locale = params.locale as string;

    // 用于本地化处理
    const joinText = locale === 'zh' ? '加入房间' : 'Join Room';
    const placeholderText = locale === 'zh' ? '输入房间代码...' : 'Enter room code...';
    const connected = locale === 'zh' ? '已连接' : 'Connected';
    const waitingForHost = locale === 'zh' ? '已连接！等待主持人共享屏幕...' : 'Connected! Waiting for host to share their screen...';
    const connectionFailed = locale === 'zh' ? '连接失败' : 'Connection Failed';
    const connectionFailedDescription = locale === 'zh' ? '无法连接到房间。请检查代码并重试。' : 'Could not connect to the room. Please check the code and try again.';
    const disconnected = locale === 'zh' ? '已断开连接' : 'Disconnected';
    const disconnectedDescription = locale === 'zh' ? '与主持人的连接已断开。' : 'Connection with the host has been closed.';
    const roomCodeRequired = locale === 'zh' ? '需要房间代码' : 'Room Code Required';
    const roomCodeRequiredDescription = locale === 'zh' ? '请输入房间代码以加入会话。' : 'Please enter a room code to join the session.';
    const reconnecting = locale === 'zh' ? '正在重新连接...' : 'Reconnecting...';
    const reconnected = locale === 'zh' ? '连接已恢复' : 'Connection Restored';
    const reconnectionFailed = locale === 'zh' ? '重连失败' : 'Reconnection Failed';
    const unmute = locale === 'zh' ? '点击取消静音' : 'Click to unmute';
    const mute = locale === 'zh' ? '点击静音' : 'Click to mute';
    const needInteraction = locale === 'zh' ? '点击屏幕开始播放' : 'Click to start playback';

    // 全局用户交互处理
    useEffect(() => {
        // 检查是否已有全局交互
        if (hasUserInteractedWithDocument) {
            setHasUserInteracted(true);
        } else {
            // 监听文档级交互事件
            const handleDocumentInteraction = () => {
                setHasUserInteracted(true);
                document.removeEventListener('click', handleDocumentInteraction);
                document.removeEventListener('touchstart', handleDocumentInteraction);
                document.removeEventListener('keydown', handleDocumentInteraction);
            };
            
            document.addEventListener('click', handleDocumentInteraction);
            document.addEventListener('touchstart', handleDocumentInteraction);
            document.addEventListener('keydown', handleDocumentInteraction);
            
            return () => {
                document.removeEventListener('click', handleDocumentInteraction);
                document.removeEventListener('touchstart', handleDocumentInteraction);
                document.removeEventListener('keydown', handleDocumentInteraction);
            };
        }
    }, []);

    // 清理函数
    const cleanup = () => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        
        if (connectionRef.current) {
            try {
                connectionRef.current.close();
            } catch (e) {
                console.warn('关闭连接时出错:', e);
            }
            connectionRef.current = null;
        }
        
        if (peerRef.current) {
            try {
                peerRef.current.destroy();
            } catch (e) {
                console.warn('销毁Peer时出错:', e);
            }
            peerRef.current = null;
        }
        
        reconnectAttempts.current = 0;
        setIsConnecting(false);
        setIsReconnecting(false);
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        const roomFromUrl = url.searchParams.get("room");
        if (roomFromUrl) {
            setRoomId(roomFromUrl);
            // 如果有房间码参数，自动尝试加入
            joinRoom(roomFromUrl);
        }

        return cleanup;
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    // 处理视频播放
    const tryPlayVideo = async () => {
        if (!videoRef.current || !activeStream) return;
        
        try {
            // 尝试播放，初始设置为静音以绕过自动播放限制
            videoRef.current.muted = isMuted;
            await videoRef.current.play();
            
            // 如果需要用户交互但用户还没有交互，标记为等待交互
            if (!hasUserInteracted && !isMuted) {
                setPendingInteraction(true);
            }
            
            console.log('视频播放成功', isMuted ? '(静音模式)' : '(有声模式)');
        } catch (err) {
            console.error('播放视频时出错:', err);
            
            // 如果错误是由于浏览器策略导致的
            if (err instanceof Error && err.name === 'NotAllowedError') {
                // 切换到静音模式并重试
                if (!isMuted) {
                    setIsMuted(true);
                    setPendingInteraction(true);
                    // 立即重试静音播放
                    setTimeout(() => {
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            videoRef.current.play().catch(e => 
                                console.warn('静音播放仍然失败:', e)
                            );
                        }
                    }, 50);
                } else {
                    // 已经是静音还失败，需要直接用户交互
                    setPendingInteraction(true);
                    toast({
                        title: '需要用户交互',
                        description: needInteraction,
                        duration: 5000
                    });
                }
            }
        }
    };

    // 处理取消静音
    const handleToggleMute = async () => {
        if (!videoRef.current) return;
        
        try {
            // 更新状态并应用到视频元素
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);
            videoRef.current.muted = newMuteState;
            
            // 如果取消静音且视频暂停，尝试播放
            if (!newMuteState && videoRef.current.paused) {
                await videoRef.current.play();
            }
            
            setPendingInteraction(false);
            setHasUserInteracted(true);
        } catch (error) {
            console.error('切换静音状态失败:', error);
        }
    };

    // 处理视频容器点击
    const handleVideoContainerClick = async () => {
        if (pendingInteraction) {
            await handleToggleMute();
        }
        setHasUserInteracted(true);
    };

    useEffect(() => {
        if (videoRef.current && activeStream) {
            videoRef.current.srcObject = activeStream;
            
            // 设置高质量视频播放
            if (videoRef.current) {
                // 启用硬件加速
                videoRef.current.style.transform = 'translateZ(0)';
                
                // 优先质量的视频设置
                videoRef.current.setAttribute('playsinline', '');
                videoRef.current.setAttribute('autoplay', '');
                
                // 设置视频质量相关属性
                try {
                    // 提高视频解码优先级
                    if ('priority' in videoRef.current) {
                        (videoRef.current as any).priority = 'high';
                    }
                    
                    // 设置视频缓冲策略，优先选择质量
                    if ('buffered' in videoRef.current && videoRef.current.buffered.length === 0) {
                        // 一些浏览器支持设置较大的缓冲区来提高质量
                        videoRef.current.preload = 'auto';
                    }
                } catch (err) {
                    console.warn('Failed to set advanced video properties', err);
                }
                
                // 尝试播放视频
                tryPlayVideo();
            }
        }
    }, [activeStream, isMuted]);

    // 尝试重新连接到主机
    const reconnectToHost = (roomIdToJoin: string) => {
        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
            setIsReconnecting(false);
            setIsConnecting(false);
            toast({
                title: reconnectionFailed,
                description: '重试次数已达上限，请检查网络连接或重新加入房间。',
                variant: 'destructive'
            });
            return;
        }
        
        setIsReconnecting(true);
        
        // 使用指数退避算法设置延迟
        const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
        console.log(`正在尝试重新连接... 第${reconnectAttempts.current + 1}次，延迟${delay}ms`);
        
        toast({
            title: reconnecting,
            description: `尝试重新连接到主机... (${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`,
            duration: delay
        });
        
        // 清理之前的实例
        if (peerRef.current) {
            try {
                peerRef.current.destroy();
            } catch (e) {
                console.warn('销毁旧Peer时出错:', e);
            }
            peerRef.current = null;
        }
        
        if (connectionRef.current) {
            try {
                connectionRef.current.close();
            } catch (e) {
                console.warn('关闭旧连接时出错:', e);
            }
            connectionRef.current = null;
        }
        
        // 设置重连定时器
        reconnectTimerRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            joinRoom(roomIdToJoin, true);
        }, delay);
    };

    function joinRoom(roomIdToJoin: string = roomId, isReconnect: boolean = false) {
        if (!roomIdToJoin.trim()) {
            toast({
                title: roomCodeRequired,
                description: roomCodeRequiredDescription,
                variant: "destructive"
            });
            return;
        }

        if (!isReconnect) {
            reconnectAttempts.current = 0;
            setIsConnecting(true);
            setIsReconnecting(false);
        }

        // 清理之前的重连定时器
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        const peer = new Peer({ 
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }, // 添加更多STUN服务器提高成功率
                    { urls: 'stun:stun3.l.google.com:19302' },
                    { urls: 'stun:stun4.l.google.com:19302' },
                ],
                iceCandidatePoolSize: 10,
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
                sdpSemantics: 'unified-plan' // 使用最新的SDP语义
            }
        });
        peerRef.current = peer;

        // 设置打开连接超时
        const connectionTimeout = setTimeout(() => {
            if (!peer.open) {
                console.warn('Peer连接超时');
                peer.destroy();
                
                if (!isReconnect) {
                    setIsConnecting(false);
                    toast({
                        title: connectionFailed,
                        description: '连接到信令服务器超时，请检查网络连接并重试。',
                        variant: 'destructive'
                    });
                } else {
                    reconnectToHost(roomIdToJoin);
                }
            }
        }, 15000); // 15秒超时

        peer.on("open", () => {
            clearTimeout(connectionTimeout);
            
            try {
                const connection = peer.connect(roomIdToJoin, {
                    reliable: true,
                    serialization: 'json',
                });
                connectionRef.current = connection;
                
                // 设置连接超时
                const connectTimeout = setTimeout(() => {
                    if (!connection.open) {
                        console.warn('连接到主机超时');
                        connection.close();
                        peer.destroy();
                        
                        if (!isReconnect) {
                            setIsConnecting(false);
                            toast({
                                title: connectionFailed,
                                description: '连接到主机超时，请检查房间代码或稍后重试。',
                                variant: 'destructive'
                            });
                        } else {
                            reconnectToHost(roomIdToJoin);
                        }
                    }
                }, 15000); // 15秒超时

                connection.on("open", () => {
                    clearTimeout(connectTimeout);
                    setIsConnecting(false);
                    
                    // 如果是重连，显示成功消息
                    if (isReconnect) {
                        setIsReconnecting(false);
                        reconnectAttempts.current = 0;
                        toast({
                            title: reconnected,
                            description: '已成功重新连接到主机。',
                            variant: 'default'
                        });
                    } else {
                        toast({
                            title: connected,
                            description: waitingForHost
                        });
                    }
                });

                connection.on("error", (err) => {
                    console.error("连接错误:", err);
                    
                    // 尝试重连
                    if (!isReconnecting) {
                        reconnectToHost(roomIdToJoin);
                    }
                });

                connection.on("close", () => {
                    console.log("连接已关闭");
                    setActiveStream(null);
                    
                    // 如果不是主动关闭，尝试重连
                    if (!isReconnecting) {
                        toast({
                            title: disconnected,
                            description: disconnectedDescription,
                            variant: "destructive"
                        });
                        
                        reconnectToHost(roomIdToJoin);
                    }
                });

                peer.on("call", (call) => {
                    call.answer();
                    
                    // 设置媒体流超时
                    const streamTimeout = setTimeout(() => {
                        if (!activeStream) {
                            console.warn('获取媒体流超时');
                            
                            if (!isReconnecting) {
                                toast({
                                    title: '接收流失败',
                                    description: '无法接收主持人的媒体流，可能主持人尚未开始共享。',
                                    variant: 'default'
                                });
                            }
                        }
                    }, 20000); // 20秒超时
                    
                    call.on("stream", (remoteStream) => {
                        clearTimeout(streamTimeout);
                        
                        // 提高视频清晰度，取消之前的低性能设备优化策略
                        if (remoteStream.getVideoTracks().length > 0) {
                            try {
                                const videoTrack = remoteStream.getVideoTracks()[0];
                                // 建议浏览器优先保障清晰度
                                if (videoTrack.contentHint !== undefined) {
                                    videoTrack.contentHint = 'detail';
                                }
                                console.log('Set video track to high quality mode');
                            } catch (error) {
                                console.warn('Failed to set video quality:', error);
                            }
                        }
                        
                        setActiveStream(remoteStream);
                    });
                    
                    call.on("error", (err) => {
                        clearTimeout(streamTimeout);
                        console.error("媒体流错误:", err);
                        
                        toast({
                            title: '媒体流错误',
                            description: '接收主持人的媒体流时发生错误。',
                            variant: 'destructive'
                        });
                    });
                    
                    call.on("close", () => {
                        console.log("媒体流已关闭");
                        setActiveStream(null);
                    });
                });

            } catch (error) {
                console.error("连接到主机时出错:", error);
                peer.destroy();
                
                if (!isReconnect) {
                    setIsConnecting(false);
                    toast({
                        title: connectionFailed,
                        description: '连接主机失败，请检查房间代码。',
                        variant: 'destructive'
                    });
                } else {
                    reconnectToHost(roomIdToJoin);
                }
            }
        });

        peer.on("error", (err) => {
            clearTimeout(connectionTimeout);
            console.error("Peer错误:", err);
            
            const errorMsg = err.toString();
            // 根据具体错误类型处理
            if (errorMsg.includes("Could not connect to peer") ||
                errorMsg.includes("Lost connection to server") ||
                errorMsg.includes("Socket closed")) {
                
                // 网络相关错误，尝试重连
                if (!isReconnect) {
                    setIsConnecting(false);
                    reconnectToHost(roomIdToJoin);
                } else {
                    reconnectToHost(roomIdToJoin);
                }
            } else {
                // 其他错误
                if (!isReconnect) {
                    setIsConnecting(false);
                    toast({
                        title: connectionFailed,
                        description: `${connectionFailedDescription} (${errorMsg.substring(0, 100)}${errorMsg.length > 100 ? '...' : ''})`,
                        variant: "destructive"
                    });
                } else {
                    reconnectToHost(roomIdToJoin);
                }
            }
        });
        
        // 处理连接断开
        peer.on("disconnected", () => {
            console.log("Peer连接已断开");
            
            // 尝试重新连接
            setTimeout(() => {
                // 检查Peer是否存在且处于断开状态而不是已销毁状态
                if (peer && peer.disconnected && !peer.destroyed) {
                    try {
                        console.log("尝试重新连接到信令服务器...");
                        peer.reconnect();
                    } catch (error) {
                        console.error("重连失败:", error);
                        reconnectToHost(roomIdToJoin);
                    }
                } else {
                    console.log("Peer已不可用，重新创建");
                    reconnectToHost(roomIdToJoin);
                }
            }, 1000);
        });

        // 处理Peer关闭事件
        peer.on("close", () => {
            console.log("Peer连接已关闭");
            if (!isReconnect) {
                reconnectToHost(roomIdToJoin);
            }
        });
    }

    return (
        <div className="py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <Button variant="outline" asChild className="bg-white/10 border-blue-300/20 text-blue-100 hover:bg-blue-800/30 hover:text-white">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t("backToHome")}
                    </Link>
                </Button>

                <Card className="bg-white/10 backdrop-blur-md border border-purple-300/20 shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Users className="h-6 w-6 text-purple-400" />
                            {t("title")}
                        </CardTitle>
                        <CardDescription className="text-blue-200">{t("description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!activeStream ? (
                            <div className="space-y-4">
                                <Input 
                                    placeholder={placeholderText} 
                                    value={roomId} 
                                    onChange={(e) => setRoomId(e.target.value)} 
                                    disabled={isConnecting || isReconnecting} 
                                    className="bg-blue-900/30 border-purple-400/30 text-blue-100 placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/30" 
                                />
                                <Button 
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md shadow-purple-500/20" 
                                    onClick={() => joinRoom()} 
                                    disabled={isConnecting || isReconnecting || !roomId.trim()}
                                >
                                    {isReconnecting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                            {reconnecting}
                                        </div>
                                    ) : isConnecting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                            {t("connecting")}
                                        </div>
                                    ) : joinText}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div 
                                    className="relative aspect-video bg-blue-900/50 backdrop-blur-sm rounded-lg overflow-hidden group border border-purple-400/20"
                                    onClick={handleVideoContainerClick}
                                >
                                    <video 
                                        ref={videoRef} 
                                        className="w-full h-full object-contain" 
                                        playsInline 
                                        loop 
                                        controls={!pendingInteraction}
                                        style={{ 
                                            transform: 'translateZ(0)',  // 启用硬件加速
                                            willChange: 'transform',     // 提示浏览器预先做好准备进行变换
                                            imageRendering: 'auto' as const, // 图像渲染使用浏览器默认设置
                                            objectFit: 'contain', // 确保视频内容完整显示
                                        }}
                                    />
                                    
                                    {/* 音量控制按钮 */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleMute();
                                        }}
                                        className="absolute bottom-4 right-4 bg-black/50 border-white/20 hover:bg-black/70 z-10"
                                        title={isMuted ? unmute : mute}
                                    >
                                        {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                                    </Button>
                                    
                                    {/* 等待交互提示覆盖层 */}
                                    {pendingInteraction && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                                            <div className="text-center p-4">
                                                <div className="bg-blue-500/20 p-3 rounded-full inline-block mb-3">
                                                    {isMuted ? <VolumeX className="h-8 w-8 text-white" /> : <Volume2 className="h-8 w-8 text-white" />}
                                                </div>
                                                <p className="text-white text-lg font-semibold">{needInteraction}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* 静音状态提示（当没有交互覆盖层时显示） */}
                                {isMuted && !pendingInteraction && (
                                    <div className="text-center text-sm text-blue-200 bg-blue-900/30 py-2 px-4 rounded">
                                        <div className="flex items-center justify-center gap-2">
                                            <VolumeX className="h-4 w-4" />
                                            <span>{unmute}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 