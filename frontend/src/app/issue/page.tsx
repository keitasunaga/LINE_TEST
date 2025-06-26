'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  FileEdit,
  Users,
  QrCode,
  Send,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Gift,
  Handshake,
  Heart,
  Star,
  Award,
  Zap,
  CheckCircle,
  Copy,
  Plus,
  ExternalLink,
  Share,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import * as QRCodeLib from 'qrcode';

interface VCTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
  fields: string[];
  example: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  lastExchange: string;
  exchangeCount: number;
}

export default function IssuePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<VCTemplate | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'new' | 'existing'>('new');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [vcData, setVcData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteUrl, setInviteUrl] = useState<string>('');

  // VC テンプレート定義
  const vcTemplates: VCTemplate[] = [
    {
      id: 'promise',
      name: 'お約束証明書',
      icon: Handshake,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-indigo-600',
      description: '友達との約束事を記録',
      fields: ['約束の内容', '期限', '場所'],
      example: '今度ランチを奢るよ'
    },
    {
      id: 'thanks',
      name: 'ありがとう証明書',
      icon: Heart,
      color: 'text-pink-600',
      gradient: 'from-pink-500 to-rose-600',
      description: '感謝の気持ちを形に',
      fields: ['感謝の理由', '日付'],
      example: 'プレゼントをもらって嬉しかった'
    },
    {
      id: 'lending',
      name: '貸し借り証明書',
      icon: Gift,
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-600',
      description: '物の貸し借りを記録',
      fields: ['貸した物', 'いつまで', '返却条件'],
      example: '本「○○」を貸しました'
    },
    {
      id: 'participation',
      name: '参加証明書',
      icon: Users,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-violet-600',
      description: '一緒に参加した記念',
      fields: ['イベント名', '日時', '場所'],
      example: '映画館で一緒に観た'
    },
    {
      id: 'experience',
      name: '体験証明書',
      icon: Star,
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-orange-600',
      description: '一緒に体験したこと',
      fields: ['体験内容', '日時', '感想'],
      example: '手料理を作ってもらった'
    },
    {
      id: 'skill',
      name: 'スキル証明書',
      icon: Award,
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-blue-600',
      description: '友達のスキルを証明',
      fields: ['スキル名', 'レベル', '証明理由'],
      example: '料理がとても上手'
    }
  ];

  // 模擬友達データ
  const friends: Friend[] = [
    {
      id: '1',
      name: '田中花子',
      avatar: '👩',
      lastExchange: '1週間前',
      exchangeCount: 3
    },
    {
      id: '2',
      name: '佐藤次郎',
      avatar: '👨',
      lastExchange: '3日前',
      exchangeCount: 1
    },
    {
      id: '3',
      name: '鈴木美咲',
      avatar: '👱‍♀️',
      lastExchange: '昨日',
      exchangeCount: 5
    }
  ];

  const handleTemplateSelect = (template: VCTemplate) => {
    setSelectedTemplate(template);
    setStep(2);
    // フィールドを初期化
    const initialData: Record<string, string> = {};
    template.fields.forEach(field => {
      initialData[field] = '';
    });
    setVcData(initialData);
  };

  const handleFieldChange = (field: string, value: string) => {
    setVcData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryMethodSelect = (method: 'new' | 'existing') => {
    setDeliveryMethod(method);
    if (method === 'new') {
      setStep(4); // QRコード生成へ
    } else {
      setStep(3); // 友達選択へ
    }
  };

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
    setStep(4);
  };

  const generateVC = async () => {
    setIsGenerating(true);

    try {
      // 模擬的なVC生成処理
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 招待コード生成（6桁の英数字）
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(code);

      // LIFF URLを使った招待URL生成（実際のLIFF IDに置き換える）
      const liffId = '2007636688-35wNXQZa'; // 実際のLIFF IDに置き換え
      const baseUrl = `https://liff.line.me/${liffId}/receive`;
      const fullInviteUrl = `${baseUrl}?code=${code}`;
      setInviteUrl(fullInviteUrl);

      // QRコード生成
      try {
        const qrDataUrl = await QRCodeLib.toDataURL(fullInviteUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff',
          },
        });
        setGeneratedQRCode(qrDataUrl);
      } catch (qrError) {
        console.error('QRコード生成エラー:', qrError);
        setGeneratedQRCode('');
      }

      toast.success('証明書を発行しました！');
      setStep(5);
    } catch (error) {
      console.error('VC generation error:', error);
      toast.error('発行処理でエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('招待コードをコピーしました');
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('招待URLをコピーしました');
  };

  const shareViaLine = async () => {
    const message = `🎉 ${selectedTemplate?.name}を発行しました！\n\n📋 招待コード: ${inviteCode}\n🔗 受け取りURL: ${inviteUrl}\n\n上のリンクをタップして証明書を受け取ってください✨`;

    try {
      if (typeof window !== 'undefined' && window.liff && window.liff.isInClient()) {
        // LIFF内での共有（模擬実装）
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('LINEで共有しました');
      } else {
        // LIFF外部の場合は通常の共有
        if (navigator.share) {
          await navigator.share({
            title: `${selectedTemplate?.name}を受け取ってください`,
            text: message,
            url: inviteUrl
          });
          toast.success('共有しました');
        } else {
          navigator.clipboard.writeText(message);
          toast.success('メッセージをコピーしました');
        }
      }
    } catch (error) {
      navigator.clipboard.writeText(message);
      toast.success('メッセージをコピーしました');
    }
  };

  const openInBrowser = () => {
    window.open(inviteUrl, '_blank');
  };

  const resetAndCreateNew = () => {
    setStep(1);
    setSelectedTemplate(null);
    setDeliveryMethod('new');
    setSelectedFriend(null);
    setVcData({});
    setGeneratedQRCode('');
    setInviteCode('');
    setInviteUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header title="証明書発行" showBackButton />

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* プログレスインディケーター */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${stepNum <= step
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    {stepNum}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {stepNum === 1 && '種類'}
                    {stepNum === 2 && '内容'}
                    {stepNum === 3 && '相手'}
                    {stepNum === 4 && '配布'}
                    {stepNum === 5 && '完了'}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: 証明書の種類選択 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FileEdit className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  どんな証明書を発行しますか？
                </h1>
                <p className="text-gray-600">
                  友達との思い出や約束を証明書にしてみましょう
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {vcTemplates.map((template, index) => {
                  const IconComponent = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-purple-200 animate-in slide-in-from-bottom duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r ${template.gradient} rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {template.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {template.example}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: 証明書の内容入力 */}
          {step === 2 && selectedTemplate && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${selectedTemplate.gradient} rounded-full flex items-center justify-center`}>
                  <selectedTemplate.icon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedTemplate.name}の内容を入力
                </h1>
                <p className="text-gray-600">
                  {selectedTemplate.description}
                </p>
              </div>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  {selectedTemplate.fields.map((field, index) => (
                    <div key={field} className={`animate-in slide-in-from-right duration-500`} style={{ animationDelay: `${index * 100}ms` }}>
                      <Label htmlFor={field} className="text-sm font-medium text-gray-700">
                        {field}
                      </Label>
                      {field.includes('内容') || field.includes('理由') || field.includes('感想') ? (
                        <Textarea
                          id={field}
                          placeholder={`${field}を入力してください`}
                          value={vcData[field] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="mt-1 min-h-[80px]"
                        />
                      ) : (
                        <Input
                          id={field}
                          placeholder={`${field}を入力してください`}
                          value={vcData[field] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={() => setStep(2.5)}
                  disabled={selectedTemplate.fields.some(field => !vcData[field]?.trim())}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                >
                  次へ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2.5: 配布方法選択 */}
          {step === 2.5 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  誰に送りますか？
                </h1>
                <p className="text-gray-600">
                  証明書の配布方法を選択してください
                </p>
              </div>

              <div className="space-y-4">
                <Card
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-blue-200"
                  onClick={() => handleDeliveryMethodSelect('new')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          新しい友達に送る
                        </h3>
                        <p className="text-sm text-gray-600">
                          QRコードや招待コードで共有
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-green-200"
                  onClick={() => handleDeliveryMethodSelect('existing')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          友達に直接送る
                        </h3>
                        <p className="text-sm text-gray-600">
                          交換済みの友達から選択
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {friends.length}人の友達
                        </Badge>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                戻る
              </Button>
            </div>
          )}

          {/* Step 3: 友達選択 */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  友達を選択
                </h1>
                <p className="text-gray-600">
                  証明書を送る友達を選んでください
                </p>
              </div>

              <div className="space-y-3">
                {friends.map((friend, index) => (
                  <Card
                    key={friend.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-green-200 animate-in slide-in-from-left duration-500 ${selectedFriend?.id === friend.id ? 'border-green-500 bg-green-50' : ''
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleFriendSelect(friend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-lg">
                          {friend.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {friend.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            最後の交換: {friend.lastExchange}
                          </p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {friend.exchangeCount}回交換済み
                          </Badge>
                        </div>
                        {selectedFriend?.id === friend.id && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2.5)}
                  className="flex-1 h-12 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!selectedFriend}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl"
                >
                  次へ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: 証明書生成 */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  証明書を発行しますか？
                </h1>
                <p className="text-gray-600">
                  内容を確認して発行してください
                </p>
              </div>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${selectedTemplate?.gradient} rounded-lg flex items-center justify-center`}>
                      {selectedTemplate && <selectedTemplate.icon className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedTemplate?.name}</CardTitle>
                      <CardDescription>
                        {deliveryMethod === 'existing' ? `→ ${selectedFriend?.name}` : '→ 新しい友達'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(vcData).map(([field, value]) => (
                    <div key={field}>
                      <Label className="text-sm font-medium text-gray-600">{field}</Label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded mt-1">
                        {value || '未入力'}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(deliveryMethod === 'existing' ? 3 : 2.5)}
                  className="flex-1 h-12 rounded-xl"
                  disabled={isGenerating}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={generateVC}
                  disabled={isGenerating}
                  className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      発行中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      発行する
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: 発行完了 */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 発行完了！
                </h1>
                <p className="text-gray-600">
                  {selectedTemplate?.name}を発行しました
                </p>
              </div>

              {deliveryMethod === 'new' && (
                <div className="space-y-4">
                  {/* リアルQRコード表示 */}
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <QrCode className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">QRコードで共有</h3>
                      </div>

                      <div className="relative">
                        {generatedQRCode ? (
                          <div className="w-48 h-48 mx-auto mb-4 p-4 bg-white rounded-xl shadow-inner border">
                            <img
                              src={generatedQRCode}
                              alt="招待QRコード"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-400" />
                          </div>
                        )}

                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          LIVE
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        📱 スマホのカメラでスキャンしてください
                      </p>

                      <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="w-full"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        QRコードを印刷
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 招待コード */}
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">招待コード</h3>
                      </div>

                      <div className="bg-white border-2 border-dashed border-purple-300 rounded-xl p-6 mb-4 shadow-inner">
                        <div className="text-4xl font-bold text-purple-900 tracking-widest mb-2">
                          {inviteCode}
                        </div>
                        <p className="text-xs text-purple-600 font-medium">
                          6桁の招待コード
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button
                          variant="outline"
                          onClick={copyInviteCode}
                          className="h-10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          コピー
                        </Button>
                        <Button
                          onClick={shareViaLine}
                          className="h-10 bg-green-500 hover:bg-green-600"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          LINE共有
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 招待URL */}
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <ExternalLink className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">招待URL</h3>
                      </div>

                      <div className="bg-white border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500 font-mono">LIFF URL</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 break-all">
                          {inviteUrl}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={copyInviteUrl}
                          className="h-10 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          URL
                        </Button>
                        <Button
                          variant="outline"
                          onClick={openInBrowser}
                          className="h-10 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          プレビュー
                        </Button>
                        <Button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: '証明書を受け取ってください',
                                url: inviteUrl
                              });
                            }
                          }}
                          className="h-10 text-xs bg-blue-500 hover:bg-blue-600"
                        >
                          <Share className="w-3 h-3 mr-1" />
                          共有
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 使用方法 */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Smartphone className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800 mb-1">📋 使用方法</p>
                          <ul className="text-yellow-700 space-y-1 text-xs">
                            <li>• QRコードをスキャン、または</li>
                            <li>• 招待コードを入力、または</li>
                            <li>• 招待URLを直接シェア</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {deliveryMethod === 'existing' && (
                <Card className="border-0 shadow-xl bg-green-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {selectedFriend?.name}さんに送信しました
                    </h3>
                    <p className="text-sm text-gray-600">
                      相手が受け取ると通知されます
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 h-12 rounded-xl"
                >
                  ホームに戻る
                </Button>
                <Button
                  onClick={resetAndCreateNew}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  もう一つ発行
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

