"use client";

import { ArrowLeft, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Peer from "peerjs";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function JoinPage() {
    const [roomId, setRoomId] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
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

    useEffect(() => {
        const url = new URL(window.location.href);
        const roomFromUrl = url.searchParams.get("room");
        if (roomFromUrl) {
            setRoomId(roomFromUrl);
            // 如果有房间码参数，自动尝试加入
            joinRoom(roomFromUrl);
        }

        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (videoRef.current && activeStream) {
            videoRef.current.srcObject = activeStream;
            videoRef.current.play().catch(console.error);
        }
    }, [activeStream]);

    function joinRoom(roomIdToJoin: string = roomId) {
        if (!roomIdToJoin.trim()) {
            toast({
                title: roomCodeRequired,
                description: roomCodeRequiredDescription,
                variant: "destructive"
            });
            return;
        }

        setIsConnecting(true);

        const peer = new Peer({ debug: 2 });
        peerRef.current = peer;

        peer.on("open", () => {
            const connection = peer.connect(roomIdToJoin);

            connection.on("open", () => {
                toast({
                    title: connected,
                    description: waitingForHost
                });
            });

            peer.on("call", (call) => {
                call.answer();
                call.on("stream", (remoteStream) => {
                    setActiveStream(remoteStream);
                });
            });

            connection.on("close", () => {
                setIsConnecting(false);
                setRoomId("");
                setActiveStream(null);
                toast({
                    title: disconnected,
                    description: disconnectedDescription,
                    variant: "destructive"
                });
            });
        });

        peer.on("error", (err) => {
            console.error("Peer error:", err);
            setIsConnecting(false);
            toast({
                title: connectionFailed,
                description: connectionFailedDescription,
                variant: "destructive"
            });
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
                                    disabled={isConnecting} 
                                    className="bg-blue-900/30 border-purple-400/30 text-blue-100 placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/30" 
                                />
                                <Button 
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md shadow-purple-500/20" 
                                    onClick={() => joinRoom()} 
                                    disabled={isConnecting || !roomId.trim()}
                                >
                                    {isConnecting ? 
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                            {t("connecting")}
                                        </div> : 
                                        joinText
                                    }
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative aspect-video bg-blue-900/50 backdrop-blur-sm rounded-lg overflow-hidden group border border-purple-400/20">
                                    <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline loop controls />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 