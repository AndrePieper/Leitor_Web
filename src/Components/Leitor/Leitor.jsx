import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { useNavigate } from 'react-router-dom'; 
import { Button, Modal, Box, Typography } from '@mui/material'; 
import './Leitor.css';

function LeitorQR() {
  const [dados, setDados] = useState('Aguardando QR Code');
  const [scannerAtivo, setScannerAtivo] = useState(true);
  const [enviandoDados, setEnviandoDados] = useState(false); 
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false); 
  const [idChamada] = useState(localStorage.getItem("id_chamada")); 
  const navigate = useNavigate(); 
  
  const presencaAluno = async (dadosQR) => {
    try {
      const dadosJson = JSON.parse(dadosQR);
  
      if (dadosJson.id_aluno && dadosJson.hora_post) {
        setEnviandoDados(true); 
        const token = localStorage.getItem("token");
  
        const resposta = await fetch('https://projeto-iii-4.vercel.app/chamada/alunos', {
          method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token, 
        },
        body: JSON.stringify({
          id_aluno: `${dadosJson.id_aluno}`, 
          hora_post: dadosJson.hora_post,
          id_chamada: idChamada,
        }),
      });
  
        if (resposta.ok) {
          const resultado = await resposta.json();
          setDados(`Horário de chamada registrado com sucesso para o aluno ${resultado.nome}`);
        } else {
          const resultado = await resposta.json();
          setDados(resultado.message);
        }
      } else {
        console.log(dadosQR); 
        setDados('QR Code inválido');
        setTimeout(() => setDados('Aguardando QR Code'), 3000); 
      }
    } catch (erro) {
      console.error(erro); 
      setDados('QR Code inválido');
      setTimeout(() => setDados('Aguardando QR Code'), 3000); 
    } finally {
      setTimeout(() => {
        setEnviandoDados(false);
      }, 3000); 
    }
  };

  const processarQRCode = (resultado, erro) => {
    if (scannerAtivo && !enviandoDados && resultado) {
      const dadosEscaneados = resultado?.text;
      console.log(dadosEscaneados); 
      presencaAluno(dadosEscaneados);
    }
  };
  
  const finalizarChamada = async () => {
    const token = localStorage.getItem("token");
    const dataHoraFinal = new Date().toISOString();
    const idChamada = localStorage.getItem("id_chamada");
  
    console.log("Finalizando chamada:", {
      id: idChamada,
      data_hora_final: dataHoraFinal,
      token,
    });
  
    try {
      const resposta = await fetch("https://projeto-iii-4.vercel.app/chamadas/finalizar", {
        method: "POST",
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
        const resultado = await resposta.json();
        console.log("Chamada finalizada com sucesso:", resultado);
        setDados("Chamada finalizada com sucesso!");
      } else {
        const resultado = await resposta.json();
        console.warn("Erro ao finalizar chamada:", resultado.message || resultado);
        setDados(`Erro ao finalizar chamada: ${resultado.message || "Erro desconhecido"}`);
      }
    } catch (erro) {
      console.error("Erro ao finalizar chamada:", erro);
      setDados("Erro ao finalizar chamada.");
    } finally {
      setScannerAtivo(false);
      navigate("/home");
      window.location.reload();
    }
  };

  const mostrarModalFinalizarChamada = () => {
    setMostrarModalConfirmacao(true);
  };

  const cancelarFinalizacao = () => {
    setMostrarModalConfirmacao(false);
  };

  const confirmarFinalizarChamada = () => {
    setMostrarModalConfirmacao(false);
    finalizarChamada();
  };

  useEffect(() => {
    if (!scannerAtivo) {
    }
  }, [scannerAtivo]);

  return (
    <div className="App">
      <div className="LeitorContainer">
        {scannerAtivo && (
          <QrReader
            onResult={processarQRCode}
            className="LeitorQR"
            constraints={{ facingMode: 'environment' }} 
          />
        )}
        <div className="Info">
          <Typography variant="h6">{dados}</Typography>
        </div>
      </div>

      <Button variant="contained" color="error" onClick={mostrarModalFinalizarChamada}>
        Finalizar Chamada
      </Button>

      <Modal
        open={mostrarModalConfirmacao}
        onClose={cancelarFinalizacao}
      >
        <Box className="ModalContainer">
          <Typography variant="h6">Deseja mesmo finalizar a chamada agora?</Typography>
          <div className="ModalActions">
            <Button variant="contained" color="success" onClick={confirmarFinalizarChamada}>
              Confirmar
            </Button>
            <Button variant="contained" color="error" onClick={cancelarFinalizacao}>
              Cancelar
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default LeitorQR;
