'use client';

import { useUser } from '@/app/contexts/UserContext';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { User, Copy, Key, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function DIDInfo() {
  const { user } = useUser();

  if (!user.did) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="DID情報" showBackButton />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-gray-600">DID情報が見つかりません</p>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をコピーしました`);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="DID情報" showBackButton />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* プロフィールヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">田中太郎</h1>
                <p className="text-blue-100">DIDウォレットユーザー</p>
              </div>
            </div>
          </div>

          {/* DID識別子 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  DID識別子
                </h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                  {user.did.id}
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(user.did!.id, 'DID識別子')}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                DIDをコピー
              </Button>
            </div>
          </div>

          {/* コントローラー情報 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  コントローラー
                </h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                  {user.did.controller}
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(user.did!.controller, 'コントローラー')}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                コントローラーをコピー
              </Button>
            </div>
          </div>

          {/* 公開鍵 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  公開鍵
                </h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-mono text-gray-700 break-all leading-relaxed">
                  {user.did.publicKey}
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(user.did!.publicKey, '公開鍵')}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                公開鍵をコピー
              </Button>
            </div>
          </div>

          {/* 作成日時 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  作成日時
                </h2>
              </div>
              
              <p className="text-gray-700">
                {formatDate(user.did.created)}
              </p>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-2">
                  セキュリティについて
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  DIDと秘密鍵は非常に重要な情報です。他人と共有せず、安全な場所に保管してください。これらの情報を紛失すると、証明書にアクセスできなくなる可能性があります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}