export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'sales';
  isActive: boolean;
  createdAt?: string;
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

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: Category | string;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedPosts: (Blog | string)[];
  faqs: Faq[];
  faqsTitle: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DistributorLeadStatus =
  | 'form_submitted'
  | 'otp_sent'
  | 'otp_verified'
  | 'lock_acquired'
  | 'order_created'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'lock_lost'
  | 'activated';

export type PaymentStage = 'booking' | 'final';
export type PaymentMethod = 'razorpay' | 'qr_self' | 'manual';
export type PaymentEntryStatus = 'pending' | 'success' | 'failed';

export interface DistributorPaymentEntry {
  _id?: string;
  stage: PaymentStage;
  method: PaymentMethod;
  amount: number;
  status: PaymentEntryStatus;
  orderId?: string;
  paymentId?: string;
  utr?: string;
  collectedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export type LeadCallStatus = 'not_required' | 'pending_call' | 'called' | 'converted';

export type ManualPaymentMode = 'cash' | 'qr' | 'bank_transfer' | 'other';

export type QrReviewStatus = 'pending' | 'approved' | 'rejected';

export interface DistributorLead {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  asmCode: string;
  referralCode: string;
  aadhaarAddress?: string;
  panCard?: string;
  shopName?: string;
  shopAddress?: string;
  pincode: string;
  district: string;
  state: string;
  country: string;
  consents: {
    nonRefundable: boolean;
    terms: boolean;
    kyc: boolean;
    genuineMerchants: boolean;
    policyViolation: boolean;
  };
  otpVerified: boolean;
  otpVerifiedAt?: string;
  status: DistributorLeadStatus;
  paymentMethod?: 'razorpay' | 'manual' | 'qr_self';
  razorpay?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    amount?: number;
    currency?: string;
    receipt?: string;
  };
  manualPayment?: {
    mode?: ManualPaymentMode;
    reference?: string;
    notes?: string;
    collectedBy?: string;
    collectedAt?: string;
  };
  qrPayment?: {
    utr?: string;
    submittedAt?: string;
    reviewStatus?: QrReviewStatus;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  };
  gst?: {
    baseAmount: number;
    gstAmount: number;
    totalAmount: number;
  };
  leadCallStatus: LeadCallStatus;
  lostReason: string;
  receiptUrl?: string;
  activationReceiptUrl?: string;
  totalDistributorFee?: number;
  payments?: DistributorPaymentEntry[];
  activatedBy?: string;
  activatedAt?: string;
  idCreated?: boolean;
  idCreatedRemark?: string;
  createdAt: string;
  updatedAt: string;
}