'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Gift,
  Handshake,
  Heart,
  Users,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  UserPlus,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  User
} from 'lucide-react';

interface VCTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
}

interface ReceivedVC {
  id: string;
  template: VCTemplate;
  data: Record<string, string>;
  issuer: {
    name: string;
    did: string;
    avatar: string;
  };
  issuedAt: string;
  expiresAt?: string;
}

function ReceivePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: コード入力, 2: DID作成, 3: VC表示, 4: 受取確認
  const [inviteCode, setInviteCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [receivedVC, setReceivedVC] = useState<ReceivedVC | null>(null);
  const [hasExistingDID, setHasExistingDID] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [userName, setUserName] = useState('');

  // VCテンプレート定義（issue/page.tsxと同期）
  const vcTemplates: Record<string, VCTemplate> = {
    promise: {
      id: 'promise',
      name: 'お約束証明書',
      icon: Handshake,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-indigo-600',
      description: '友達との約束事を記録'
    },
    thanks: {
      id: 'thanks',
      name: 'ありがとう証明書',
      icon: Heart,
      color: 'text-pink-600',
      gradient: 'from-pink-500 to-rose-600',
      description: '感謝の気持ちを形に'
    },
    lending: {
      id: 'lending',
      name: '貸し借り証明書',
      icon: Gift,
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-600',
      description: '物の貸し借りを記録'
    },
    participation: {
      id: 'participation',
      name: '参加証明書',
      icon: Users,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-violet-600',
      description: '一緒に参加した記念'
    },
    experience: {
      id: 'experience',
      name: '体験証明書',
      icon: Star,
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-orange-600',
      description: '一緒に体験したこと'
    },
    skill: {
      id: 'skill',
      name: 'スキル証明書',
      icon: Award,
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-blue-600',
      description: '友達のスキルを証明'
    }
  };

  // URL パラメータから招待コードを取得
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInviteCode(code);
      validateInviteCode(code);
    }

    // 既存DIDの確認（モック）
    const existingDID = localStorage.getItem('userDID');
    setHasExistingDID(!!existingDID);

    if (existingDID) {
      const savedUserName = localStorage.getItem('userName') || 'あなた';
      setUserName(savedUserName);
    }
  }, [searchParams]);

  // 招待コード検証（モック）
  const validateInviteCode = async (code: string) => {
    setIsValidating(true);

    try {
      // 模擬API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500));

      // コードの有効性をチェック（簡単な例）
      if (code.length !== 6) {
        throw new Error('無効な招待コードです');
      }

      // 模擬VC データ生成
      const templateId = ['promise', 'thanks', 'lending', 'participation', 'experience', 'skill'][Math.floor(Math.random() * 6)];
      const template = vcTemplates[templateId];

      const mockVC: ReceivedVC = {
        id: `vc-${Date.now()}`,
        template,
        data: {
          '約束の内容': '今度ランチを奢るよ！',
          '期限': '2024年12月31日',
          '場所': '新宿のカフェ'
        },
        issuer: {
          name: '田中花子',
          did: 'did:example:123456789',
          avatar: '👩'
        },
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30日後
      };

      setReceivedVC(mockVC);

      if (hasExistingDID) {
        setStep(3); // 既存ユーザー: VC表示へ
      } else {
        setStep(2); // 新規ユーザー: DID作成へ
      }

      toast.success('証明書を見つけました！');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : '招待コードが無効です');
    } finally {
      setIsValidating(false);
    }
  };

  // DID作成（モック）
  const createDID = async () => {
    if (!userName.trim()) {
      toast.error('名前を入力してください');
      return;
    }

    try {
      // 模擬DID作成
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDID = `did:example:${Date.now()}`;
      localStorage.setItem('userDID', newDID);
      localStorage.setItem('userName', userName);

      setHasExistingDID(true);
      setStep(3);

      toast.success('DIDを作成しました！');

    } catch (error) {
      toast.error('DID作成に失敗しました');
    }
  };

  // VC受け取り確認
  const acceptVC = async () => {
    setIsAccepting(true);

    try {
      // 模擬VC受け取り処理
      await new Promise(resolve => setTimeout(resolve, 1500));

      // ローカルストレージに保存
      const existingVCs = JSON.parse(localStorage.getItem('receivedVCs') || '[]');
      existingVCs.push(receivedVC);
      localStorage.setItem('receivedVCs', JSON.stringify(existingVCs));

      setStep(4);
      toast.success('証明書を受け取りました！');

    } catch (error) {
      toast.error('受け取りに失敗しました');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleManualCodeInput = () => {
    if (!inviteCode.trim()) {
      toast.error('招待コードを入力してください');
      return;
    }
    validateInviteCode(inviteCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header title="証明書を受け取る" />

      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-md mx-auto">

          {/* Step 1: 招待コード入力 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  証明書を受け取る
                </h1>
                <p className="text-gray-600">
                  招待コードを入力してください
                </p>
              </div>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="inviteCode" className="text-base font-medium">
                      招待コード（6桁）
                    </Label>
                    <Input
                      id="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="例: ABC123"
                      className="mt-2 h-14 text-center text-2xl font-bold tracking-wider"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={handleManualCodeInput}
                    disabled={isValidating || inviteCode.length !== 6}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-base font-medium"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        確認中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        証明書を受け取る
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: DID作成（新規ユーザー向け） */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  初回セットアップ
                </h1>
                <p className="text-gray-600">
                  証明書を受け取るために、あなたの情報を設定してください
                </p>
              </div>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="userName" className="text-base font-medium">
                      あなたのお名前
                    </Label>
                    <Input
                      id="userName"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="例: 山田太郎"
                      className="mt-2 h-12"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">DIDについて</p>
                        <p>
                          DID（分散型識別子）を作成して、安全に証明書を管理できるようになります。
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={createDID}
                    disabled={!userName.trim()}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-base font-medium"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    セットアップを完了
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: VC内容表示 */}
          {step === 3 && receivedVC && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${receivedVC.template.gradient} rounded-full flex items-center justify-center`}>
                  <receivedVC.template.icon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {receivedVC.template.name}
                </h1>
                <p className="text-gray-600">
                  {receivedVC.issuer.name}さんからの証明書
                </p>
              </div>

              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{receivedVC.issuer.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{receivedVC.issuer.name}</CardTitle>
                      <CardDescription className="text-sm">
                        発行者 • {new Date(receivedVC.issuedAt).toLocaleDateString('ja-JP')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(receivedVC.data).map(([field, value], index) => (
                    <div key={field} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {index === 0 && <Sparkles className="w-4 h-4 text-gray-500" />}
                        {index === 1 && <Calendar className="w-4 h-4 text-gray-500" />}
                        {index === 2 && <MapPin className="w-4 h-4 text-gray-500" />}
                        <Label className="text-sm font-medium text-gray-600">{field}</Label>
                      </div>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                        {value}
                      </p>
                    </div>
                  ))}

                  {receivedVC.expiresAt && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          有効期限: {new Date(receivedVC.expiresAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 h-12 rounded-xl"
                >
                  後で受け取る
                </Button>
                <Button
                  onClick={acceptVC}
                  disabled={isAccepting}
                  className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${receivedVC.template.gradient} hover:opacity-90`}
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      受取中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      受け取る
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: 受取完了 */}
          {step === 4 && receivedVC && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  受け取り完了！
                </h1>
                <p className="text-gray-600">
                  証明書をウォレットに保存しました
                </p>
              </div>

              <Card className="border-0 shadow-xl bg-green-50">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-12 h-12 mx-auto bg-gradient-to-r ${receivedVC.template.gradient} rounded-full flex items-center justify-center`}>
                    <receivedVC.template.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {receivedVC.template.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {receivedVC.issuer.name}さんより
                    </p>
                  </div>

                  <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    ウォレットに保存済み
                  </Badge>
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 h-12 rounded-xl"
                >
                  ホームに戻る
                </Button>
                <Button
                  onClick={() => router.push('/credential/' + receivedVC.id)}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  詳細を見る
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReceivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <ReceivePageContent />
    </Suspense>
  );
}