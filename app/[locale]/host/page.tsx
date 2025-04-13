"use client";

import { ArrowLeft, Monitor, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

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
    const { toast } = useToast();
    const router = useRouter();
    const t = useTranslations("host");

    useEffect(() => {
        try {
            const newPeer = new Peer({ debug: 2 });
            setPeer(newPeer);

            newPeer.on("open", (id) => {
                setRoomId(id);
            });

            newPeer.on("connection", (connection) => {
                setConnections((prev) => [...prev, connection.peer]);

                connection.on("close", () => {
                    setConnections((prev) => prev.filter((peerId) => peerId !== connection.peer));
                });
            });

            return () => {
                newPeer.destroy();
            };
        } catch (error) {
            console.error("Error initializing peer:", error);
        }
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
                                        video: true,
                                        audio: true
                                    });
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
                const call = peer.call(connection, activeStream);

                activeStream.getTracks()[0].onended = () => {
                    call.close();
                    activeStream.getTracks().forEach((track) => track.stop());
                };
            });
        }
    }, [peer, toast, activeStream, connections, t]);

    function endSession() {
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