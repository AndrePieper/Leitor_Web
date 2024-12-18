import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Box, Typography } from '@mui/material';
import './Leitor.css';

function LeitorQR() {
  const [dados, setDados] = useState('Aguardando QR Code');
  const [scannerAtivo, setScannerAtivo] = useState(true);
  const [envDados, setenvDados] = useState(false);
  const [modalCardFinalizar,setCardFinalizar] = useState(false);
  const [idChamada] = useState(localStorage.getItem("id_chamada"));
  const navigate = useNavigate();


  //POST para registrar a presenca do aluno
  const presencaAluno = async (dadosQR) => {
    try {
      const dadosJson = JSON.parse(dadosQR);
      if (dadosJson.id_aluno && dadosJson.hora_post) {
        setenvDados(true);
        const token = localStorage.getItem("token");
        const resposta = await fetch('https://projeto-iii-4.vercel.app/chamada/alunos', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
          body: JSON.stringify({
            id_aluno: dadosJson.id_aluno,
            hora_post: dadosJson.hora_post,
            id_chamada: idChamada,
          }),
        });
        if (resposta.ok) {
          const resultado = await resposta.json();
          setDados(`Presença registrada com sucesso!`);
        } else {
          const resultado = await resposta.json();
          setDados(resultado.message);
        }
      } else {
        setDados('QR Code inválido');
        setTimeout(() => setDados('Aguardando QR Code...'), 5000);
      }
    } catch (erro) {
      setDados('QR Code inválido');
      setTimeout(() => setDados('Aguardando QR Code...'), 5000);
    } finally {
      setTimeout(() => {
        setenvDados(false);
        setDados('Aguardando QR Code...');
      }, 5000);
    }
  };

  const processarQRCode = (resultado, erro) => {
    if (scannerAtivo && !envDados && resultado) {
      const dadosEscaneados = resultado?.text;
      presencaAluno(dadosEscaneados);
    }
  };


  //PUT para finalziar a chamada atual
  const finalizarChamada = async () => {
    const token = localStorage.getItem("token");
    const dataHoraFinal = new Date().toISOString();
    const idChamada = localStorage.getItem("id_chamada");
    try {
      const resposta = await fetch("https://projeto-iii-4.vercel.app/chamadas/finalizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          id: idChamada,
          data_hora_final: dataHoraFinal,
        }),
      });
      if (resposta.ok) {
        setDados("Chamada finalizada com sucesso!");
      } else {
        const resultado = await resposta.json();
        setDados(resultado.message || "Erro desconhecido");
      }
    } catch {
      setDados("Erro ao finalizar chamada.");
    } finally {
      setScannerAtivo(false);
      navigate("/home");
      window.location.reload();
    }
  };

  const cardFinalizar = () => {
   setCardFinalizar(true);
  };

  const cancelarFinalizacao = () => {
   setCardFinalizar(false);
  };

  const confirmarFinalicao = () => {
   setCardFinalizar(false);
    finalizarChamada();
  };

  return (
    <div className="App">
      <div className="ContainerLeitor">
        {scannerAtivo && (
          <QrReader
            onResult={processarQRCode}
            className="LeitorQR"
            constraints={{ facingMode: 'environment' }}
          />
        )}
        <div className="Informacao">
          <Typography variant="h6">{dados}</Typography>
        </div>
      </div>
      <Button variant="contained" color="error" onClick={cardFinalizar}>
        Finalizar Chamada
      </Button>

      <Modal open={modalCardFinalizar} onClose={cancelarFinalizacao}>
        <Box className="ModalContainer">
          <Typography variant="h6">
            Deseja mesmo finalizar a chamada agora?
          </Typography>
          <div className="AcoesModal">
            <button
              className="botao botao-confirmar"
              onClick={confirmarFinalicao}
            >
              Confirmar
            </button>
            <button
              className="botao botao-finalizar"
              onClick={cancelarFinalizacao}
            >
              Cancelar
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default LeitorQR;
