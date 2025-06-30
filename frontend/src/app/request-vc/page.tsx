'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { Header } from '@/app/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  Shield,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Calendar,
  Send,
  Sparkles,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 組織マスタデータ
const organizations = [
  {
    id: 'tokyo-university',
    name: '東京大学',
    category: 'education',
    type: '国立大学',
    logoUrl: 'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'keio-university',
    name: '慶應義塾大学',
    category: 'education',
    type: '私立大学',
    logoUrl: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'waseda-university',
    name: '早稲田大学',
    category: 'education',
    type: '私立大学',
    logoUrl: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'sample-corp',
    name: '株式会社サンプル',
    category: 'company',
    type: 'IT企業',
    logoUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'abc-corporation',
    name: 'ABC株式会社',
    category: 'company',
    type: '製造業',
    logoUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'metropolitan-police',
    name: '警視庁',
    category: 'government',
    type: '政府機関',
    logoUrl: 'https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'ministry-health',
    name: '厚生労働省',
    category: 'government',
    type: '政府機関',
    logoUrl: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

// 証明書タイプマスタデータ
const credentialTypes = {
  'tokyo-university': [
    { id: 'university-diploma', name: '卒業証明書', icon: GraduationCap, description: '学位取得の証明' },
    { id: 'transcript', name: '成績証明書', icon: FileText, description: '履修科目と成績の証明' },
    { id: 'enrollment-cert', name: '在籍証明書', icon: User, description: '在学中であることの証明' }
  ],
  'keio-university': [
    { id: 'university-diploma', name: '卒業証明書', icon: GraduationCap, description: '学位取得の証明' },
    { id: 'transcript', name: '成績証明書', icon: FileText, description: '履修科目と成績の証明' }
  ],
  'waseda-university': [
    { id: 'university-diploma', name: '卒業証明書', icon: GraduationCap, description: '学位取得の証明' },
    { id: 'transcript', name: '成績証明書', icon: FileText, description: '履修科目と成績の証明' }
  ],
  'sample-corp': [
    { id: 'employment-certificate', name: '在職証明書', icon: Briefcase, description: '雇用関係の証明' },
    { id: 'salary-certificate', name: '給与証明書', icon: FileText, description: '給与支払いの証明' }
  ],
  'abc-corporation': [
    { id: 'employment-certificate', name: '在職証明書', icon: Briefcase, description: '雇用関係の証明' }
  ],
  'metropolitan-police': [
    { id: 'driver-license', name: '運転免許証', icon: Shield, description: '運転資格の証明' }
  ],
  'ministry-health': [
    { id: 'medical-license', name: '医師免許証', icon: Shield, description: '医師資格の証明' }
  ]
};

// オプション項目定義
const additionalFields = {
  'university-diploma': [
    { name: 'studentId', label: '学籍番号', placeholder: '例: 2020123456', helpText: 'より正確な照合のため（任意）' },
    { name: 'faculty', label: '学部・学科', placeholder: '例: 工学部情報工学科', helpText: '卒業した学部・学科名' }
  ],
  'transcript': [
    { name: 'studentId', label: '学籍番号', placeholder: '例: 2020123456', helpText: 'より正確な照合のため（任意）' },
    { name: 'graduationYear', label: '卒業年度', placeholder: '例: 2024', helpText: '卒業年度を入力' }
  ],
  'enrollment-cert': [
    { name: 'studentId', label: '学籍番号', placeholder: '例: 2020123456', helpText: 'より正確な照合のため（任意）' }
  ],
  'employment-certificate': [
    { name: 'employeeId', label: '社員番号', placeholder: '例: EMP001234', helpText: 'より正確な照合のため（任意）' },
    { name: 'department', label: '所属部署', placeholder: '例: 開発部', helpText: '現在または過去の所属部署' }
  ],
  'salary-certificate': [
    { name: 'employeeId', label: '社員番号', placeholder: '例: EMP001234', helpText: 'より正確な照合のため（任意）' },
    { name: 'period', label: '証明期間', placeholder: '例: 2023年1月〜12月', helpText: '給与証明が必要な期間' }
  ],
  'driver-license': [
    { name: 'licenseNumber', label: '免許証番号', placeholder: '例: 123456789012', helpText: 'より正確な照合のため（任意）' }
  ],
  'medical-license': [
    { name: 'licenseNumber', label: '医師免許番号', placeholder: '例: 123456', helpText: 'より正確な照合のため（任意）' }
  ]
};

type Step = 'organization' | 'credential-type' | 'details' | 'confirm' | 'complete';

interface RequestData {
  organization?: typeof organizations[0];
  credentialType?: typeof credentialTypes[keyof typeof credentialTypes][0];
  basicInfo: {
    fullName: string;
    dateOfBirth: string;
  };
  additionalInfo: Record<string, string>;
  message?: string;
}

export default function RequestVC() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<Step>('organization');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [requestData, setRequestData] = useState<RequestData>({
    basicInfo: {
      fullName: '田中太郎', // DIDから取得（デモ用）
      dateOfBirth: '1995-04-01' // DIDから取得（デモ用）
    },
    additionalInfo: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 組織フィルタリング
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(org => org.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // ステップ進行
  const goToNextStep = () => {
    const steps: Step[] = ['organization', 'credential-type', 'details', 'confirm', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const steps: Step[] = ['organization', 'credential-type', 'details', 'confirm', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // 組織選択
  const selectOrganization = (organization: typeof organizations[0]) => {
    setRequestData(prev => ({ ...prev, organization }));
    goToNextStep();
  };

  // 証明書タイプ選択
  const selectCredentialType = (credentialType: typeof credentialTypes[keyof typeof credentialTypes][0]) => {
    setRequestData(prev => ({ ...prev, credentialType, additionalInfo: {} }));
    goToNextStep();
  };

  // リクエスト送信
  const submitRequest = async () => {
    setIsSubmitting(true);

    try {
      // TODO: 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('証明書発行リクエストを送信しました');
      goToNextStep();
    } catch (error) {
      toast.error('リクエストの送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // プログレスバー
  const getProgress = () => {
    const stepProgress = {
      'organization': 20,
      'credential-type': 40,
      'details': 60,
      'confirm': 80,
      'complete': 100
    };
    return stepProgress[currentStep];
  };

  const categories = [
    { id: 'all', name: '全て', icon: Building2 },
    { id: 'education', name: '教育機関', icon: GraduationCap },
    { id: 'company', name: '企業', icon: Briefcase },
    { id: 'government', name: '政府機関', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header title="証明書発行依頼" showBackButton />

      <div className="pt-16 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* プログレスバー */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>組織選択</span>
              <span>証明書選択</span>
              <span>詳細入力</span>
              <span>確認</span>
              <span>完了</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* Step 1: 組織選択 */}
          {currentStep === 'organization' && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  発行機関を選択
                </h1>
                <p className="text-gray-600">
                  証明書を発行してもらう組織を選んでください
                </p>
              </div>

              {/* カテゴリータブ */}
              <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-xl">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                      selectedCategory === category.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>

              {/* 検索バー */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="組織名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 組織リスト */}
              <div className="space-y-3">
                {filteredOrganizations.map((org, index) => (
                  <Card
                    key={org.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => selectOrganization(org)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={org.logoUrl}
                            alt={`${org.name}のロゴ`}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzNCODJGNiIvPgo8cGF0aCBkPSJNMjQgMTJMMzIgMzJIMTZMMjQgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{org.name}</h3>
                            <p className="text-sm text-gray-600">{org.type}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 証明書タイプ選択 */}
          {currentStep === 'credential-type' && requestData.organization && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  証明書タイプを選択
                </h1>
                <p className="text-gray-600">
                  {requestData.organization.name}から発行可能な証明書
                </p>
              </div>

              {/* 選択した組織の表示 */}
              <Card className="mb-6 border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={requestData.organization.logoUrl}
                      alt={`${requestData.organization.name}のロゴ`}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{requestData.organization.name}</h3>
                      <p className="text-sm text-gray-600">{requestData.organization.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 証明書タイプリスト */}
              <div className="space-y-3 mb-6">
                {credentialTypes[requestData.organization.id]?.map((type, index) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => selectCredentialType(type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <type.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{type.name}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={goToPrevStep}
                variant="outline"
                className="w-full h-12 rounded-xl border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                戻る
              </Button>
            </div>
          )}

          {/* Step 3: 詳細情報入力 */}
          {currentStep === 'details' && requestData.credentialType && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  詳細情報を入力
                </h1>
                <p className="text-gray-600">
                  証明書発行に必要な情報を確認・入力してください
                </p>
              </div>

              {/* 基本情報 */}
              <Card className="mb-6 border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    基本情報
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        氏名（必須）
                      </Label>
                      <Input
                        id="fullName"
                        value={requestData.basicInfo.fullName}
                        onChange={(e) => setRequestData(prev => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, fullName: e.target.value }
                        }))}
                        className="mt-1 h-12 bg-gray-50 border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                        生年月日（必須）
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={requestData.basicInfo.dateOfBirth}
                        onChange={(e) => setRequestData(prev => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, dateOfBirth: e.target.value }
                        }))}
                        className="mt-1 h-12 bg-gray-50 border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 追加情報（オプション） */}
              {additionalFields[requestData.credentialType.id] && (
                <Card className="mb-6 border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                      詳細情報（任意）
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      より正確な照合のため、以下の情報をご入力いただけます
                    </p>

                    <div className="space-y-4">
                      {additionalFields[requestData.credentialType.id].map((field) => (
                        <div key={field.name}>
                          <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                            {field.label}
                          </Label>
                          <Input
                            id={field.name}
                            placeholder={field.placeholder}
                            value={requestData.additionalInfo[field.name] || ''}
                            onChange={(e) => setRequestData(prev => ({
                              ...prev,
                              additionalInfo: {
                                ...prev.additionalInfo,
                                [field.name]: e.target.value
                              }
                            }))}
                            className="mt-1 h-12 bg-gray-50 border-gray-200 rounded-xl"
                          />
                          <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ナビゲーションボタン */}
              <div className="flex space-x-3">
                <Button
                  onClick={goToPrevStep}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={goToNextStep}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  確認画面へ
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: 確認画面 */}
          {currentStep === 'confirm' && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  リクエスト内容の確認
                </h1>
                <p className="text-gray-600">
                  以下の内容で発行依頼を送信します
                </p>
              </div>

              {/* 確認内容 */}
              <div className="space-y-4 mb-6">
                {/* 組織情報 */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">発行機関</h3>
                    <div className="flex items-center space-x-3">
                      <img
                        src={requestData.organization?.logoUrl}
                        alt="組織ロゴ"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{requestData.organization?.name}</p>
                        <p className="text-sm text-gray-600">{requestData.organization?.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 証明書情報 */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">証明書タイプ</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {requestData.credentialType && <requestData.credentialType.icon className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{requestData.credentialType?.name}</p>
                        <p className="text-sm text-gray-600">{requestData.credentialType?.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 個人情報 */}
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">個人情報</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">氏名</span>
                        <span className="font-medium text-gray-900">{requestData.basicInfo.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">生年月日</span>
                        <span className="font-medium text-gray-900">
                          {new Date(requestData.basicInfo.dateOfBirth).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 追加情報 */}
                {Object.keys(requestData.additionalInfo).length > 0 && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-3">追加情報</h3>
                      <div className="space-y-2">
                        {Object.entries(requestData.additionalInfo).map(([key, value]) => {
                          if (!value) return null;
                          const field = additionalFields[requestData.credentialType?.id || '']?.find(f => f.name === key);
                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{field?.label || key}</span>
                              <span className="font-medium text-gray-900">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 送信ボタン */}
              <div className="flex space-x-3">
                <Button
                  onClick={goToPrevStep}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-gray-200"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={submitRequest}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      リクエスト送信
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: 完了画面 */}
          {currentStep === 'complete' && (
            <div className="animate-in fade-in slide-in-from-right duration-500 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <Check className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                リクエスト送信完了！
              </h1>

              <p className="text-gray-600 mb-6 leading-relaxed">
                証明書発行依頼を<strong>{requestData.organization?.name}</strong>に送信しました。
                発行完了後、LINEメッセージでお知らせします。
              </p>

              <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2 text-blue-700 mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">次のステップ</span>
                  </div>
                  <div className="text-sm text-blue-600 space-y-2">
                    <p>1. 発行機関での審査・処理</p>
                    <p>2. LINEメッセージで通知</p>
                    <p>3. ウォレットアプリで証明書受取り</p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => window.history.back()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                ダッシュボードに戻る
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}