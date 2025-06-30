'use client';

import { useState } from 'react';
import { VerifiableCredential } from '@/app/types';
import { Calendar, Building2, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VCCardProps {
  credential: VerifiableCredential;
  onClick?: (credential: VerifiableCredential) => void;
}

export function VCCard({ credential, onClick }: VCCardProps) {
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status: VerifiableCredential['status']) => {
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

  const getStatusText = (status: VerifiableCredential['status']) => {
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

  const getStatusIcon = (status: VerifiableCredential['status']) => {
    switch (status) {
      case 'active':
        return <Shield className="w-3 h-3" />;
      case 'expired':
      case 'revoked':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(credential)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {credential.logoUrl && !imageError ? (
              <img
                src={credential.logoUrl}
                alt={`${credential.issuer}のロゴ`}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {credential.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {credential.issuer}
              </p>
            </div>
          </div>
          
          <div className={cn(
            "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border",
            getStatusColor(credential.status)
          )}>
            {getStatusIcon(credential.status)}
            <span>{getStatusText(credential.status)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>発行日: {formatDate(credential.issuedDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>有効期限: {formatDate(credential.expiryDate)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            ID: {credential.id}
          </div>
        </div>
      </div>
    </div>
  );
}