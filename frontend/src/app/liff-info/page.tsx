'use client';

import { useUser } from '@/app/contexts/UserContext';
import { Header } from '@/app/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Smartphone, Globe, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LIFFInfoPage() {
  const { liffInfo, isLIFFInitializing, liffError, initializeLIFF } = useUser();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をコピーしました`);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const handleRefresh = () => {
    initializeLIFF();
  };

  if (isLIFFInitializing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="LIFF情報" showBackButton />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">LIFF情報を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="LIFF情報" showBackButton />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-red-600 mb-4">エラーが発生しました</p>
            <p className="text-gray-600 text-sm mb-4">{liffError}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              再試行
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!liffInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="LIFF情報" showBackButton />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-gray-600">LIFF情報を取得できませんでした</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              再試行
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="LIFF情報" showBackButton />

      <div className="pt-20 px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">

          <div className="flex justify-end">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              更新
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>LIFF設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">初期化状態</span>
                <Badge variant={liffInfo.isInitialized ? "default" : "destructive"}>
                  {liffInfo.isInitialized ? "初期化済み" : "未初期化"}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">LIFF ID</label>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                    {liffInfo.liffId}
                  </code>
                  {liffInfo.liffId !== '設定されていません' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(liffInfo.liffId, 'LIFF ID')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>ユーザー情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liffInfo.profile ? (
                <>
                  {liffInfo.profile.pictureUrl && (
                    <div className="flex justify-center">
                      <img
                        src={liffInfo.profile.pictureUrl}
                        alt="プロフィール画像"
                        className="w-20 h-20 rounded-full border-2 border-gray-200"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">表示名</label>
                    <p className="text-lg font-semibold">{liffInfo.profile.displayName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">ユーザーID</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                        {liffInfo.profile.userId}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(liffInfo.profile!.userId, 'ユーザーID')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {liffInfo.profile.statusMessage && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ステータスメッセージ</label>
                      <p className="text-gray-700">{liffInfo.profile.statusMessage}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {liffInfo.device.isLoggedIn ?
                      'プロフィール情報を取得できませんでした' :
                      'ログインが必要です'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>デバイス情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LINEアプリ内</span>
                <Badge variant={liffInfo.device.isInClient ? "default" : "secondary"}>
                  {liffInfo.device.isInClient ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ログイン状態</span>
                <Badge variant={liffInfo.device.isLoggedIn ? "default" : "secondary"}>
                  {liffInfo.device.isLoggedIn ? "ログイン済み" : "未ログイン"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">OS</span>
                <Badge variant="outline">{liffInfo.device.os}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LIFFバージョン</span>
                <Badge variant="outline">{liffInfo.device.version}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">言語</span>
                <Badge variant="outline">{liffInfo.device.language}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>コンテキスト情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liffInfo.context ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">チャット種別</span>
                    <Badge variant="outline">{liffInfo.context.type}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ビューサイズ</span>
                    <Badge variant="outline">{liffInfo.context.viewType}</Badge>
                  </div>

                  {liffInfo.context.utouId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">チャットID</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                          {liffInfo.context.utouId}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(liffInfo.context!.utouId!, 'チャットID')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {liffInfo.context.roomId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ルームID</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                          {liffInfo.context.roomId}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(liffInfo.context!.roomId!, 'ルームID')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {liffInfo.context.groupId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">グループID</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                          {liffInfo.context.groupId}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(liffInfo.context!.groupId!, 'グループID')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">コンテキスト情報を取得できませんでした</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用可能な機能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <Badge variant={liffInfo.device.isInClient ? "default" : "secondary"}>
                    送信
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {liffInfo.device.isInClient ? '利用可能' : '利用不可'}
                  </p>
                </div>

                <div className="text-center">
                  <Badge variant={liffInfo.device.isLoggedIn ? "default" : "secondary"}>
                    プロフィール
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {liffInfo.device.isLoggedIn ? '利用可能' : '要ログイン'}
                  </p>
                </div>

                <div className="text-center">
                  <Badge variant={liffInfo.device.isInClient ? "default" : "secondary"}>
                    シェア
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {liffInfo.device.isInClient ? '利用可能' : '利用不可'}
                  </p>
                </div>

                <div className="text-center">
                  <Badge variant={liffInfo.device.isInClient ? "default" : "secondary"}>
                    閉じる
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {liffInfo.device.isInClient ? '利用可能' : '利用不可'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5">
                  ℹ️
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">
                    LIFF情報について
                  </h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• ユーザーIDは一意の識別子です</li>
                    <li>• LINEアプリ外では一部機能が制限されます</li>
                    <li>• プロフィール情報の取得にはログインが必要です</li>
                    <li>• LIFF初期化はトップページで実行済みです</li>
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
