import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UrlInputForm from './components/UrlInputForm';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UrlInputForm />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
