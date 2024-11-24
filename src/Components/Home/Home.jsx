import React, { useEffect, useState } from "react";
import { decodeJwt } from "jose";
import { useNavigate } from 'react-router-dom';
import { Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import './Home.css';

const Home = () => {
  const [tokenDecodificado, setTokenDecodificado] = useState(null);
  const [mostrarCartao, setMostrarCard] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const imagemSalva = localStorage.getItem("imagem"); 
    if (imagemSalva) {
      setImagem(imagemSalva);
    }

    if (token) {
      try {
        const decodificado = decodeJwt(token);
        setTokenDecodificado(decodificado);
        console.log("Token:", decodificado);

        if (decodificado.id) {
          fetch(`https://projeto-iii-4.vercel.app/semestre/professor/${decodificado.id}`, {
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
      } catch (erro) {
        console.error(erro.message);
      }
    } else {
      console.log("Sem dados.");
    }
  }, []);

  const alterarImagem = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        const imagemProfessor = leitor.result;
        setImagem(imagemProfessor);
        localStorage.setItem("imagem", imagemProfessor); 
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

  const criarChamada = () => {
    if (!disciplinaSelecionada) {
      setMensagemErro("Selecione uma disciplina para iniciar a chamada.");
    } else {
      iniciarChamada();
    }
  };

  const cancelar = () => {
    setMostrarCard(false);
    setDisciplinaSelecionada("");
  };

  return (
    <div className="container-home">
      <div className="foto-boas-vindas">
        {tokenDecodificado && (
          <div>
            <div className="container-foto">
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

      <div className="container-botoes">
        <Button
          onClick={verChamadasAntigas}
          variant="contained"
          className="botao-chamadas-antigas"
        >
          Chamadas Antigas
        </Button>
        <Button
          onClick={gerarChamada}
          variant="contained"
          className="botao-gerar-chamada"
        >
          Gerar Chamada
        </Button>
      </div>

      {mostrarCartao && (
        <div className="cartao">
          <div className="conteudo-cartao">
            <h3>Iniciar Chamada</h3>
            <FormControl fullWidth error={!!mensagemErro}>
              <InputLabel>Escolha uma Disciplina</InputLabel>
              <Select
                value={disciplinaSelecionada}
                onChange={alterarDisciplina}
                label="Escolha uma Disciplina"
                className="select-disciplinas"
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
              {mensagemErro && <p className="mensagem-erro">{mensagemErro}</p>}
            </FormControl>
            <div className="grupo-botoes">
              <Button
                onClick={criarChamada}
                variant="contained"
                className="botao-confirmar"
              >
                Confirmar
              </Button>
              <Button
                onClick={cancelar}
                variant="contained"
                className="botao-cancelar"
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
