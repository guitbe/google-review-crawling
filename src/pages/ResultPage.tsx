import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/app18dJ8S2IY7gUrX/분석';
const AIRTABLE_API_KEY = 'patgnw1SgMlOR9HSD.86a5064a77411831753a49f58593a95168b6abd2bacf5f3c986f8eccdd1b6cba';

interface ReviewResult {
  감정: string;
  키워드: string;
  요약: string;
  url: string;
  Created?: string;
}

const MAX_RETRY = 10; // 최대 10회(약 30초)
const POLL_INTERVAL = 3000; // 3초

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParam = new URLSearchParams(location.search).get('url');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!urlParam) {
      setError('URL 파라미터가 없습니다.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          filterByFormula: `{url}="${decodeURIComponent(urlParam)}"`
        });
        const response = await fetch(
          `${AIRTABLE_API_URL}?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            }
          }
        );
        const data = await response.json();
        // console.log('Airtable response:', JSON.stringify(data, null, 2));

        if (data.records && data.records.length > 0) {
          if (isMounted) {
            setResult(data.records[0].fields as ReviewResult);
            setLoading(false);
            setError('');
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        } else {
          if (isMounted) {
            setRetryCount((prev) => prev + 1);
            if (retryCount + 1 >= MAX_RETRY) {
              setError('아직 리뷰 분석이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.');
              setLoading(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('결과를 불러오는 중 오류가 발생했습니다.');
          setLoading(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    };

    // 최초 1회 실행
    fetchData();
    // 폴링 시작
    intervalRef.current = window.setInterval(fetchData, POLL_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [urlParam]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading && !error && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
        <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-6"></div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2 tracking-tight">리뷰 분석 중…</h2>
          <p className="text-neutral-500 mb-2">분석이 진행 중입니다. 잠시만 기다려 주세요.</p>
          {retryCount > 0 && (
            <p className="text-xs text-neutral-400">자동으로 결과를 확인 중입니다. ({retryCount}/{MAX_RETRY})</p>
          )}
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
        <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col items-center">
          <div className="text-3xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">오류 발생</h2>
          <p className="text-neutral-500 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
        <div className="w-full max-w-2xl p-10 bg-white rounded-2xl shadow-xl border border-neutral-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">리뷰 분석 결과</h2>
            <button
              onClick={handleBack}
              className="px-4 py-1.5 rounded-lg bg-neutral-100 text-indigo-600 font-medium border border-neutral-200 hover:bg-neutral-200 transition-colors"
            >
              ← 돌아가기
            </button>
          </div>
          <div className="divide-y divide-neutral-200">
            <div className="py-4">
              <div className="text-xs text-neutral-400 mb-1">상품 URL</div>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">{result.url}</a>
            </div>
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neutral-400 mb-1">감정</div>
                <div className="text-base font-semibold text-neutral-800">{result.감정}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1">키워드</div>
                <div className="text-base text-neutral-700">{result.키워드}</div>
              </div>
            </div>
            <div className="py-4">
              <div className="text-xs text-neutral-400 mb-1">요약</div>
              <div className="text-base text-neutral-800 whitespace-pre-wrap leading-relaxed">{result.요약}</div>
            </div>
            <div className="py-4">
              <div className="text-xs text-neutral-400 mb-1">분석 시간</div>
              <div className="text-sm text-neutral-500">{result.Created ? result.Created : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // fallback
  return null;
} 