"use client";

import { Copy, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

interface ShareOptionsProps {
    roomId: string;
}

export function ShareOptions({ roomId }: ShareOptionsProps) {
    const { toast } = useToast();
    const t = useTranslations("host");
    const [shareableLink, setShareableLink] = useState<string>("");

    // 生成可共享链接
    const generateShareableLink = (): string => {
        if (!roomId) return "";
        const currentPath = window.location.pathname;
        const locale = currentPath.split('/')[1];
        return `${window.location.origin}/${locale}/join?room=${roomId}`;
    };

    // 当 roomId 改变时更新共享链接
    useEffect(() => {
        if (roomId) {
            setShareableLink(generateShareableLink());
        } else {
            setShareableLink("");
        }
    }, [roomId]);

    function copyRoomId() {
        navigator.clipboard.writeText(roomId);
        toast({
            title: t("roomCode"),
            description: t("codeDescription")
        });
    }

    function copyShareableLink() {
        if (!roomId) return;
        
        const link = generateShareableLink();
        navigator.clipboard.writeText(link);
        toast({
            title: t("shareableLink"),
            description: t("linkDescription")
        });
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-blue-200">
                        <span>{t("roomCode")}</span>
                        <Button variant="ghost" size="sm" className="gap-2 text-blue-300 hover:bg-blue-800/30 hover:text-blue-100" onClick={copyRoomId} disabled={!roomId}>
                            <Copy className="h-4 w-4" />
                            {t("copyCode")}
                        </Button>
                    </div>
                    <div className="relative group">
                        <code className="block w-full p-3 bg-blue-900/30 backdrop-blur-sm border border-blue-400/20 rounded-lg text-sm font-mono text-blue-100 transition-all group-hover:border-blue-400/40">{roomId || t("generatingCode")}</code>
                        {roomId && <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity cursor-pointer" onClick={copyRoomId}>
                            <div className="bg-blue-800/80 py-1 px-3 rounded-full text-xs text-blue-100 flex items-center gap-1 shadow-md">
                                <Copy className="h-3 w-3" />
                                {t("copyCode")}
                            </div>
                        </div>}
                    </div>
                </div>

                {/* QR 码组件 */}
                <QRCodeDisplay shareableLink={shareableLink} />
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-blue-400/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-blue-900/30 px-2 text-blue-300">{t("or")}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-blue-200">
                    <span>{t("shareableLink")}</span>
                    <Button variant="ghost" size="sm" className="gap-2 text-blue-300 hover:bg-blue-800/30 hover:text-blue-100" onClick={copyShareableLink} disabled={!roomId}>
                        <LinkIcon className="h-4 w-4" />
                        {t("copyLink")}
                    </Button>
                </div>
                <div className="relative group">
                    <code className="block w-full p-3 bg-blue-900/30 backdrop-blur-sm border border-blue-400/20 rounded-lg text-sm font-mono text-blue-100 truncate transition-all group-hover:border-blue-400/40">
                        {roomId 
                            ? generateShareableLink()
                            : t("generatingLink")
                        }
                    </code>
                    {roomId && <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity cursor-pointer" onClick={copyShareableLink}>
                        <div className="bg-blue-800/80 py-1 px-3 rounded-full text-xs text-blue-100 flex items-center gap-1 shadow-md">
                            <LinkIcon className="h-3 w-3" />
                            {t("copyLink")}
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
} 