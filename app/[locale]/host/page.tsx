"use client";

import { ArrowLeft, Monitor, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Peer from "peerjs";
import { ShareOptions } from "./_components/ShareOptions";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function HostPage() {
    const [roomId, setRoomId] = useState("");
    const [peer, setPeer] = useState<Peer | null>(null);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const [connections, setConnections] = useState<string[]>([]);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const reconnectAttempts = useRef(0);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const { toast } = useToast();
    const router = useRouter();
    const t = useTranslations("host");

    // 初始化Peer连接
    const initializePeer = () => {
        try {
            // 清理之前的实例和重连定时器
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            
            if (peer) {
                peer.destroy();
            }
            
            const newPeer = new Peer({ 
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
            setPeer(newPeer);

            // 成功建立连接
            newPeer.on("open", (id) => {
                setRoomId(id);
                setIsReconnecting(false);
                reconnectAttempts.current = 0;
                
                if (isReconnecting) {
                    toast({
                        title: "连接已恢复",
                        description: "信令服务器连接已成功重建",
                        variant: "default"
                    });
                }
            });

            // 处理连接请求
            newPeer.on("connection", (connection) => {
                // 处理连接打开事件
                connection.on("open", () => {
                    setConnections((prev) => {
                        if (!prev.includes(connection.peer)) {
                            return [...prev, connection.peer];
                        }
                        return prev;
                    });
                    
                    // 处理连接数据
                    connection.on("data", (data) => {
                        console.log("收到数据:", data);
                        // 根据需要处理收到的数据
                    });
                });

                // 处理连接错误
                connection.on("error", (err) => {
                    console.error("连接错误:", err);
                    // 移除失败的连接
                    setConnections((prev) => prev.filter((peerId) => peerId !== connection.peer));
                });

                // 处理连接关闭
                connection.on("close", () => {
                    setConnections((prev) => prev.filter((peerId) => peerId !== connection.peer));
                });
            });

            // 处理Peer错误
            newPeer.on("error", (err) => {
                console.error("Peer错误:", err);
                const errorMsg = err.toString();
                
                // 服务器连接错误处理
                if (errorMsg.includes("Could not connect to peer") || 
                    errorMsg.includes("Lost connection to server") ||
                    errorMsg.includes("Socket closed")) {
                    
                    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                        setIsReconnecting(true);
                        
                        // 指数退避重连
                        const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
                        toast({
                            title: "连接中断",
                            description: `正在尝试重新连接... (${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`,
                            duration: delay
                        });
                        
                        reconnectTimerRef.current = setTimeout(() => {
                            reconnectAttempts.current += 1;
                            initializePeer();
                        }, delay);
                    } else {
                        toast({
                            title: "无法连接",
                            description: "重试次数已达上限，请检查网络连接或稍后再试。",
                            variant: "destructive"
                        });
                    }
                } else {
                    toast({
                        title: "连接错误",
                        description: `发生错误: ${errorMsg.substring(0, 100)}${errorMsg.length > 100 ? '...' : ''}`,
                        variant: "destructive"
                    });
                }
            });

            // 处理Peer断开
            newPeer.on("disconnected", () => {
                console.log("Peer已断开连接");
                
                if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    setIsReconnecting(true);
                    
                    // 尝试重新连接到服务器
                    setTimeout(() => {
                        // 检查Peer是否存在且处于断开状态而不是已销毁状态
                        if (newPeer && newPeer.disconnected && !newPeer.destroyed) {
                            try {
                                console.log("尝试重新连接到信令服务器...");
                                newPeer.reconnect();
                            } catch (err) {
                                console.error("重连失败:", err);
                                // 如果重连失败，则创建新的Peer实例
                                reconnectAttempts.current += 1;
                                initializePeer();
                            }
                        } else {
                            console.log("Peer已不可用，创建新实例");
                            reconnectAttempts.current += 1;
                            initializePeer();
                        }
                    }, 1000);
                }
            });

            // 处理Peer销毁事件
            newPeer.on("close", () => {
                console.log("Peer连接已关闭");
                // 如果不是主动关闭，尝试重新初始化
                if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts.current += 1;
                    setTimeout(() => {
                        initializePeer();
                    }, 1000);
                }
            });
            
            return newPeer;
        } catch (error) {
            console.error("初始化Peer错误:", error);
            toast({
                title: "初始化失败",
                description: "无法创建点对点连接，请刷新页面重试。",
                variant: "destructive"
            });
            return null;
        }
    };

    useEffect(() => {
        const newPeer = initializePeer();
        
        return () => {
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            
            if (newPeer) {
                newPeer.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!peer) return;

        if (!activeStream) {
            if (connections.length > 0) {
                toast({
                    title: t("newViewerConnected"),
                    description: t("clickToStartSharing"),
                    duration: Infinity,
                    action: (
                        <ToastAction
                            altText={t("startSharing")}
                            onClick={async () => {
                                try {
                                    const stream = await navigator.mediaDevices.getDisplayMedia({
                                        video: {
                                            width: { ideal: 1920, max: 2560 },
                                            height: { ideal: 1080, max: 1440 },
                                            frameRate: { ideal: 25, max: 30 },
                                            displaySurface: 'monitor',
                                        },
                                        audio: true
                                    });
                                    
                                    const videoTracks = stream.getVideoTracks();
                                    if (videoTracks.length > 0) {
                                        const videoTrack = videoTracks[0];
                                        try {
                                            await videoTrack.applyConstraints({
                                                width: { ideal: 1920, min: 1280 },
                                                height: { ideal: 1080, min: 720 },
                                                frameRate: { ideal: 24, min: 15 },
                                            });
                                            
                                            if (videoTrack.contentHint !== undefined) {
                                                videoTrack.contentHint = 'detail';
                                            }
                                            
                                            console.log('Applied high quality constraints');
                                        } catch (constraintErr) {
                                            console.warn('Failed to apply video constraints:', constraintErr);
                                        }
                                    }
                                    
                                    setActiveStream(stream);
                                } catch (err) {
                                    console.error("Screen sharing error:", err);
                                    toast({
                                        title: t("sharingError"),
                                        description: t("sharingErrorDescription"),
                                        variant: "destructive"
                                    });
                                }
                            }}>
                            {t("startSharing")}
                        </ToastAction>
                    )
                });
            }
        } else {
            connections.forEach((connection) => {
                const call = peer.call(connection, activeStream, { 
                    sdpTransform: (sdp) => {
                        return sdp.replace(
                            /a=mid:video\r\n/g, 
                            'a=mid:video\r\nb=AS:8000\r\n'
                        );
                    }
                });
                
                activeStream.getTracks()[0].onended = () => {
                    call.close();
                    activeStream.getTracks().forEach((track) => track.stop());
                };
            });
        }
    }, [peer, toast, activeStream, connections, t]);

    function endSession() {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        
        if (activeStream) {
            activeStream.getTracks().forEach((track) => track.stop());
            setActiveStream(null);
        }

        if (peer) {
            peer.destroy();
            setPeer(null);
        }

        setConnections([]);
        setRoomId("");

        toast({
            title: t("sessionEnded"),
            description: t("sessionEndedDescription")
        });

        router.push("/");
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

                <Card className="bg-white/10 backdrop-blur-md border border-blue-300/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Monitor className="h-6 w-6 text-blue-400" />
                            {t("title")}
                        </CardTitle>
                        <CardDescription className="text-blue-200">{t("description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ShareOptions roomId={roomId} />

                        <div className="flex items-center justify-between p-4 bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-400/20">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-400" />
                                <span className="text-sm text-blue-200">{t("currentViewers")}</span>
                            </div>
                            <span className="text-lg font-semibold text-white">{connections.length}</span>
                        </div>

                        {activeStream && (
                            <div className="flex justify-end pt-4">
                                <Button variant="destructive" onClick={endSession} className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-0 shadow-md shadow-red-500/20">
                                    {t("stopSharing")}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 