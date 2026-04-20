import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import OmnichannelWebChat from '../../imports/OmnichannelWebChat2-14-2789';

export function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-white overflow-hidden">
      {/* Back button overlay */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:text-black transition-colors rounded-lg shadow-md border border-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Powrót na stronę</span>
      </button>

      {/* Figma Dashboard - responsive container */}
      <div className="w-full min-h-screen h-full relative">
        <OmnichannelWebChat />
      </div>
    </div>
  );
}