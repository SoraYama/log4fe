import React, { useState } from 'react'
import { Button, Input, Form, Card, Radio, Select, Tag } from 'antd'
import styled from 'styled-components'
import { LoggerLevel } from 'log4fe'

import log4fe from '../lib/log'

const Container = styled(Card)`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
`

function LoggerPanel() {
  const [form] = Form.useForm()
  const initialValues = {
    loggerLevel: 'info',
    loggerName: '',
    loggerContent: '',
    logLevel: 'info',
  }

  const handleLogLevelChange = (value: LoggerLevel) => {
    form.setFieldsValue({ logLevel: value })
  }

  const handleClickLog = () => {
    const fields = form.getFieldsValue()
    const { loggerName, logContent, loggerLevel, logLevel } = fields
    const logger = log4fe.getLogger(loggerName, { enabled: true, level: loggerLevel })
    logger.setLevel(loggerLevel)
    logger[logLevel as LoggerLevel](logContent)
  }

  const [loggerName, setLoggerName] = useState('')
  const [logContent, setLogContent] = useState('')

  const cutText = (text: string) => (text.length <= 20 ? text : `${text.slice(0, 20)}...`)

  return (
    <Container title="触发日志">
      <Form colon={false} form={form} initialValues={initialValues}>
        <Form.Item name="loggerName" label="日志名称">
          <Input onChange={(e) => setLoggerName(e.target.value)} placeholder="请输入日志名" />
        </Form.Item>
        <Form.Item name="logContent" label="日志内容">
          <Input
            onChange={(e) => setLogContent(cutText(e.target.value))}
            placeholder="请输入日志内容"
          />
        </Form.Item>
        <Form.Item name="loggerLevel" label="日志级别">
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="debug">Debug</Radio.Button>
            <Radio.Button value="info">Info</Radio.Button>
            <Radio.Button value="warn">Warn</Radio.Button>
            <Radio.Button value="error">Error</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="logLevel" label="触发日志">
          <Tag color="geekblue">
            <code>log4fe.getLogger("{loggerName}").</code>
            <Select
              defaultValue={'info'}
              onChange={handleLogLevelChange}
              size="small"
              style={{ width: 80 }}
            >
              <Select.Option value="debug">
                <code>debug</code>
              </Select.Option>
              <Select.Option value="info">
                <code>info</code>
              </Select.Option>
              <Select.Option value="warn">
                <code>warn</code>
              </Select.Option>
              <Select.Option value="error">
                <code>error</code>
              </Select.Option>
            </Select>
            <code>("{logContent}")</code>
          </Tag>
        </Form.Item>
        <Button type="primary" block onClick={() => handleClickLog()}>
          <code>触发</code>
        </Button>
      </Form>
    </Container>
  )
}

export default LoggerPanel
