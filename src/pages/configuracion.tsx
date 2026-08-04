import { useNavigate, useSearchParams } from 'react-router-dom';
import SettingsModal from '@/components/SettingsModal';

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  let defaultTab: 'profile' | 'appearance' | 'plan' | 'ai' = 'profile';
  if (tabParam === 'plan') defaultTab = 'plan';
  else if (tabParam === 'appearance') defaultTab = 'appearance';
  else if (tabParam === 'ai') defaultTab = 'ai';

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <SettingsModal
        isOpen={true}
        onClose={() => navigate('/app')}
        defaultTab={defaultTab}
      />
    </div>
  );
}
