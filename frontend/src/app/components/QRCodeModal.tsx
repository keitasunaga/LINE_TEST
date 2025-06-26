'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  qrData: string;
}

export function QRCodeModal({ isOpen, onClose, title, qrData }: QRCodeModalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5分 = 300秒
  const [isExpired, setIsExpired] = useState(false);

  // モーダルが開かれた時にタイマーをリセット
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setIsExpired(false);
    }
  }, [isOpen]);

  // カウントダウンタイマー
  useEffect(() => {
    if (!isOpen || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          toast.error('QRコードの有効期限が切れました');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isExpired]);

  // 時間をフォーマット（mm:ss）
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 60) return 'text-green-600 bg-green-50 border-green-200';
    if (timeLeft > 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleRefresh = () => {
    setTimeLeft(300);
    setIsExpired(false);
    toast.success('QRコードを更新しました');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl">
        <DialogHeader className="text-center relative">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
          </DialogTitle>
          {/* カスタム閉じるボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">閉じる</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* タイマー表示 */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getTimerColor()}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg font-semibold">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-medium">残り</span>
          </div>

          {/* QRコードプレースホルダー */}
          <div className={`w-56 h-56 bg-white border-2 rounded-xl shadow-inner flex flex-col items-center justify-center p-4 relative ${isExpired ? 'border-red-300 opacity-50' : 'border-gray-300'
            }`}>
            {isExpired && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">期限切れ</p>
                </div>
              </div>
            )}
            <div className="w-44 h-44 flex items-center justify-center">
              <img
                src="/qr_code.png"
                alt="QRコード"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center w-full">
            <p className="text-sm text-gray-700 mb-4 font-medium">
              {isExpired ? 'QRコードの有効期限が切れました' : 'QRコードをスキャンして証明書を確認'}
            </p>
          </div>

          {/* 更新ボタン */}
          <div className="w-full">
            <Button
              onClick={handleRefresh}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              QRコードを更新
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}