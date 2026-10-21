// src/components/cadastrapessoa/PessoaFormBack.jsx

import { useEffect, useRef, useState } from "react";

import {
  Form,
  Input,
  Button,
  Radio,
  Spin,
  Alert,
  message
} from "antd";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import dayjs from "dayjs";

// Componentes reaproveitados
import EnderecoForm from "./EnderecoFormEX.jsx";
import TelefoneList from "./TelefoneListOO.jsx";
import PFForm from "./PFForm.jsx";
import PJForm from "./PJForm.jsx";

// DAOs de backend
import PFDAO from "../../objetos/dao/PFDAOBackEnd.mjs";
import PJDAO from "../../objetos/dao/PJDAOBackEnd.mjs";

// Classes de domínio
import PF from "../../objetos/pessoas/PF.mjs";
import PJ from "../../objetos/pessoas/PJ.mjs";
import Endereco from "../../objetos/pessoas/Endereco.mjs";
import Telefone from "../../objetos/pessoas/Telefone.mjs";
import Titulo from "../../objetos/pessoas/Titulo.mjs";
import IE from "../../objetos/pessoas/IE.mjs";

export default function PessoaFormBack() {

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const { tipo: tipoParam, id } = useParams();

  // Estados da interface
  const [tipo, setTipo] = useState("PF");
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  // Preserva as instâncias dos DAOs
  const pfDAO = useRef(new PFDAO()).current;
  const pjDAO = useRef(new PJDAO()).current;

  // Identifica o modo de edição
  const editando = Boolean(id);

  // Seleciona o DAO correspondente
  function obterDAO(tipoPessoa) {

    return tipoPessoa === "PF"
      ? pfDAO
      : pjDAO;

  }

  // ===================================================
  // CARREGAMENTO DOS DADOS NO MODO EDIÇÃO
  // ===================================================

  useEffect(() => {

    let ativo = true;

    async function carregarEdicao() {

      // Modo cadastro
      if (!id) {

        setTipo("PF");
        setErro(null);
        setLoading(false);

        form.resetFields();
        form.setFieldsValue({ tipo: "PF" });

        return;

      }

      // Modo edição
      setLoading(true);
      setErro(null);

      try {

        if (tipoParam !== "PF" && tipoParam !== "PJ") {
          throw new Error(
            "Tipo de pessoa inválido."
          );
        }

        setTipo(tipoParam);

        const dao = obterDAO(tipoParam);

        // Aguarda a consulta ao backend
        const pessoa = await dao.buscarPorId(id);

        if (!ativo) {
          return;
        }

        if (!pessoa) {
          throw new Error(
            "Pessoa não encontrada."
          );
        }

        // Prepara os valores para o Ant Design Form
        const valores = {
          tipo: tipoParam,
          nome: pessoa.nome,
          email: pessoa.email,
          endereco: pessoa.endereco || {},
          telefones: pessoa.telefones || []
        };

        if (tipoParam === "PF") {

          valores.cpf = pessoa.cpf;

          valores.titulo = pessoa.titulo || {
            numero: "",
            zona: "",
            secao: ""
          };

        } else {

          const ieObj = pessoa.ie || {};

          valores.cnpj = pessoa.cnpj;

          valores.ie = {
            numero: ieObj.numero || "",
            estado: ieObj.estado || "",

            dataRegistro: ieObj.dataRegistro
              ? dayjs(ieObj.dataRegistro)
              : null
          };

        }

        form.resetFields();
        form.setFieldsValue(valores);

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

    carregarEdicao();

    return () => {
      ativo = false;
    };

  }, [id, tipoParam, form]);

  // ===================================================
  // ALTERAÇÃO DO TIPO DE PESSOA
  // ===================================================

  function onChangeTipo(e) {

    const novoTipo = e.target.value;

    setTipo(novoTipo);

    // Preserva os campos comuns
    const valoresAtuais = form.getFieldsValue();

    form.resetFields();

    form.setFieldsValue({
      nome: valoresAtuais.nome,
      email: valoresAtuais.email,
      endereco: valoresAtuais.endereco,
      telefones: valoresAtuais.telefones,
      tipo: novoTipo
    });

  }

  // ===================================================
  // CONSTRUÇÃO DO OBJETO DE DOMÍNIO
  // ===================================================

  function construirPessoa(values) {

    const endVals = values.endereco || {};

    // Cria o objeto Endereco
    const endereco = new Endereco();

    endereco.setCep(endVals.cep);
    endereco.setLogradouro(endVals.logradouro);
    endereco.setBairro(endVals.bairro);
    endereco.setCidade(endVals.cidade);
    endereco.setUf(endVals.uf);
    endereco.setRegiao(endVals.regiao);

    // Cria o objeto PF ou PJ
    let pessoa;

    if (values.tipo === "PF") {

      const pf = new PF();

      pf.setNome(values.nome);
      pf.setEmail(values.email);
      pf.setCPF(values.cpf);
      pf.setEndereco(endereco);

      // Título Eleitoral
      if (values.titulo) {

        const titulo = new Titulo();

        titulo.setNumero(values.titulo.numero);
        titulo.setZona(values.titulo.zona);
        titulo.setSecao(values.titulo.secao);

        pf.setTitulo(titulo);

      }

      pessoa = pf;

    } else {

      const pj = new PJ();

      pj.setNome(values.nome);
      pj.setEmail(values.email);
      pj.setCNPJ(values.cnpj);
      pj.setEndereco(endereco);

      // Inscrição Estadual
      if (values.ie) {

        const ie = new IE();

        ie.setNumero(values.ie.numero);
        ie.setEstado(values.ie.estado);

        const data = values.ie.dataRegistro;

        const dataRegistro =
          data && typeof data.format === "function"
            ? data.format("YYYY-MM-DD")
            : data || "";

        ie.setDataRegistro(dataRegistro);

        pj.setIE(ie);

      }

      pessoa = pj;

    }

    // Telefones
    if (values.telefones?.length > 0) {

      values.telefones.forEach((tel) => {

        const telefone = new Telefone();

        telefone.setDdd(tel.ddd);
        telefone.setNumero(tel.numero);

        pessoa.addTelefone(telefone);

      });

    }

    return pessoa;

  }

  // ===================================================
  // CADASTRO E ATUALIZAÇÃO
  // ===================================================

  async function onFinish(values) {

    if (salvando) {
      return;
    }

    setSalvando(true);
    setErro(null);

    try {

      // Constrói a instância de PF ou PJ
      const pessoa = construirPessoa(values);

      // Seleciona o DAO
      const tipoPessoa = editando
        ? tipoParam
        : values.tipo;

      const dao = obterDAO(tipoPessoa);

      if (editando) {

        // Requisição PUT
        await dao.atualizar(id, pessoa);

        message.success(
          "Registro atualizado com sucesso!"
        );

      } else {

        // Requisição POST
        await dao.salvar(pessoa);

        message.success(
          "Registro criado com sucesso!"
        );

      }

      // Retorna à listagem após confirmação
      navigate("/listar");

    } catch (error) {

      console.error(
        "Erro ao salvar registro:",
        error
      );

      setErro(error.message);

      message.error(
        "Não foi possível salvar o registro."
      );

    } finally {

      setSalvando(false);

    }

  }

  // ===================================================
  // INDICADOR DE CARREGAMENTO DA EDIÇÃO
  // ===================================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        <Spin
          size="large"
          tip="Carregando cadastro..."
        >
          <div style={{ minHeight: 100, width: 240 }} />
        </Spin>

      </div>

    );

  }

  // ===================================================
  // FORMULÁRIO DE CADASTRO / EDIÇÃO
  // ===================================================

  return (

    <div
      className="main-scroll"
      style={{
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: "100vh",
        background: "#f9f9f9"
      }}
    >

      <div
        className="form-container"
        style={{
          maxWidth: 800,
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

          {editando
            ? `Editar ${
                tipo === "PF"
                  ? "Pessoa Física"
                  : "Pessoa Jurídica"
              }`
            : `Cadastro de ${
                tipo === "PF"
                  ? "Pessoa Física"
                  : "Pessoa Jurídica"
              }`}

        </h2>

        {erro && (

          <Alert
            type="error"
            title="Erro na operação"
            description={erro}
            showIcon
            style={{ marginBottom: 20 }}
          />

        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ tipo: "PF" }}
          disabled={salvando || (editando && Boolean(erro))}
        >

          {/* Tipo de Pessoa */}

          <Form.Item
            label="Tipo de Pessoa"
            name="tipo"
          >

            <Radio.Group
              onChange={onChangeTipo}
              disabled={editando}
            >

              <Radio value="PF">
                Pessoa Física
              </Radio>

              <Radio value="PJ">
                Pessoa Jurídica
              </Radio>

            </Radio.Group>

          </Form.Item>

          {/* Nome */}

          <Form.Item
            label="Nome"
            name="nome"
            rules={[
              {
                required: true,
                message: "Informe o nome!"
              }
            ]}
          >

            <Input
              placeholder="Nome completo ou razão social"
            />

          </Form.Item>

          {/* E-mail */}

          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              {
                required: true,
                message: "Informe o e-mail!"
              },
              {
                type: "email",
                message: "Formato inválido!"
              }
            ]}
          >

            <Input />

          </Form.Item>

          {/* CPF ou CNPJ */}

          {tipo === "PF" ? (

            <Form.Item
              label="CPF"
              name="cpf"
              rules={[
                {
                  required: true,
                  message: "Informe o CPF!"
                }
              ]}
            >

              <Input
                maxLength={11}
                placeholder="Somente números"
              />

            </Form.Item>

          ) : (

            <Form.Item
              label="CNPJ"
              name="cnpj"
              rules={[
                {
                  required: true,
                  message: "Informe o CNPJ!"
                }
              ]}
            >

              <Input
                maxLength={18}
                placeholder="Somente números"
              />

            </Form.Item>

          )}

          {/* Componentes reaproveitados */}

          <EnderecoForm />

          <TelefoneList form={form} />

          {tipo === "PF"
            ? <PFForm />
            : <PJForm />}

          {/* Botão Salvar */}

          <Form.Item
            style={{ marginTop: 20 }}
          >

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={salvando}
            >

              {editando
                ? "Salvar Alterações"
                : "Salvar"}

            </Button>

          </Form.Item>

        </Form>

        {/* Navegação */}

        <Button
          block
          disabled={salvando}
          onClick={() => navigate("/listar")}
        >
          {editando ? "Cancelar" : "Voltar"}
        </Button>

      </div>

    </div>

  );

}