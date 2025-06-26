export interface VerifiableCredential {
  id: string;
  type: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  logoUrl?: string;
  qrCode?: string;
  metadata: {
    credentialSubject: Record<string, any>;
    proof: Record<string, any>;
  };
}

export interface DID {
  id: string;
  controller: string;
  created: string;
  publicKey: string;
}

export interface User {
  did?: DID;
  credentials: VerifiableCredential[];
  hasCompletedOnboarding: boolean;
}

// LIFF API型定義
declare global {
  interface Window {
    liff: {
      isInClient: () => boolean;
      scanCodeV2: () => Promise<{ value: string }>;
      init: (config: any) => Promise<void>;
      ready: Promise<void>;
      getProfile: () => Promise<any>;
      shareTargetPicker: (messages: any[]) => Promise<void>;
    } | undefined;
  }
}