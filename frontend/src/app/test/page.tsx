'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('LocalStorageをクリアしました。トップページに戻ります。');
    router.push('/');
  };

  const showLocalStorage = () => {
    const userData = localStorage.getItem('user');
    console.log('Current user data:', userData);
    alert(`Current user data: ${userData}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">テストページ</h1>
        <div className="space-y-4">
          <Button onClick={clearLocalStorage} variant="destructive" className="w-full">
            LocalStorageをクリア
          </Button>
          <Button onClick={showLocalStorage} variant="outline" className="w-full">
            LocalStorageの内容を表示
          </Button>
          <Button onClick={() => router.push('/')} className="w-full">
            トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}