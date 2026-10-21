// src/components/visualizapessoa/VisualizarPessoaBack.jsx

import { useEffect, useState } from "react";

import {
  Card,
  Descriptions,
  Button,
  Spin,
  Alert,
  Space
} from "antd";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import PFDAO from "../../objetos/dao/PFDAOBackEnd.mjs";
import PJDAO from "../../objetos/dao/PJDAOBackEnd.mjs";

export default function VisualizarPessoaBack() {

  const { tipo, id } = useParams();

  const navigate = useNavigate();

  // Estados da interface
  const [pessoa, setPessoa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Carrega os dados quando tipo ou id são alterados
  useEffect(() => {

    let ativo = true;

    async function carregarPessoa() {

      setLoading(true);
      setPessoa(null);
      setErro(null);

      try {

        // Verifica o tipo informado na rota
        if (tipo !== "PF" && tipo !== "PJ") {
          throw new Error(
            "Tipo de pessoa inválido."
          );
        }

        // Seleciona o DAO correspondente
        const dao = tipo === "PF"
          ? new PFDAO()
          : new PJDAO();

        // Aguarda a consulta ao backend
        const encontrada = await dao.buscarPorId(id);

        // Atualiza somente se o efeito ainda estiver ativo
        if (ativo) {
          setPessoa(encontrada);
        }

      } catch (error) {

        if (ativo) {
          setErro(error.message);
        }

      } finally {

        if (ativo) {
          setLoading(false);
        }

      }

    }

    carregarPessoa();

    // Evita atualizações de efeitos encerrados
    return () => {
      ativo = false;
    };

  }, [tipo, id]);

  // Enquanto aguarda a resposta do backend
  if (loading) {

    return (

      <div
        style={{
          textAlign: "center",
          marginTop: 50
        }}
      >

        <Spin
          size="large"
          tip="Consultando cadastro..."
        >
          <div style={{ minHeight: 100 }} />
        </Spin>

      </div>

    );

  }

  // Quando ocorre uma falha na consulta
  if (erro) {

    return (

      <div
        style={{
          maxWidth: 800,
          margin: "40px auto"
        }}
      >

        <Alert
          type="error"
          title="Erro ao consultar cadastro"
          description={erro}
          showIcon
        />

        <div
          style={{
            textAlign: "center",
            marginTop: 24
          }}
        >

          <Button
            type="primary"
            onClick={() => navigate("/listar")}
          >
            Voltar à lista
          </Button>

        </div>

      </div>

    );

  }

  // Quando o registro não é encontrado
  if (!pessoa) {

    return (

      <div
        style={{
          textAlign: "center",
          marginTop: 40
        }}
      >

        <h3>Nenhuma pessoa encontrada.</h3>

        <Button
          type="primary"
          onClick={() => navigate("/listar")}
        >
          Voltar à lista
        </Button>

      </div>

    );

  }

  // Apresenta os dados recebidos
  return (

    <div
      style={{
        maxWidth: 800,
        margin: "24px auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >

      <Card
        title={
          `Detalhes da ${
            tipo === "PF"
              ? "Pessoa Física"
              : "Pessoa Jurídica"
          }`
        }
        variant="borderless"
      >

        <Descriptions
          bordered
          column={1}
        >

          <Descriptions.Item label="Nome">
            {pessoa.nome}
          </Descriptions.Item>

          <Descriptions.Item label="E-mail">
            {pessoa.email}
          </Descriptions.Item>

          {tipo === "PF" ? (

            <Descriptions.Item label="CPF">
              {pessoa.cpf}
            </Descriptions.Item>

          ) : (

            <Descriptions.Item label="CNPJ">
              {pessoa.cnpj}
            </Descriptions.Item>

          )}

          <Descriptions.Item label="Endereço">

            {pessoa.endereco?.logradouro || "Não informado"}
            {pessoa.endereco?.bairro
              ? `, ${pessoa.endereco.bairro}`
              : ""}

            {" - "}

            {pessoa.endereco?.cidade || ""}
            {pessoa.endereco?.uf
              ? `/${pessoa.endereco.uf}`
              : ""}

            <div>
              CEP: {pessoa.endereco?.cep || "Não informado"}
            </div>

            <div>
              Região: {pessoa.endereco?.regiao || "Não informada"}
            </div>

          </Descriptions.Item>

          <Descriptions.Item label="Telefones">

            {pessoa.telefones?.length > 0

              ? pessoa.telefones
                  .map(
                    (telefone) =>
                      `(${telefone.ddd}) ${telefone.numero}`
                  )
                  .join(" | ")

              : "Não informado"}

          </Descriptions.Item>

          {tipo === "PF" ? (

            <Descriptions.Item label="Título Eleitoral">

              {pessoa.titulo?.numero

                ? `Nº ${pessoa.titulo.numero} - Zona ${
                    pessoa.titulo.zona
                  } / Seção ${pessoa.titulo.secao}`

                : "Não informado"}

            </Descriptions.Item>

          ) : (

            <Descriptions.Item label="Inscrição Estadual">

              {pessoa.ie?.numero

                ? `Nº ${pessoa.ie.numero} - ${
                    pessoa.ie.estado
                  } (${pessoa.ie.dataRegistro})`

                : "Não informado"}

            </Descriptions.Item>

          )}

        </Descriptions>

        <div
          style={{
            textAlign: "center",
            marginTop: 24
          }}
        >

          <Space>

            <Button
              type="primary"
              onClick={() =>
                navigate(
                  `/editar/${tipo}/${pessoa.id}`
                )
              }
            >
              Editar
            </Button>

            <Button
              onClick={() => navigate("/listar")}
            >
              Voltar
            </Button>

          </Space>

        </div>

      </Card>

    </div>

  );

}