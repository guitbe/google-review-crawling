import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

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
    // 키워드 데이터 파싱 및 정렬 (개선)
    const keywords = result.키워드.split(',')
      .map(k => k.trim())
      .filter(k => k.includes(':'))
      .map(k => {
        const [keyword, count] = k.split(':').map(s => s.trim());
        const value = Number.isNaN(parseInt(count)) ? 0 : parseInt(count);
        return { name: keyword, value };
      })
      .filter(k => k.name && k.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // 상위 10개 키워드만 표시
    console.log('키워드 원본:', result.키워드);
    console.log('파싱된 키워드:', keywords);

    // 감정 분석 데이터 파싱
    const sentimentData = result.감정.split(',')
      .map(s => s.trim())
      .filter(s => s)
      .map(s => {
        const [type, count] = s.split(':').map(s => s.trim());
        return { name: type, value: parseInt(count) || 0 };
      });

    const COLORS = ['#4ade80', '#f87171', '#94a3b8']; // 긍정: 초록, 부정: 빨강, 중립: 회색

    // 최빈 감정/키워드 값 구하기
    const maxSentiment = Math.max(...sentimentData.map(d => d.value));
    const maxKeyword = keywords[0]?.value ?? 0;

    // 파이차트 라벨 커스텀 (SVG <text>로 반환)
    const renderPieLabel = ({
      cx, cy, midAngle, innerRadius, outerRadius, percent, name, value
    }: {
      cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number;
      percent: number; name: string; value: number;
    }) => {
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      const isMax = value === maxSentiment;
      return (
        <text
          x={x}
          y={y}
          fill={isMax ? '#222' : '#666'}
          fontWeight={isMax ? 'bold' : 'normal'}
          fontSize={isMax ? 18 : 14}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {name} {(percent * 100).toFixed(0)}%
        </text>
      );
    };

    // 막대그래프 라벨 커스텀
    const renderBarLabel = (props: any) => {
      const { x, y, width, value } = props;
      const isMax = value === maxKeyword;
      return (
        <text
          x={x + width / 2}
          y={y - 8}
          textAnchor="middle"
          fontWeight={isMax ? 'bold' : 'normal'}
          fontSize={isMax ? 18 : 14}
          fill={isMax ? '#ef4444' : '#6366f1'}
        >
          {value}
        </text>
      );
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-8">
        <div className="w-full max-w-4xl p-8 bg-white rounded-2xl shadow-xl border border-neutral-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">리뷰 분석 결과</h2>
            <button
              onClick={handleBack}
              className="px-4 py-1.5 rounded-lg bg-neutral-100 text-indigo-600 font-medium border border-neutral-200 hover:bg-neutral-200 transition-colors"
            >
              ← 돌아가기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 감정 분석 파이 차트 */}
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <FaThumbsUp className="mr-2 text-green-500" />
                감정 분석
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 키워드 빈도 막대 그래프 */}
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">키워드 빈도</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywords}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" label={renderBarLabel}>
                      {keywords.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* URL 섹션 */}
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <div className="text-sm font-medium text-neutral-500 mb-2">상품 URL</div>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                {result.url}
              </a>
            </div>

            {/* 요약 섹션 */}
            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
              <div className="text-sm font-medium text-neutral-500 mb-2">리뷰 요약</div>
              <div className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
                {result.요약}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // fallback
  return null;
} 