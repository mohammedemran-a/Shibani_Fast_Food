import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-background text-foreground">
      <ShieldAlert className="w-24 h-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold mb-2">وصول مرفوض</h1>
      <p className="text-lg text-muted-foreground mb-8">ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.</p>
      <Button onClick={() => navigate('/')} size="lg">
        العودة إلى لوحة التحكم
      </Button>
    </div>
  );
};

export default Unauthorized;
