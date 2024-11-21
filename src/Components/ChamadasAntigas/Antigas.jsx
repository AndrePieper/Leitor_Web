import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Alert, Paper } from "@mui/material";
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
      console.error("Erro ao decodificar o token:", error.message);
      return;
    }

    const url = `https://projeto-iii-4.vercel.app/chamadas/professor/${idProfessor}`;
    fetch(url, {
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
        console.log("Chamadas antigas recebidas:", data);
        setChamadas(data.reverse().slice(0, 9)); // Exibe as mais recentes primeiro, limite de 9
      })
      .catch((error) => {
        setMensagemErro(error.message);
        console.error("Erro na requisição:", error.message);
      });
  }, []);

  const voltarParaHome = () => {
    navigate("/home");
  };

  return (
    <div className="page-container">
      <Typography className="page-title" variant="h4" gutterBottom>
        Chamadas Antigas
      </Typography>

      {mensagemErro && <Alert className="error-alert" severity="error">{mensagemErro}</Alert>}

      {chamadas.length === 0 && !mensagemErro && (
        <Typography variant="body1">Nenhuma chamada antiga encontrada.</Typography>
      )}

      {chamadas.length > 0 && (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Disciplina</strong></TableCell>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Hora</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chamadas.map((chamada) => (
                <TableRow key={chamada.id}>
                  <TableCell>{chamada.descricao}</TableCell>
                  <TableCell>
                    {new Date(chamada.data_hora_inicio).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(chamada.data_hora_inicio).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button
        className="voltar-button"
        variant="contained"
        onClick={voltarParaHome}>
          Voltar
      </Button>
    </div>
  );
};

export default ChamadasAntigas;
