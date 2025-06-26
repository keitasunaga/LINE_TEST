'use client';

import { useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from '@/app/components/QRCodeModal';
import { Building2, Calendar, Shield, QrCode, Copy, Trash2, AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CredentialDetail() {
  const { user, removeCredential } = useUser();
  const params = useParams();
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const credential = user.credentials.find(c => c.id === params.id);

  if (!credential) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="証明書詳細" showBackButton />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              証明書が見つかりません
            </h2>
            <p className="text-gray-600 mb-6">
              指定された証明書は存在しないか、削除された可能性があります。
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              ダッシュボードに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'revoked':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '有効';
      case 'expired':
        return '期限切れ';
      case 'revoked':
        return '無効';
      default:
        return '不明';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const copyCredentialId = async () => {
    try {
      await navigator.clipboard.writeText(credential.id);
      toast.success('証明書IDをコピーしました');
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const handleDelete = () => {
    if (confirm('この証明書を削除してもよろしいですか？この操作は元に戻せません。')) {
      removeCredential(credential.id);
      toast.success('証明書を削除しました');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="証明書詳細" showBackButton />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* メイン証明書カード */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {credential.logoUrl && !imageError ? (
                    <img
                      src={credential.logoUrl}
                      alt={`${credential.issuer}のロゴ`}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                      {credential.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {credential.issuer}
                    </p>
                  </div>
                </div>
                
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(credential.status)}`}>
                  <Shield className="w-3 h-3" />
                  <span>{getStatusText(credential.status)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">発行日</p>
                    <p className="text-base">{formatDate(credential.issuedDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">有効期限</p>
                    <p className="text-base">{formatDate(credential.expiryDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 証明書の詳細情報 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                証明書の詳細
              </h2>
              
              <div className="space-y-4">
                {Object.entries(credential.metadata.credentialSubject).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {key === 'name' ? '氏名' :
                       key === 'degree' ? '学位' :
                       key === 'gpa' ? 'GPA' :
                       key === 'licenseNumber' ? '免許証番号' :
                       key === 'class' ? '免許種別' :
                       key === 'position' ? '役職' :
                       key === 'department' ? '部署' : key}
                    </p>
                    <p className="text-base text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 証明書ID */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                証明書ID
              </h2>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-mono text-gray-700 break-all mr-2">
                  {credential.id}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCredentialId}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowQRModal(true)}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <QrCode className="w-5 h-5 mr-2" />
              QRコードを表示
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full h-12 rounded-xl"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              証明書を削除
            </Button>
          </div>
        </div>
      </div>

      {/* QRコードモーダル */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`${credential.name}のQRコード`}
        qrData={credential.qrCode || credential.id}
      />
    </div>
  );
}