'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QrCode, CheckCircle, XCircle, AlertCircle, Scan, RefreshCw, Shield, Calendar, Building2, User, Award } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationResult {
  isValid: boolean;
  credential?: {
    id: string;
    name: string;
    issuer: string;
    subject: string;
    issuedDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'revoked';
    credentialSubject: Record<string, any>;
    logoUrl?: string;
  };
  error?: string;
}

export default function VerifyPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const initLiff = async () => {
    if (typeof window !== 'undefined' && window.liff) {
      try {
        if (!window.liff.isInClient()) {
          toast.error('この機能はLINEアプリ内でのみ利用できます');
          return false;
        }
        return true;
      } catch (error) {
        console.error('LIFF initialization error:', error);
        return false;
      }
    }
    return false;
  };

  const startQRScan = async () => {
    setIsScanning(true);
    setVerificationResult(null);

    try {
      // LIFF環境チェック
      if (typeof window !== 'undefined' && window.liff && window.liff.isInClient()) {
        // 実際のLIFF環境
        const result = await window.liff.scanCodeV2();
        if (result) {
          await verifyCredential(result.value);
        }
      } else {
        // 開発環境・モック
        toast.info('開発環境のため、模擬QRコードスキャンを実行します');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模擬QRコードデータ
        const mockQRData = `vc-${Date.now()}`;
        await verifyCredential(mockQRData);
      }
    } catch (error: any) {
      console.error('QR scan error:', error);
      if (error?.code === 'CANCEL') {
        toast.info('QRコードスキャンがキャンセルされました');
      } else {
        // 開発環境でのフォールバック
        toast.info('スキャンに失敗しました。模擬データで検証を実行します');
        const mockQRData = `vc-fallback-${Date.now()}`;
        await verifyCredential(mockQRData);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const verifyCredential = async (qrData: string) => {
    setIsVerifying(true);

    try {
      // TODO: Replace with actual verification API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 既存のVCデータからランダムに選択してリアルなデータを使用
      const sampleCredentials = [
        {
          id: qrData,
          name: "大学卒業証明書",
          issuer: "東京大学",
          subject: "田中太郎",
          issuedDate: "2024-03-15T00:00:00Z",
          expiryDate: "2029-03-15T00:00:00Z",
          status: "active" as const,
          credentialSubject: {
            name: "田中太郎",
            degree: "工学学士",
            gpa: "3.8",
            graduationDate: "2024年3月"
          },
          logoUrl: "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: qrData,
          name: "運転免許証",
          issuer: "警視庁",
          subject: "田中太郎",
          issuedDate: "2023-07-20T00:00:00Z",
          expiryDate: "2026-07-20T00:00:00Z",
          status: "active" as const,
          credentialSubject: {
            name: "田中太郎",
            licenseNumber: "123456789",
            class: "普通",
            issueDate: "2023年7月"
          },
          logoUrl: "https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: qrData,
          name: "在職証明書",
          issuer: "株式会社サンプル",
          subject: "田中太郎",
          issuedDate: "2024-01-10T00:00:00Z",
          expiryDate: "2025-01-10T00:00:00Z",
          status: "active" as const,
          credentialSubject: {
            name: "田中太郎",
            position: "ソフトウェアエンジニア",
            department: "開発部",
            employmentDate: "2022年4月"
          },
          logoUrl: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: qrData,
          name: "医師免許証",
          issuer: "厚生労働省",
          subject: "田中太郎",
          issuedDate: "2020-04-01T00:00:00Z",
          expiryDate: "2030-04-01T00:00:00Z",
          status: "active" as const,
          credentialSubject: {
            name: "田中太郎",
            licenseNumber: "MD-987654321",
            specialty: "内科",
            graduationYear: "2020年"
          },
          logoUrl: "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
      ];

      // ランダムに証明書を選択（実際の検証ではQRコードに基づいて特定の証明書を取得）
      const randomCredential = sampleCredentials[Math.floor(Math.random() * sampleCredentials.length)];

      // 時々検証失敗のケースもシミュレート（10%の確率）
      const isValid = Math.random() > 0.1;

      const mockResult: VerificationResult = {
        isValid,
        credential: isValid ? randomCredential : undefined,
        error: isValid ? undefined : '証明書の署名が無効です'
      };

      setVerificationResult(mockResult);

      if (mockResult.isValid) {
        toast.success('証明書の検証が完了しました');
      } else {
        toast.error('証明書の検証に失敗しました');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        error: '検証処理中にエラーが発生しました'
      });
      toast.error('検証処理中にエラーが発生しました');
    } finally {
      setIsVerifying(false);
    }
  };

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
      day: 'numeric'
    });
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header title="証明書検証" showBackButton />

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              証明書検証
            </h1>
            <p className="text-gray-600">
              QRコードをスキャンして証明書の真正性を確認します
            </p>
          </div>

          {/* Scan Button */}
          {!verificationResult && (
            <Card className="mb-6 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button
                    onClick={startQRScan}
                    disabled={isScanning || isVerifying}
                    className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isScanning ? (
                      <>
                        <Scan className="w-6 h-6 mr-3 animate-pulse" />
                        スキャン中...
                      </>
                    ) : isVerifying ? (
                      <>
                        <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                        検証中...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-6 h-6 mr-3" />
                        QRコードをスキャン
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    {verificationResult.isValid ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-green-800">検証成功</h2>
                          <p className="text-green-600">この証明書は有効です</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                          <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <div className="animate-in fade-in duration-700 delay-200">
                          <h2 className="text-xl font-bold text-red-800 mb-2">検証失敗</h2>
                          <p className="text-red-600 mb-4">
                            {verificationResult.error || 'この証明書は無効です'}
                          </p>

                          {/* 詳細なエラー情報 */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">
                              可能な原因：
                            </h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              <li>• 証明書の署名が改ざんされている</li>
                              <li>• 発行者の証明書が失効している</li>
                              <li>• QRコードの形式が正しくない</li>
                              <li>• 証明書の有効期限が切れている</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Credential Details */}
              {verificationResult.isValid && verificationResult.credential && (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {verificationResult.credential.logoUrl ? (
                          <img
                            src={verificationResult.credential.logoUrl}
                            alt="発行者ロゴ"
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              // 画像読み込みエラー時のフォールバック
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
                          style={{ display: verificationResult.credential.logoUrl ? 'none' : 'flex' }}
                        >
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {verificationResult.credential.name}
                          </CardTitle>
                          <CardDescription>
                            {verificationResult.credential.issuer}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(verificationResult.credential.status)} border`}
                      >
                        {getStatusText(verificationResult.credential.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Subject */}
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">対象者</p>
                        <p className="text-base text-gray-900">{verificationResult.credential.subject}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">発行日</p>
                          <p className="text-base text-gray-900">
                            {formatDate(verificationResult.credential.issuedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">有効期限</p>
                          <p className="text-base text-gray-900">
                            {formatDate(verificationResult.credential.expiryDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Credential Details */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="w-5 h-5 text-gray-400" />
                        <p className="text-sm font-medium text-gray-600">証明書の詳細</p>
                      </div>
                      <div className="space-y-3 ml-7">
                        {Object.entries(verificationResult.credential.credentialSubject).map(([key, value], index) => (
                          <div
                            key={key}
                            className="flex justify-between animate-in slide-in-from-left duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <span className="text-sm text-gray-600">
                              {key === 'name' ? '氏名' :
                                key === 'degree' ? '学位' :
                                  key === 'gpa' ? 'GPA' :
                                    key === 'graduationDate' ? '卒業日' :
                                      key === 'licenseNumber' ? '免許証番号' :
                                        key === 'class' ? '免許種別' :
                                          key === 'issueDate' ? '発行日' :
                                            key === 'position' ? '役職' :
                                              key === 'department' ? '部署' :
                                                key === 'employmentDate' ? '入社日' :
                                                  key === 'specialty' ? '専門科目' :
                                                    key === 'graduationYear' ? '卒業年' :
                                                      key}:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={resetVerification}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  再検証
                </Button>
                <Button
                  onClick={startQRScan}
                  disabled={isScanning || isVerifying}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  新しくスキャン
                </Button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-8 border-0 shadow-lg bg-blue-50/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    ご利用について
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• QRコードは証明書に記載されているものを使用してください</li>
                    <li>• 検証結果は即座に表示されます</li>
                    <li>• この機能はLINEアプリ内でのみ利用できます</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

