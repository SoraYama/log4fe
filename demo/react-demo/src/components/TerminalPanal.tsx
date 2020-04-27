import React, { useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { connect, ConnectedProps } from 'react-redux'
import { Button, Card, Tag } from 'antd'
import moment, { Moment } from 'moment'
import { CaretDownOutlined } from '@ant-design/icons'

import io from '../lib/io'
import { RootState } from '../lib/store/reducer'
import { LogItem } from '../lib/store/log-list/types'
import { combineLogList } from '../lib/store/log-list/actions'
import { LogConfigState } from '../lib/store/log-config/types'
import { LogLevel } from '../types'
import { LOG_HTTP_URL } from '../lib/constants'

const Container = styled(Card)`
  grid-row: 1 / 3;
  grid-column: 2 / 4;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const TerminalPanelWrapper = styled.div`
  background-color: #333;
  position: relative;
  padding: 5px;
  border: 2px solid gray;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0px 0px 1px 1px #505050;
  height: 100%;
`

const TopBar = styled.div<{ show: boolean }>`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  background-color: rgba(255, 251, 231, 0.8);
  color: #555;
  border-radius: 2px;
  height: 20px;
  padding: 0 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 12px;
  line-height: 20px;
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: opacity ease 1s;
`

const ToBottom = styled(Button)`
  position: absolute;
  bottom: 15px;
  right: 20px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  transition: opacity ease 0.25s;
`

const ColoredSpan = styled.span`
  color: ${(props) => props.color};

  &::after {
    content: ' - ';
  }
`

const LogsWrapper = styled.div`
  overflow-y: scroll;
  height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: rgba(0, 0, 0, 0);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: rgba(220, 220, 220, 0.45);
  }

  p {
    font-family: 'Courier New', Courier, monospace;
    color: #e0e0e0;
  }
`

const colorMap = {
  debug: 'pink',
  info: 'cyan',
  warn: 'orange',
  error: '#ff1e48',
}

const mapState = (state: RootState) => ({
  logs: state.logList,
  config: state.logConfig,
})

const mapDispatch = {
  combineLogList,
}

const connector = connect(mapState, mapDispatch)

type Props = ConnectedProps<typeof connector>

const TerminalPanel = (props: Props) => {
  const { logs, combineLogList, config } = props
  const bottomRef = useRef<HTMLDivElement>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const [isAtBottom, setIsAtBottom] = useState(true)
  useEffect(() => {
    const handler = _.throttle(() => {
      const { scrollHeight, scrollTop, clientHeight } = logContainerRef.current!
      setIsAtBottom(scrollHeight - scrollTop === clientHeight)
    }, 500)
    const ref = logContainerRef.current
    if (ref) {
      ref.addEventListener('scroll', handler)
    }
    return () => {
      ref && ref.removeEventListener('scroll', handler)
    }
  }, [])
  useEffect(() => {
    io.on('log', (e: LogItem[]) => {
      combineLogList(e)
      if (isAtBottom) {
        scrollToBottom()
      }
    })
    return () => {
      io.off('log')
    }
  }, [combineLogList, isAtBottom])
  const filterFunc = (item: LogItem) =>
    _(config)
      .map((v, k) => ({ v, k: k as keyof LogConfigState }))
      .every((i) => {
        if (_.isEmpty(i.v)) {
          return true
        }
        if (i.k === 'time') {
          const [startMoment, endMoment] = i.v as [Moment, Moment]
          return moment(item.time).isBetween(startMoment, endMoment)
        }
        if (typeof i.v === 'string') {
          return RegExp(i.v, 'gi').test(item[i.k])
        }
        if (_.isArray(i.v)) {
          return _.includes(i.v as LogLevel[], item[i.k])
        }
        return false
      })
  const displayLogs = _(logs).filter(filterFunc).value()
  const hideLogAmount = logs.length - displayLogs.length

  return (
    <Container
      bodyStyle={{ padding: 0, height: '100%', flex: '1', overflow: 'hidden' }}
      title="实时后台"
      extra={
        <Tag color="green">
          日志上报地址 - <code>{LOG_HTTP_URL}</code>
        </Tag>
      }
    >
      <TerminalPanelWrapper>
        <TopBar show={hideLogAmount > 0}>{hideLogAmount}条日志被过滤</TopBar>
        <LogsWrapper ref={logContainerRef}>
          {displayLogs.map((log) => (
            <p key={log.id}>
              <ColoredSpan color={colorMap[log.level]}>
                [{new Date(log.time).toLocaleString('zh-CN', { hour12: false })}]
              </ColoredSpan>
              <ColoredSpan color={colorMap[log.level]}>{log.name}</ColoredSpan>
              <ColoredSpan color={colorMap[log.level]}>{log.url}</ColoredSpan>
              <ColoredSpan color={colorMap[log.level]}>{log.reqId}</ColoredSpan>
              <ColoredSpan color={colorMap[log.level]}>{log.level}</ColoredSpan>
              <span> {log.messages.join(' ')}</span>
            </p>
          ))}
          <div ref={bottomRef} />
        </LogsWrapper>
        <ToBottom
          style={{ opacity: isAtBottom ? 0 : 1 }}
          icon={<CaretDownOutlined />}
          type="primary"
          shape="circle"
          onClick={scrollToBottom}
        />
      </TerminalPanelWrapper>
    </Container>
  )
}

export default connector(TerminalPanel)
