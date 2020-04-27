import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { DeleteOutlined, RedoOutlined } from '@ant-design/icons'
import { Card, Form, Select, Button, Input, DatePicker } from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { clearLogList } from '../lib/store/log-list/actions'
import { updateLogConfig, resetLogConfig } from '../lib/store/log-config/actions'

const OptionsContainer = styled(Card)`
  grid-row: 1 / 2;
  grid-column: 1 / 2;
`

const StyledForm = styled(Form)`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(2, 1fr);
`

const levels = ['debug', 'info', 'warn', 'error']

const mapDispatch = {
  clear: clearLogList,
  reset: resetLogConfig,
  setConfig: updateLogConfig,
}

const connector = connect(() => ({}), mapDispatch)

const Options = (props: ConnectedProps<typeof connector>) => {
  const { clear, setConfig, reset } = props
  const [form] = Form.useForm()

  const levelOptions = levels.map((level) => ({
    value: level,
  }))

  const dispatchConfigChange = _.debounce(() => {
    const feilds = form.getFieldsValue()
    setConfig(feilds)
  }, 500)

  return (
    <OptionsContainer title="日志选项" bordered={true}>
      <StyledForm colon={false} form={form}>
        <Form.Item style={{ gridColumn: '1 / 3' }} name="url" label="URL">
          <Input placeholder="请输入URL" onChange={dispatchConfigChange} />
        </Form.Item>
        <Form.Item style={{ gridColumn: '1 / 3' }} name="reqId" label="请求ID">
          <Input placeholder="请输入请求ID" onChange={dispatchConfigChange} />
        </Form.Item>
        <Form.Item style={{ gridColumn: '1 / 3' }} name="dateTimeRange" label="时间选择">
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            showTime={{ format: 'HH:mm:ss' }}
            onChange={dispatchConfigChange}
          />
        </Form.Item>
        <Form.Item name="level" label="级别">
          <Select
            placeholder="请选择日志级别"
            onChange={dispatchConfigChange}
            options={levelOptions}
            mode="multiple"
          />
        </Form.Item>
        <Form.Item name="name" label="名字">
          <Input placeholder="请输入日志名字" onChange={dispatchConfigChange} />
        </Form.Item>
      </StyledForm>
      <Button icon={<RedoOutlined />} block onClick={reset}>
        重置
      </Button>
      <Button
        icon={<DeleteOutlined />}
        style={{ marginTop: 15 }}
        block
        type="danger"
        onClick={clear}
      >
        清除日志
      </Button>
    </OptionsContainer>
  )
}

export default connector(Options)
