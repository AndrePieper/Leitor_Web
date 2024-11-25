import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Alert, Card, CardContent } from "@mui/material";
import "./Antigas.css";

const ChamadasAntigas = () => {
  const [chamadas, setChamadas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMensagemErro("Token não encontrado. Faça login novamente.");
      return;
    }

    let idProfessor = null;
    try {
      const decoded = decodeJwt(token);
      idProfessor = decoded.id;
    } catch (error) {
      setMensagemErro("Erro ao decodificar o token.");
      console.error(error.message);
      return;
    }

    // GET para buscar as materias de acordo com o ID do professor
    fetch(`https://projeto-iii-4.vercel.app/chamadas/professor/${idProfessor}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar as chamadas antigas.");
        }
        return response.json();
      })
      .then((data) => {
        setChamadas(data.reverse().slice(0, 9)); 
      })
      .catch((error) => {
        setMensagemErro(error.message);
        console.error(error.message);
      });
  }, []);

  const Home = () => {
    navigate("/home");
  };

  return (
    <div className="container">
      <Typography className="titulo" variant="h4" gutterBottom>
        Chamadas Antigas
      </Typography>

      {mensagemErro && <Alert className="erro" severity="error">{mensagemErro}</Alert>}

      {chamadas.length === 0 && !mensagemErro && (
        <Typography variant="body1">Nenhuma chamada encontrada.</Typography>
      )}

      {chamadas.length > 0 && (
        <div className="grid">
          {chamadas.map((chamada) => (
            <Card key={chamada.id} className="card">
              <CardContent>
                <Typography className="cardTexto">{chamada.descricao}</Typography>
                <Typography variant="body2">
                  Data: {new Date(chamada.data_hora_inicio).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" >
                  Hora: {new Date(chamada.data_hora_inicio).toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        className="botaoPadrao"
        variant="contained"
        onClick={Home}>
        Voltar
      </Button>
    </div>
  );
};

export default ChamadasAntigas;
