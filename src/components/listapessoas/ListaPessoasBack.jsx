// src/components/listapessoas/ListaPessoasBack.jsx

import { useEffect, useRef, useState } from "react";

import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Select,
  Spin,
  Alert
} from "antd";

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import PFDAO from "../../objetos/dao/PFDAOBackEnd.mjs";
import PJDAO from "../../objetos/dao/PJDAOBackEnd.mjs";

export default function ListaPessoasBack() {

  const navigate = useNavigate();

  // Estados da interface
  const [tipo, setTipo] = useState("PF");
  const [filtroNome, setFiltroNome] = useState("");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState(null);

  // Preserva as instâncias dos DAOs entre renderizações
  const pfDAO = useRef(new PFDAO()).current;
  const pjDAO = useRef(new PJDAO()).current;

  // Identifica a consulta mais recente
  const consultaAtual = useRef(0);

  // Seleciona o DAO correspondente
  function obterDAO(tipoPessoa) {
    return tipoPessoa === "PF" ? pfDAO : pjDAO;
  }

  // Consulta os registros no backend
  async function carregarLista(tipoPessoa = tipo) {

    const numeroConsulta = ++consultaAtual.current;

    setLoading(true);
    setErro(null);

    try {

      const dao = obterDAO(tipoPessoa);

      // Aguarda o carregamento dos registros
      const lista = await dao.carregarLista();

      // Atualiza somente se esta for a consulta mais recente
      if (numeroConsulta === consultaAtual.current) {
        setDados(lista);
      }

    } catch (error) {

      if (numeroConsulta === consultaAtual.current) {
        setDados([]);
        setErro(error.message);
      }

    } finally {

      if (numeroConsulta === consultaAtual.current) {
        setLoading(false);
      }

    }

  }

  // Carrega os dados ao montar o componente
  // e quando o tipo de pessoa é alterado
  useEffect(() => {

    carregarLista(tipo);

    return () => {
      consultaAtual.current++;
    };

  }, [tipo]);

  // Aplica o filtro sobre os dados já carregados
  const dadosFiltrados = dados.filter((pessoa) => {

    const nome = pessoa.nome || "";

    return nome
      .toLowerCase()
      .includes(filtroNome.toLowerCase());

  });

  // Exclui um registro no backend
  async function excluirPessoa(id) {

    setExcluindoId(id);

    try {

      const dao = obterDAO(tipo);

      // Aguarda a confirmação da exclusão
      await dao.excluir(id);

      message.success(
        "Registro excluído com sucesso!"
      );

      // Atualiza a tabela somente após a exclusão
      await carregarLista(tipo);

    } catch (error) {

      message.error(
        "Não foi possível excluir o registro."
      );

      setErro(error.message);

    } finally {

      setExcluindoId(null);

    }

  }

  // Define as colunas da tabela
  const colunas = [

    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome"
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },

    {
      title: tipo === "PF" ? "CPF" : "CNPJ",
      dataIndex: tipo === "PF" ? "cpf" : "cnpj",
      key: "documento",
      width: 200
    },

    {
      title: "Ações",
      key: "acoes",

      render: (_, record) => (

        <Space>

          <Button
            icon={<EyeOutlined />}
            title="Visualizar"
            onClick={() =>
              navigate(`/visualizar/${tipo}/${record.id}`)
            }
          />

          <Button
            icon={<EditOutlined />}
            title="Editar"
            onClick={() =>
              navigate(`/editar/${tipo}/${record.id}`)
            }
          />

          <Popconfirm
            title="Deseja realmente excluir?"
            description="Esta operação não poderá ser desfeita."
            okText="Sim"
            cancelText="Não"
            onConfirm={() => excluirPessoa(record.id)}
          >

            <Button
              danger
              icon={<DeleteOutlined />}
              title="Excluir"
              loading={excluindoId === record.id}
              disabled={excluindoId !== null}
            />

          </Popconfirm>

        </Space>

      )

    }

  ];

  return (

    <div
      style={{
        maxWidth: 1000,
        margin: "24px auto",
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >

      <h2
        style={{
          textAlign: "center",
          marginBottom: 20
        }}
      >
        Listagem de Pessoas
      </h2>

      <Space
        wrap
        style={{ marginBottom: 20 }}
      >

        <Select
          value={tipo}
          onChange={setTipo}
          style={{ width: 200 }}
          options={[
            {
              value: "PF",
              label: "Pessoa Física"
            },
            {
              value: "PJ",
              label: "Pessoa Jurídica"
            }
          ]}
        />

        <Input
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) =>
            setFiltroNome(e.target.value)
          }
          allowClear
          style={{ width: 300 }}
        />

        <Button
          type="primary"
          loading={loading}
          onClick={() => carregarLista(tipo)}
        >
          Atualizar
        </Button>

      </Space>

      {erro && (

        <Alert
          type="error"
          title="Erro na operação"
          description={erro}
          showIcon
          closable
          style={{ marginBottom: 20 }}
          onClose={() => setErro(null)}
        />

      )}

      {loading ? (

        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            marginBottom: 40
          }}
        >

          <Spin
            size="large"
            tip="Consultando pessoas..."
          >
            <div style={{ minHeight: 100 }} />
          </Spin>

        </div>

      ) : (

        <Table
          dataSource={dadosFiltrados}
          columns={colunas}
          rowKey="id"
          pagination={{ pageSize: 6 }}
          loading={excluindoId !== null}
        />

      )}

    </div>

  );

}