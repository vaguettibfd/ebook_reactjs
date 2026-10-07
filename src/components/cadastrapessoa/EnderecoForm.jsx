import React from 'react';

import { Form, Input, Row, Col, Select } from 'antd';

const { Option } = Select;

export default function EnderecoForm() {
  return (
    <>
      <h3>Endereço</h3>

      <Row gutter={8}>
        <Col span={12}>
          <Form.Item
            label="Cidade"
            name={['endereco', 'cidade']}
            rules={[
              {
                required: true,
                message: 'Informe a cidade!',
              },
            ]}
          >
            <Input placeholder="Cidade" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label="UF"
            name={['endereco', 'uf']}
            rules={[
              {
                required: true,
                message: 'Informe a UF!',
              },
            ]}
          >
            <Input placeholder="UF" maxLength={2} />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            label="Região"
            name={['endereco', 'regiao']}
            rules={[
              {
                required: true,
                message: 'Selecione a região!',
              },
            ]}
          >
            <Select placeholder="Selecione">
              <Option value="Norte">Norte</Option>

              <Option value="Nordeste">Nordeste</Option>

              <Option value="Centro-Oeste">Centro-Oeste</Option>

              <Option value="Sudeste">Sudeste</Option>

              <Option value="Sul">Sul</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
