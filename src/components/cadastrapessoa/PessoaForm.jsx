import React, { useEffect, useState } from 'react';

import { Form, Input, Button, Radio, DatePicker, message } from 'antd';

import { ArrowUpOutlined } from '@ant-design/icons';

import EnderecoForm from './EnderecoForm.jsx';
import TelefoneList from './TelefoneList.jsx';

import './pessoaform.css';

export default function PessoaForm() {
  const [form] = Form.useForm();

  const [tipoPessoa, setTipoPessoa] = useState('PF');

  const [mostrarTopo, setMostrarTopo] = useState(false);

  const onChangeTipo = (e) => {
    const novoTipo = e.target.value;

    setTipoPessoa(novoTipo);

    form.setFieldValue('tipo', novoTipo);
  };

  const onFinish = (values) => {
    console.log('Dados cadastrados:', values);

    message.success('Cadastro realizado com sucesso!');
  };

  useEffect(() => {
    function verificarRolagem() {
      setMostrarTopo(window.scrollY > 200);
    }

    window.addEventListener('scroll', verificarRolagem);

    return () => {
      window.removeEventListener('scroll', verificarRolagem);
    };
  }, []);

  function voltarAoTopo() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <main className="main-scroll">
      <div className="form-container">
        <h2>Cadastro de Pessoas</h2>

        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            label="Tipo de Pessoa"
            name="tipo"
            initialValue="PF"
            style={{
              marginBottom: 10,
            }}
          >
            <Radio.Group onChange={onChangeTipo}>
              <Radio value="PF">Pessoa Física</Radio>

              <Radio value="PJ">Pessoa Jurídica</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={tipoPessoa === 'PF' ? 'Nome' : 'Razão Social'}
            name="nome"
            rules={[
              {
                required: true,
                message: 'Informe o nome!',
              },
            ]}
          >
            <Input
              placeholder={
                tipoPessoa === 'PF' ? 'Nome completo' : 'Razão social'
              }
            />
          </Form.Item>

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

          {tipoPessoa === 'PF' ? (
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
              <Input placeholder="CPF" maxLength={14} />
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
              <Input placeholder="CNPJ" maxLength={18} />
            </Form.Item>
          )}

          <Form.Item
            label={
              tipoPessoa === 'PF' ? 'Data de Nascimento' : 'Data de Fundação'
            }
            name="data"
            rules={[
              {
                required: true,
                message: 'Informe a data!',
              },
            ]}
          >
            <DatePicker
              style={{
                width: '100%',
              }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <EnderecoForm />

          <TelefoneList />

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Cadastrar
            </Button>
          </Form.Item>
        </Form>
      </div>

      {mostrarTopo && (
        <button
          className="scroll-top-button"
          onClick={voltarAoTopo}
          aria-label="Voltar ao topo"
        >
          <ArrowUpOutlined />
        </button>
      )}
    </main>
  );
}
