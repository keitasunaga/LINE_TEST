'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Plus, Loader2, Info, User, Calendar, ArrowRight, CheckCircle, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type OnboardingStep = 'initial' | 'profile-input' | 'creating' | 'completed';

interface ProfileData {
  fullName: string;
  dateOfBirth: string;
}

export default function Home() {
  const { user, createDID, isCreatingDID, updateUser, initializeLIFF, liffInfo } = useUser();
  const router = useRouter();
  const [createdDID, setCreatedDID] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('initial');
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    dateOfBirth: ''
  });

  // アプリ起動時にLIFFを初期化（エントリーポイントで実行）
  useEffect(() => {
    console.log('トップページでLIFF初期化開始');
    initializeLIFF();
  }, [initializeLIFF]);

  const startOnboarding = () => {
    setCurrentStep('profile-input');
  };

  const handleProfileSubmit = async () => {
    if (!profileData.fullName.trim() || !profileData.dateOfBirth) {
      toast.error('氏名と生年月日を入力してください');
      return;
    }

    setCurrentStep('creating');

    try {
      const newDID = await createDID();
      // プロフィール情報をDIDと一緒に保存
      // TODO: 実際のアプリでは、DID作成時にプロフィール情報も一緒に保存
      setCreatedDID(newDID);
      setCurrentStep('completed');
    } catch (error) {
      console.error('DID作成エラー:', error);
      toast.error('DID作成に失敗しました');
      setCurrentStep('profile-input');
    }
  };

  const goToDashboard = () => {
    // オンボーディング完了フラグを設定してからダッシュボードに遷移
    updateUser({ hasCompletedOnboarding: true });
    router.push('/dashboard');
  };

  if (currentStep === 'completed' && createdDID) {
    // DID作成完了画面
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header title="DID作成完了" />

        <div className="pt-20 px-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                DIDの作成が完了しました！
              </h1>
              <p className="text-gray-600 leading-relaxed">
                あなた専用のデジタルアイデンティティが正常に作成されました。これで証明書を安全に管理できます。
              </p>
            </div>

            {/* LINEアカウントとの紐付け表示 */}
            {liffInfo?.profile && (
              <Card className="mb-6 border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2 text-green-700 mb-3">
                    <Link2 className="w-5 h-5" />
                    <span className="font-semibold">LINEアカウントと連携完了</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {liffInfo.profile.pictureUrl && (
                      <img
                        src={liffInfo.profile.pictureUrl}
                        alt="プロフィール画像"
                        className="w-12 h-12 rounded-full border-2 border-green-200"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{liffInfo.profile.displayName}</p>
                      <p className="text-sm text-gray-600">{profileData.fullName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 作成されたDID情報 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                作成されたDID
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">DID識別子</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                      {createdDID.id}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">作成日時</p>
                  <p className="text-sm text-gray-700">
                    {new Date(createdDID.created).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* 次のステップ */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                次にできること
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>証明書を発行者から受け取る</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>既存の証明書をウォレットで管理</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>QRコードで証明書を共有</p>
                </div>
              </div>
            </div>

            <Button
              onClick={goToDashboard}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl"
            >
              マイウォレットを開く
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'creating' || isCreatingDID) {
    // DID作成中のローディング画面
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header title="DID作成中" />

        <div className="pt-20 px-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                DIDを作成しています
              </h1>
              <p className="text-gray-600 leading-relaxed mb-8">
                あなた専用のデジタルアイデンティティを安全に生成中です。しばらくお待ちください。
              </p>

              {/* プログレスインジケーター */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700">暗号鍵ペアを生成中...</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    </div>
                    <span className="text-sm text-gray-700">DID識別子を作成中...</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-400">DIDドキュメントを保存中...</span>
                  </div>
                </div>
              </div>

              {/* セキュリティ情報 */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2">
                      セキュリティについて
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      DIDの作成には高度な暗号化技術を使用しています。作成されたDIDはあなただけが制御でき、第三者が偽造することはできません。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'profile-input') {
    // 基本情報入力画面
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header title="基本情報の登録" />

        <div className="pt-20 px-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                基本情報を登録
              </h1>
              <p className="text-gray-600 leading-relaxed">
                証明書発行時に使用する基本情報を登録してください。一度登録すると、今後の証明書申請で自動入力されます。
              </p>
            </div>

            {/* LINEアカウント情報 */}
            {liffInfo?.profile && (
              <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2 text-blue-700 mb-4">
                    <Link2 className="w-5 h-5" />
                    <span className="font-semibold">LINEアカウントと連携</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {liffInfo.profile.pictureUrl ? (
                      <img
                        src={liffInfo.profile.pictureUrl}
                        alt="プロフィール画像"
                        className="w-16 h-16 rounded-full border-2 border-blue-200 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-bold text-gray-900">{liffInfo.profile.displayName}</p>
                      <p className="text-sm text-blue-600">LINEアカウント</p>
                      <p className="text-xs text-gray-500 mt-1">
                        このDIDはLINEアカウントと紐づけられます
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 基本情報入力フォーム */}
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>個人情報</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 mb-2 block">
                    氏名（必須）
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="例: 田中太郎"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="h-12 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    証明書に記載される氏名を正確に入力してください
                  </p>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700 mb-2 block">
                    生年月日（必須）
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="h-12 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    発行機関での本人確認に使用されます
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* プライバシー情報 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">
                    プライバシーについて
                  </h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    入力された情報は暗号化されてあなたのDIDと紐づけて保存されます。この情報は証明書発行時の本人確認のみに使用され、第三者と共有されることはありません。
                  </p>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              <Button
                onClick={handleProfileSubmit}
                disabled={!profileData.fullName.trim() || !profileData.dateOfBirth}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                DIDを作成する
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => setCurrentStep('initial')}
                variant="outline"
                className="w-full h-12 text-base font-medium border-gray-300 rounded-xl"
              >
                戻る
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DID作成画面（初期画面）
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header title="DID ウォレット" />

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              DID ウォレットへようこそ
            </h1>
            <p className="text-gray-600 leading-relaxed">
              デジタル証明書を安全に管理するために、まずはあなた専用のDIDを発行しましょう。
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  DIDとは？
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Decentralized Identifierの略で、あなただけのデジタルアイデンティティです。このIDを使って様々な証明書を安全に管理できます。
                </p>
              </div>
            </div>
          </div>

          {/* LIFF情報ページへのリンク */}
          <div className="mb-6">
            <Button
              onClick={() => router.push('/liff-info')}
              variant="outline"
              size="sm"
              className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <Info className="w-4 h-4 mr-2" />
              LIFF・デバイス情報を確認
            </Button>
          </div>

          <Button
            onClick={startOnboarding}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            DIDを新しく発行する
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            発行には数秒かかる場合があります
          </p>
        </div>
      </div>
    </div>
  );
}