"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';
import React from 'react';

interface AdDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageUrl?: string;
  ctaUrl?: string;
  ctaText?: string;
}

export function AdDetailDialog({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  ctaUrl = "#",
  ctaText = "访问官网"
}: AdDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-blue-900 border-blue-300/20 text-white max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-sm text-xs font-bold">广告</span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            详细了解我们的赞助商提供的产品和服务
          </DialogDescription>
        </DialogHeader>
        
        {imageUrl && (
          <div className="my-4 overflow-hidden rounded-md">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="text-blue-100 my-2 space-y-4">
          {description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-blue-400/30 text-blue-100 hover:bg-blue-800/30"
          >
            关闭
          </Button>
          
          <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white">
              {ctaText} <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 