import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { useNavigate } from 'react-router-dom';
import { Button, Select, MenuItem, InputLabel, FormControl, CircularProgress } from '@mui/material';
import './Home.css';

const Home = () => {
  const [tokenDecodificado, setTokenDecodificado] = useState(null);
  const [mostrarCard, setMostrarCard] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodificado = decodeJwt(token);
        setTokenDecodificado(decodificado);
        console.log("Token:", decodificado);
      } catch (erro) {
        console.error(erro.message);
      }
    } else {
      console.log("Sem dados.");
    }
  }, []);

  useEffect(() => {
    if (tokenDecodificado && tokenDecodificado.id) {
      const token = localStorage.getItem("token");
      const url = `https://projeto-iii-4.vercel.app/semestre/professor/${tokenDecodificado.id}`;

      fetch(url, {
        headers: {
          "Authorization": token,
        }
      })
        .then(resposta => {
          if (!resposta.ok) {
            throw new Error(resposta);
          }
          return resposta.json();
        })
        .then(dados => {
          console.log("Disciplinas recebidas:", dados);
          setDisciplinas(dados);
        })
        .catch(erro => {
          console.error(erro);
        });
    }
  }, [tokenDecodificado]);

  const alterarImagem = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        setImagem(leitor.result);
      };
      leitor.readAsDataURL(arquivo);
    }
  };

  const gerarChamada = () => {
    setMostrarCard(true);
  };

  const verChamadasAntigas = () => {
    navigate("/chamadas-antigas");
  };

  const alterarDisciplina = (e) => {
    setDisciplinaSelecionada(e.target.value);
    setMensagemErro(""); 
  };

  const iniciarChamada = () => {
    const dataHoraInicio = new Date().toISOString();
    const chamadaData = {
      id_professor: tokenDecodificado.id,
      id_disciplina: disciplinaSelecionada,
      data_hora_inicio: dataHoraInicio,
    };

    console.log("Dados enviados:", chamadaData);

    fetch("https://projeto-iii-4.vercel.app/chamadas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token"),
      },
      body: JSON.stringify(chamadaData),
    })
      .then(resposta => resposta.json())
      .then(dados => {
        console.log("Resposta do servidor:", dados);
        localStorage.setItem("id_chamada", dados.id);
        navigate("/leitor");
      })
      .catch(erro => {
        console.error("Erro no POST:", erro);
      });
  };

  const confirmarChamada = () => {
    if (!disciplinaSelecionada) {
      setMensagemErro("Selecione uma disciplina para iniciar a chamada.");
    } else {
      console.log("Iniciando chamada para a disciplina:", disciplinaSelecionada);
      iniciarChamada(); 
    }
  };

  const cancelarChamada = () => {
    setMostrarCard(false);
    setDisciplinaSelecionada(""); 
  };

  return (
    <div className="home-container">
      <div className="foto-boas-vindas">
        {tokenDecodificado && (
          <div>
            <div className="foto-container">
              <img
                src={imagem || "/src/assets/professor.png"}
                alt="Professor"
                className="foto-professor"
              />
              <input
                type="file"
                accept="image/*"
                onChange={alterarImagem}
                className="input-foto"
              />
            </div>
            <h2>Bem-vindo Professor(a), {tokenDecodificado.nome}!</h2>
          </div>
        )}
      </div>

      <div className="botoes-container">
        <Button
          onClick={verChamadasAntigas}
          variant="contained"
          color="primary"
          size="large"
        >
          Chamadas Antigas
        </Button>
        <Button
          onClick={gerarChamada}
          variant="contained"
          color="success"
          size="large"
        >
          Gerar Chamada
        </Button>
      </div>

      {mostrarCard && (
        <div className="card">
          <div className="card-content">
            <h3>Iniciar Chamada</h3>
            <FormControl fullWidth error={!!mensagemErro}>
              <InputLabel>Escolha uma Disciplina</InputLabel>
              <Select
                value={disciplinaSelecionada}
                onChange={alterarDisciplina}
                label="Escolha uma Disciplina"
              >
                <MenuItem value="">
                  <em>Selecione uma disciplina</em>
                </MenuItem>
                {disciplinas.map((disciplina) => (
                  <MenuItem key={disciplina.id} value={disciplina.id}>
                    {disciplina.descricao}
                  </MenuItem>
                ))}
              </Select>
              {mensagemErro && <p className="error-message">{mensagemErro}</p>}
            </FormControl>
            <div className="button-group">
              <Button
                onClick={confirmarChamada}
                variant="contained"
                color="success"
                fullWidth
              >
                Confirmar
              </Button>
              <Button
                onClick={cancelarChamada}
                variant="outlined"
                color="error"
                fullWidth
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
