import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UrlInputForm from './components/UrlInputForm';
import ResultPage from './pages/ResultPage';
import ParticleBackground from './components/ParticleBackground';
import BlurredMagnifier from './components/BlurredMagnifier';
import WaveBackground from './components/WaveBackground';

function App() {
  return (
    <div className="min-h-screen w-full relative" style={{ background: "#0a1124" }}>
      <ParticleBackground />
      <BlurredMagnifier />
      <WaveBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UrlInputForm />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
