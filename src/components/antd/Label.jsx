import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export default function Label({ texto }) {
  return (
    <Text
      strong
      style={{
        fontSize: 20,
        color: '#333',
      }}
    >
      {texto}
    </Text>
  );
}
