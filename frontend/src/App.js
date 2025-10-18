import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginPage from './LoginPage';
import Home from './Home';
import Register from './RegisterNew';
import Blog from './BlogNew';
import CreatePage from './CreatePage';
import Edit from './Edit';



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Blog/:id" element={<Blog />} />
            <Route path="/CreatePage" element={<CreatePage />} />
            <Route path="/Edit/:id" element={<Edit />} />
          </Routes>
        </Router>
      </header>
    </div>


  );
}

export default App;
