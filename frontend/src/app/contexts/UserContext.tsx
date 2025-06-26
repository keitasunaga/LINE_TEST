'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, VerifiableCredential, DID } from '@/app/types';

// LIFF関連の型定義
interface LIFFProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LIFFInfo {
  profile: LIFFProfile | null;
  context: any | null;
  device: {
    isInClient: boolean;
    isLoggedIn: boolean;
    os: string;
    version: string;
    language: string;
  };
  isInitialized: boolean;
  liffId: string;
}

// LIFF SDKは動的にインポート
let liff: any;

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  addCredential: (credential: VerifiableCredential) => void;
  removeCredential: (credentialId: string) => void;
  createDID: () => Promise<DID>;
  isCreatingDID: boolean;
  // LIFF関連
  liffInfo: LIFFInfo | null;
  initializeLIFF: () => Promise<void>;
  isLIFFInitializing: boolean;
  liffError: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// サンプルデータ
const sampleCredentials: VerifiableCredential[] = [
  {
    id: 'vc-1',
    type: 'UniversityDiploma',
    name: '大学卒業証明書',
    issuer: '東京大学',
    issuedDate: '2024-03-15',
    expiryDate: '2029-03-15',
    status: 'active',
    logoUrl: 'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=400',
    qrCode: 'QR_CODE_DATA_1',
    metadata: {
      credentialSubject: {
        name: '田中太郎',
        degree: '工学学士',
        gpa: '3.8'
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2024-03-15T10:00:00Z'
      }
    }
  },
  {
    id: 'vc-2',
    type: 'DriverLicense',
    name: '運転免許証',
    issuer: '警視庁',
    issuedDate: '2023-07-20',
    expiryDate: '2026-07-20',
    status: 'active',
    logoUrl: 'https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=400',
    qrCode: 'QR_CODE_DATA_2',
    metadata: {
      credentialSubject: {
        name: '田中太郎',
        licenseNumber: '123456789',
        class: '普通'
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2023-07-20T14:30:00Z'
      }
    }
  },
  {
    id: 'vc-3',
    type: 'EmploymentCertificate',
    name: '在職証明書',
    issuer: '株式会社サンプル',
    issuedDate: '2024-01-10',
    expiryDate: '2025-01-10',
    status: 'active',
    logoUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400',
    qrCode: 'QR_CODE_DATA_3',
    metadata: {
      credentialSubject: {
        name: '田中太郎',
        position: 'ソフトウェアエンジニア',
        department: '開発部'
      },
      proof: {
        type: 'Ed25519Signature2018',
        created: '2024-01-10T09:00:00Z'
      }
    }
  }
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    hasCompletedOnboarding: false,
    credentials: []
  });
  const [isCreatingDID, setIsCreatingDID] = useState(false);

  // LIFF関連の状態
  const [liffInfo, setLiffInfo] = useState<LIFFInfo | null>(null);
  const [isLIFFInitializing, setIsLIFFInitializing] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    // ローカルストレージから状態を復元
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } else {
      // 初回訪問時はオンボーディング未完了状態に設定
      setUser({
        credentials: [],
        hasCompletedOnboarding: false
      });
    }
  }, []);

  useEffect(() => {
    // ユーザー状態の変更をローカルストレージに保存
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const addCredential = (credential: VerifiableCredential) => {
    setUser(prev => ({
      ...prev,
      credentials: [...prev.credentials, credential]
    }));
  };

  const removeCredential = (credentialId: string) => {
    setUser(prev => ({
      ...prev,
      credentials: prev.credentials.filter(c => c.id !== credentialId)
    }));
  };

  const createDID = async (): Promise<DID> => {
    setIsCreatingDID(true);

    // DID作成のシミュレーション（2-3秒の遅延）
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 実際のDID生成ロジック（ここではモックアップ）
    const newDID: DID = {
      id: `did:example:${Date.now()}`,
      controller: `did:example:${Date.now()}`,
      created: new Date().toISOString(),
      publicKey: `z6Mk${Math.random().toString(36).substring(2, 15)}`
    };

    // DID作成時にはサンプルクレデンシャルも追加（デモ用）
    updateUser({
      did: newDID,
      credentials: sampleCredentials
    });

    setIsCreatingDID(false);
    return newDID;
  };

  // LIFF初期化関数
  const initializeLIFF = async (): Promise<void> => {
    if (liffInfo?.isInitialized) {
      return; // 既に初期化済み
    }

    setIsLIFFInitializing(true);
    setLiffError(null);

    try {
      // LIFF SDKを動的にインポート
      if (!liff) {
        const liffModule = await import('@line/liff');
        liff = liffModule.default;
      }

      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        throw new Error('LIFF IDが設定されていません');
      }

      // LIFF初期化
      await liff.init({ liffId });

      // デバイス情報取得
      const deviceInfo = {
        isInClient: liff.isInClient(),
        isLoggedIn: liff.isLoggedIn(),
        os: liff.getOS() || 'unknown',
        version: liff.getVersion() || 'N/A',
        language: liff.getLanguage() || 'ja'
      };

      // プロフィール取得（ログイン済みの場合）
      let profile: LIFFProfile | null = null;
      if (deviceInfo.isLoggedIn) {
        try {
          profile = await liff.getProfile();
        } catch (err) {
          console.warn('プロフィール取得エラー:', err);
        }
      }

      // コンテキスト取得
      let context: any = null;
      try {
        context = liff.getContext();
      } catch (err) {
        console.warn('コンテキスト取得エラー:', err);
      }

      const info: LIFFInfo = {
        profile,
        context,
        device: deviceInfo,
        isInitialized: true,
        liffId
      };

      setLiffInfo(info);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setLiffError(errorMessage);

      // フォールバック情報を設定
      const fallbackInfo: LIFFInfo = {
        profile: null,
        context: null,
        device: {
          isInClient: false,
          isLoggedIn: false,
          os: 'unknown',
          version: 'N/A',
          language: 'ja'
        },
        isInitialized: false,
        liffId: process.env.NEXT_PUBLIC_LIFF_ID || '設定されていません'
      };
      setLiffInfo(fallbackInfo);
    } finally {
      setIsLIFFInitializing(false);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      updateUser,
      addCredential,
      removeCredential,
      createDID,
      isCreatingDID,
      // LIFF関連
      liffInfo,
      initializeLIFF,
      isLIFFInitializing,
      liffError
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}