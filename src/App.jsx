import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login/Login";
import Home from "./Components/Home/Home";
import Antigas from "./Components/ChamadasAntigas/Antigas"; 
import Leitor from "./Components/Leitor/Leitor"; 

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home token={token} />} />
        <Route path="/chamadas-antigas" element={<Antigas />} /> 
        <Route path="/leitor" element={<Leitor />} />
      </Routes>
    </Router>
  );
};

export default App;

