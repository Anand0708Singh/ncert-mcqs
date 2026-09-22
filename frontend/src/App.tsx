import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ChapterSelect from './pages/ChapterSelect';
import TestConfig from './pages/TestConfig';
import TestRunner from './pages/TestRunner';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chapters" element={<ChapterSelect />} />
          <Route path="config" element={<TestConfig />} />
          <Route path="test" element={<TestRunner />} />
          <Route path="results" element={<Results />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
