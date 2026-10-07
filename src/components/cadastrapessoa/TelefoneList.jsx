import React, { useState } from 'react';

import { Form, Input, Button, Space, List } from 'antd';

export default function TelefoneList() {
  const [ddd, setDdd] = useState('');
  const [numero, setNumero] = useState('');
  const [telefones, setTelefones] = useState([]);

  function adicionarTelefone() {
    if (!ddd || !numero) {
      return;
    }

    const novoTelefone = {
      ddd,
      numero,
    };

    setTelefones([...telefones, novoTelefone]);

    setDdd('');
    setNumero('');
  }

  return (
    <>
      <h3>Telefones</h3>

      <Space align="baseline">
        <Form.Item label="DDD">
          <Input
            value={ddd}
            onChange={(e) => setDdd(e.target.value)}
            maxLength={2}
          />
        </Form.Item>

        <Form.Item label="Número">
          <Input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            maxLength={9}
          />
        </Form.Item>

        <Button onClick={adicionarTelefone} type="primary">
          Adicionar
        </Button>
      </Space>

      <List
        size="small"
        bordered
        dataSource={telefones}
        renderItem={(telefone, index) => (
          <List.Item key={index}>
            ({telefone.ddd}) {telefone.numero}
          </List.Item>
        )}
        style={{
          marginTop: 10,
        }}
      />
    </>
  );
}
