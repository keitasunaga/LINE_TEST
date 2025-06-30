'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { Header } from '@/app/components/Header';
import { VCCard } from '@/app/components/VCCard';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from '@/app/components/QRCodeModal';
import { VerifiableCredential } from '@/app/types';
import { Plus, User, QrCode, Shield, Scan, FileEdit, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedVCForQR, setSelectedVCForQR] = useState<VerifiableCredential | null>(null);

  useEffect(() => {
    if (!user.hasCompletedOnboarding) {
      router.push('/');
    }
  }, [user.hasCompletedOnboarding, router]);

  const handleVCClick = (credential: VerifiableCredential) => {
    router.push(`/credential/${credential.id}`);
  };

  const showQRCode = (credential: VerifiableCredential) => {
    setSelectedVCForQR(credential);
  };

  if (!user.hasCompletedOnboarding) {
    return null;
  }

  const activeCredentials = user.credentials.filter(c => c.status === 'active');
  const expiredCredentials = user.credentials.filter(c => c.status !== 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="マイウォレット" />

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* ユーザー情報カード */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">田中太郎</h2>
                <p className="text-blue-100 text-sm">
                  {activeCredentials.length}個の証明書を保有
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/did-info')}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/request-vc')}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* アクティブな証明書 */}
          {activeCredentials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                有効な証明書
              </h3>
              <div className="space-y-4">
                {activeCredentials.map((credential) => (
                  <VCCard
                    key={credential.id}
                    credential={credential}
                    onClick={handleVCClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 期限切れ・無効な証明書 */}
          {expiredCredentials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                期限切れ・無効な証明書
              </h3>
              <div className="space-y-4">
                {expiredCredentials.map((credential) => (
                  <VCCard
                    key={credential.id}
                    credential={credential}
                    onClick={handleVCClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 証明書がない場合 */}
          {user.credentials.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                証明書がありません
              </h3>
              <p className="text-gray-600 mb-6">
                新しい証明書を発行するか、他の発行者からの証明書を受け取ってください。
              </p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-4">
            {/* メインアクション */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => router.push('/request-vc')}
                className="h-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl flex-col space-y-1 text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>発行依頼</span>
              </Button>

              <Button
                onClick={() => router.push('/issue')}
                className="h-16 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl flex-col space-y-1 text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <div className="relative">
                    <FileEdit className="w-5 h-5" />
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
                  </div>
                  <span>証明書発行</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push('/verify')}
                className="h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl flex-col space-y-1 text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Shield className="w-5 h-5" />
                <span>証明書検証</span>
              </Button>
            </div>

            {/* 検証機能の詳細説明 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scan className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    証明書検証機能
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    QRコードをスキャンして他者の証明書の真正性を即座に確認。
                    <br />
                    ブロックチェーン技術により改ざんを検知します。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QRコードモーダル */}
      {selectedVCForQR && (
        <QRCodeModal
          isOpen={!!selectedVCForQR}
          onClose={() => setSelectedVCForQR(null)}
          title={`${selectedVCForQR.name}のQRコード`}
          qrData={selectedVCForQR.qrCode || selectedVCForQR.id}
        />
      )}
    </div>
  );
}