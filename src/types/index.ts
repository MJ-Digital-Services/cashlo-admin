export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor';
  }
  
  export interface CalculatorType {
    _id: string;
    name: string;
    key: 'emi' | 'sip' | 'swp' | 'fd' | 'rd';
    slug: string;
    icon: string;
    shortDescription: string;
    isActive: boolean;
    order: number;
  }
  
  export interface Faq {
    question: string;
    answer: string;
  }
  
  export interface CalculatorDefaults {
    amount: number;
    rate: number;
    minRate?: number;
    maxRate?: number;
    years: number;
    minYears?: number;
    maxYears?: number;
  }
  
  export interface Calculator {
    _id: string;
    calculatorType: CalculatorType | string;
    slug: string;
    title: string;
    metaTitle?: string;
    metaDescription?: string;
    isBankVariant: boolean;
    bankName?: string;
    logo?: string;
    defaults: CalculatorDefaults;
    blurb?: string;
    articleContent?: string;
    faqs: Faq[];
    isActive: boolean;
    isFeatured: boolean;
    updatedAt?: string;
  }