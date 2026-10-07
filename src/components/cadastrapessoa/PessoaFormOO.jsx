import React, { useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';

// Componentes do formulário
import EnderecoForm from './EnderecoFormEX.jsx';
import TelefoneList from './TelefoneListOO.jsx';
import PFForm from './PFForm.jsx';
import PJForm from './PJForm.jsx';

// Classes de domínio
import PF from '../../objetos/pessoas/PF.mjs';
import PJ from '../../objetos/pessoas/PJ.mjs';
import Endereco from '../../objetos/pessoas/Endereco.mjs';
import Telefone from '../../objetos/pessoas/Telefone.mjs';
import Titulo from '../../objetos/pessoas/Titulo.mjs';
import IE from '../../objetos/pessoas/IE.mjs';

// DAOs
import PFDAO from '../../objetos/dao/PFDAOLocal.mjs';
import PJDAO from '../../objetos/dao/PJDAOLocal.mjs';

export default function PessoaFormOO() {
  const [form] = Form.useForm();
  const [tipo, setTipo] = useState('PF');

  // =========================
  // TROCA PF/PJ
  // =========================

  function onChangeTipo(e) {
    const novoTipo = e.target.value;

    setTipo(novoTipo);

    const valoresAtuais = form.getFieldsValue();

    form.resetFields();

    form.setFieldsValue({
      ...valoresAtuais,
      tipo: novoTipo,
    });
  }

  // =========================
  // SALVAR
  // =========================

  function onFinish(values) {
    try {
      let pessoa;

      // =========================
      // ENDEREÇO
      // =========================

      const endVals = values.endereco || {};

      const end = new Endereco();

      end.setCep(endVals.cep);
      end.setLogradouro(endVals.logradouro);
      end.setBairro(endVals.bairro);
      end.setCidade(endVals.cidade);
      end.setUf(endVals.uf);
      end.setRegiao(endVals.regiao);

      // =========================
      // PESSOA FÍSICA
      // =========================

      if (values.tipo === 'PF') {
        const pf = new PF();

        pf.setNome(values.nome);
        pf.setEmail(values.email);
        pf.setCPF(values.cpf);
        pf.setEndereco(end);

        // Título eleitoral
        if (values.titulo) {
          const titulo = new Titulo();

          titulo.setNumero(values.titulo.numero);

          titulo.setZona(values.titulo.zona);

          titulo.setSecao(values.titulo.secao);

          pf.setTitulo(titulo);
        }

        // Telefones
        if (values.telefones?.length > 0) {
          values.telefones.forEach((tel) => {
            const fone = new Telefone();

            fone.setDdd(tel.ddd);

            fone.setNumero(tel.numero);

            pf.addTelefone(fone);
          });
        }

        pessoa = pf;
      }

      // =========================
      // PESSOA JURÍDICA
      // =========================
      else {
        const pj = new PJ();

        pj.setNome(values.nome);
        pj.setEmail(values.email);
        pj.setCNPJ(values.cnpj);
        pj.setEndereco(end);

        // Inscrição Estadual
        if (values.ie) {
          const ie = new IE();

          ie.setNumero(values.ie.numero);

          ie.setEstado(values.ie.estado);

          /*
           * O DatePicker do Ant Design trabalha
           * com um objeto de data.
           *
           * Antes da persistência, convertemos
           * o valor para YYYY-MM-DD.
           */
          const dr = values.ie.dataRegistro;

          const dataRegistro =
            dr && typeof dr === 'object' && typeof dr.format === 'function'
              ? dr.format('YYYY-MM-DD')
              : dr || '';

          ie.setDataRegistro(dataRegistro);

          pj.setIE(ie);
        }

        // Telefones
        if (values.telefones?.length > 0) {
          values.telefones.forEach((tel) => {
            const fone = new Telefone();

            fone.setDdd(tel.ddd);

            fone.setNumero(tel.numero);

            pj.addTelefone(fone);
          });
        }

        pessoa = pj;
      }

      // =========================
      // PERSISTÊNCIA
      // =========================

      const dao = values.tipo === 'PF' ? new PFDAO() : new PJDAO();

      dao.salvar(pessoa);

      message.success('Pessoa cadastrada com sucesso!');

      form.resetFields();
      setTipo('PF');
    } catch (erro) {
      console.error('Erro ao salvar:', erro);

      message.error('Erro ao salvar registro: ' + erro.message);
    }
  }

  // =========================
  // INTERFACE
  // =========================

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '24px auto',
        padding: 24,
      }}
    >
      <h2>Cadastro de Pessoa</h2>

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        scrollToFirstError
      >
        {/* Tipo de pessoa */}

        <Form.Item label="Tipo de Pessoa" name="tipo" initialValue="PF">
          <Radio.Group onChange={onChangeTipo}>
            <Radio value="PF">Pessoa Física</Radio>

            <Radio value="PJ">Pessoa Jurídica</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Nome */}

        <Form.Item
          label="Nome"
          name="nome"
          rules={[
            {
              required: true,
              message: 'Informe o nome!',
            },
          ]}
        >
          <Input placeholder={'Nome completo ou razão social'} />
        </Form.Item>

        {/* E-mail */}

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Informe o e-mail!',
            },
            {
              type: 'email',
              message: 'Formato de e-mail inválido!',
            },
          ]}
        >
          <Input placeholder="exemplo@email.com" />
        </Form.Item>

        {/* CPF ou CNPJ */}

        {tipo === 'PF' ? (
          <Form.Item
            label="CPF"
            name="cpf"
            rules={[
              {
                required: true,
                message: 'Informe o CPF!',
              },
            ]}
          >
            <Input placeholder="Somente números" maxLength={11} />
          </Form.Item>
        ) : (
          <Form.Item
            label="CNPJ"
            name="cnpj"
            rules={[
              {
                required: true,
                message: 'Informe o CNPJ!',
              },
            ]}
          >
            <Input placeholder="Somente números" maxLength={18} />
          </Form.Item>
        )}

        {/* Endereço */}

        <EnderecoForm />

        {/* Telefones */}

        <TelefoneList />

        {/* Dados específicos */}

        {tipo === 'PF' ? <PFForm /> : <PJForm />}

        {/* Salvar */}

        <Form.Item style={{ marginTop: 20 }}>
          <Button type="primary" htmlType="submit" block>
            Salvar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
