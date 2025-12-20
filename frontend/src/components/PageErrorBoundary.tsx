import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  pageName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Page Error Boundary Component
 * 
 * تطبيق Clean Code Principles:
 * - Single Responsibility: مسؤول فقط عن التقاط أخطاء الصفحة
 * - Fail-Safe: يمنع انهيار الصفحة بالكامل
 * - User-Friendly: يعرض رسالة واضحة للمستخدم
 * 
 * الاستخدام:
 * <PageErrorBoundary pageName="المنتجات">
 *   <ProductsList />
 * </PageErrorBoundary>
 */
class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log الخطأ للمطورين
    console.error(
      `[PageErrorBoundary - ${this.props.pageName || 'Unknown Page'}]:`,
      error,
      errorInfo
    );
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });

    // استدعاء دالة reset مخصصة إذا تم تمريرها
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <div className="max-w-md w-full">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                حدث خطأ في {this.props.pageName || 'هذه الصفحة'}
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                عذراً، حدث خطأ أثناء تحميل المحتوى. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-destructive/5 rounded-lg text-left">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </Button>

                <Button
                  onClick={() => (window.location.href = '/')}
                  size="sm"
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  الرئيسية
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
