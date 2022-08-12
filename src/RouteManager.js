import './App.css';
import Group from './pages/Group';
import { Routes, Route, Link } from "react-router-dom";
import Scrape from './pages/Scrape';
import City from './pages/City';
import Setting from './pages/Setting';
import Sidebar from './Sidebar';

function RouteManager() {
  return (
    <div className='flex flex-row w-full h-auto min-h-screen bg-zin-800 outline-blue-700'>
      <Sidebar />
      <Routes>
        <Route path="/scrape" element={<Scrape />} />
        <Route path="/groups" element={<Group />} />
        <Route path="/city" element={<City />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </div>
  );
}

export default RouteManager;
