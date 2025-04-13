"use client";

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface QRCodeDisplayProps {
    shareableLink: string;
}

export function QRCodeDisplay({ shareableLink }: QRCodeDisplayProps) {
    const [qrSize, setQrSize] = useState(180);
    const t = useTranslations("host");
    const params = useParams();
    const locale = params.locale as string;

    const downloadQRCode = () => {
        if (!shareableLink) return;
        
        const svg = document.getElementById('share-qrcode');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            
            img.onload = () => {
                canvas.width = qrSize;
                canvas.height = qrSize;
                ctx?.drawImage(img, 0, 0);
                const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                const downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = "screencast-qrcode.png";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        }
    };

    // 根据本地化选择文本
    const loadingText = locale === 'zh' ? '生成中' : 'Generating';
    const scanToJoinText = locale === 'zh' ? '扫描二维码加入此会话' : 'Scan QR code to join this session';
    const downloadQRText = locale === 'zh' ? '下载二维码' : 'Download QR Code';

    return (
        <div className="p-4 bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-400/20 flex flex-col items-center">
            <div className="p-3 bg-white rounded-lg shadow-inner mb-3">
                {shareableLink ? (
                    <QRCodeSVG
                        id="share-qrcode"
                        value={shareableLink}
                        size={qrSize}
                        level="H"
                    />
                ) : (
                    <div 
                        className="h-[180px] w-[180px] bg-gray-200 animate-pulse flex items-center justify-center text-gray-400"
                    >
                        {loadingText}...
                    </div>
                )}
            </div>
            <div className="text-sm text-blue-200 mb-3 text-center">
                {scanToJoinText}
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-blue-300 hover:bg-blue-800/30 hover:text-blue-100 w-full" 
                onClick={downloadQRCode}
                disabled={!shareableLink}
            >
                <Download className="h-4 w-4" />
                {downloadQRText}
            </Button>
        </div>
    );
} 