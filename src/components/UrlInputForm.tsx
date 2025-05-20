import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import WaveBackground from './WaveBackground';

const UrlInputForm = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('https://hook.us2.make.com/dkcoosbwopffcliky35o6w37q8vkhaof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'URL이 성공적으로 제출되었습니다',
        });
        setUrl('');
        navigate(`/result?url=${encodeURIComponent(url)}`);
      } else {
        throw new Error('제출에 실패했습니다');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: '크롤링 서버와의 통신에 실패했습니다. (CORS 문제일 수 있습니다. 배포 환경에서 다시 시도해 주세요.)',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ position: 'relative', overflow: 'hidden' }}>
      <WaveBackground />
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">구글 플레이 리뷰 요약</h2>
        <p className="text-neutral-500 mb-6 text-center">
          <span className="font-medium text-indigo-600">구글 플레이 스토어 앱 URL</span>을 입력하면<br />
          리뷰 요약을 받아볼 수 있습니다.
        </p>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
              <FaSearch className="w-5 h-5" />
            </span>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base bg-neutral-50 placeholder-neutral-400 transition"
              placeholder="예: https://play.google.com/store/apps/details?id=..."
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold text-base shadow hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '제출하기'}
          </button>
        </form>
        {status.type && (
          <div
            className={`mt-6 w-full p-4 rounded-lg text-center text-base font-medium ${
              status.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlInputForm; 