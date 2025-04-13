"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Info, Monitor, Users } from "lucide-react";
import { ReactNode, useState } from "react";

import { AdDetailDialog } from "@/components/AdDetailDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PixiBackground } from "@/components/PixiBackground";
import { useTranslations } from "next-intl";

export default function Home() {
    const t = useTranslations("home");
    const [isTopAdOpen, setIsTopAdOpen] = useState(false);
    const [isSideAdOpen, setIsSideAdOpen] = useState(false);
    const [isBottomAdOpen, setIsBottomAdOpen] = useState(false);
    
    return (
        <div className="relative min-h-screen">
            <PixiBackground />
            
            {/* 顶部横幅广告位 */}
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-md border-b border-white/10 py-2">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <button 
                        onClick={() => setIsTopAdOpen(true)}
                        className="text-sm text-blue-100 hover:text-white transition-colors cursor-pointer flex items-center group"
                    >
                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded-sm mr-2 text-xs font-bold">广告</span>
                        {t("adBanner")}
                    </button>
                    <button 
                        onClick={() => setIsTopAdOpen(true)}
                        className="text-blue-300 hover:text-white text-sm flex items-center group"
                    >
                        {t("learnMore")} 
                        <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
            
            <main className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* 主内容区域 */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* 左侧内容 */}
                        <div className="col-span-12 lg:col-span-8 space-y-12">
                            <div className="space-y-6">
                                <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl drop-shadow-md">
                                    {t("title")}
                                </h1>
                                <p className="text-xl text-blue-100 max-w-3xl">
                                    {t("description")}
                                </p>
                                
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link href="/host">
                                        <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30">
                                            {t("createRoom")} <Monitor className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/join">
                                        <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30">
                                            {t("joinRoom")} <Users className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            
                            {/* 功能特点介绍 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-300/20">
                                <h2 className="text-2xl font-bold text-white mb-6">{t("featuresTitle")}</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FeatureCard 
                                        icon={<Monitor className="h-6 w-6 text-blue-400" />} 
                                        title={t("feature1Title")} 
                                        description={t("feature1Desc")} 
                                    />
                                    <FeatureCard 
                                        icon={<Users className="h-6 w-6 text-purple-400" />} 
                                        title={t("feature2Title")} 
                                        description={t("feature2Desc")} 
                                    />
                                    <FeatureCard 
                                        icon={<Info className="h-6 w-6 text-green-400" />} 
                                        title={t("feature3Title")} 
                                        description={t("feature3Desc")} 
                                    />
                                    <FeatureCard 
                                        icon={<Info className="h-6 w-6 text-yellow-400" />} 
                                        title={t("feature4Title")} 
                                        description={t("feature4Desc")} 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* 右侧广告和快速入口 */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* 主要操作卡片 */}
                            <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-300/20 shadow-xl">
                                <h3 className="text-xl font-bold text-white mb-4">{t("quickStart")}</h3>
                                <div className="space-y-4">
                                    <Link href="/host" className="block w-full">
                                        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md justify-between">
                                            {t("createRoom")}
                                            <Monitor className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/join" className="block w-full">
                                        <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md justify-between">
                                            {t("joinRoom")}
                                            <Users className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            
                            {/* 侧边广告位 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 py-2 px-4 flex items-center">
                                    <span className="text-xs font-bold text-white bg-blue-500 rounded-sm px-2 py-0.5 mr-2">广告</span>
                                    <h3 className="text-sm text-white">{t("sponsoredContent")}</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <button 
                                        onClick={() => setIsSideAdOpen(true)}
                                        className="bg-gray-800 rounded-lg h-40 w-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
                                    >
                                        <p className="text-gray-400">{t("adPlaceholder")}</p>
                                    </button>
                                    <p className="text-sm text-blue-100">{t("adDescription")}</p>
                                    <button 
                                        onClick={() => setIsSideAdOpen(true)} 
                                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center group"
                                    >
                                        {t("learnMore")} 
                                        <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* 用户评价 */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-blue-300/20">
                                <h3 className="text-xl font-bold text-white mb-4">{t("testimonials")}</h3>
                                <div className="space-y-4">
                                    <blockquote className="text-sm italic text-blue-100">
                                        "{t("testimonial1")}"
                                        <footer className="text-blue-300 mt-1">— {t("user1")}</footer>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* 底部广告位 */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-md border-t border-white/10 py-4 mt-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setIsBottomAdOpen(true)}
                            className="flex items-center cursor-pointer hover:text-white transition-colors"
                        >
                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-sm mr-2 text-xs font-bold">广告</span>
                            <span className="text-white text-sm">{t("bottomAdText")}</span>
                        </button>
                        <button 
                            onClick={() => setIsBottomAdOpen(true)}
                            className="text-blue-300 hover:text-white text-sm px-4 py-1 border border-blue-500 rounded-full hover:bg-blue-900/30 transition-colors"
                        >
                            {t("learnMore")}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* 广告详情对话框 */}
            <AdDetailDialog 
                isOpen={isTopAdOpen}
                onClose={() => setIsTopAdOpen(false)}
                title="多平台同步屏幕共享服务"
                description={`我们的多平台同步共享服务让您可以轻松地在多个设备上共享您的屏幕，无论是在会议室、课堂还是远程办公场景。\n\n主要特点：\n- 支持Windows、Mac、Linux等多平台\n- 无需安装额外软件，直接在浏览器中运行\n- 高清视频和音频质量\n- 安全加密传输\n\n升级到专业版，解锁更多功能，包括屏幕录制、注释工具和多用户互动功能。`}
                imageUrl="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                ctaText="升级到专业版"
                ctaUrl="#upgrade"
            />
            
            <AdDetailDialog 
                isOpen={isSideAdOpen}
                onClose={() => setIsSideAdOpen(false)}
                title="专业级屏幕共享解决方案"
                description={`为企业和教育机构定制的专业级屏幕共享解决方案，提供更强大的功能和更高的安全性。\n\n我们的专业版包括：\n- 支持超过100人同时观看\n- 高级权限控制\n- 屏幕录制和回放功能\n- 实时注释和白板\n- 定制品牌和界面\n- 24/7技术支持\n\n选择适合您组织需求的方案，提升协作效率。`}
                imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                ctaText="获取定制方案"
                ctaUrl="#enterprise"
            />
            
            <AdDetailDialog 
                isOpen={isBottomAdOpen}
                onClose={() => setIsBottomAdOpen(false)}
                title="升级到专业版，解锁高级功能"
                description={`专业版为您提供更强大的功能，帮助您提升分享体验：\n\n- 无时间限制的屏幕共享\n- 高达4K的视频质量\n- 内置录制和分享功能\n- 高级协作工具\n- 优先技术支持\n- 品牌定制选项\n\n现在升级，享受30天免费试用和满意保证。`}
                imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                ctaText="立即升级"
                ctaUrl="#upgrade"
            />
        </div>
    );
}

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <div className="flex items-center mb-3 gap-2">
                {icon}
                <h3 className="font-bold text-white">{title}</h3>
            </div>
            <p className="text-sm text-blue-100">{description}</p>
        </div>
    );
}