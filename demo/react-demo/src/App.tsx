import React, { Component } from 'react'
import styled from 'styled-components'

import './App.less'
import LoggerPanel from './components/Logger'
import Options from './components/Options'
import TerminalPanal from './components/TerminalPanal'

const AppContainer = styled.div`
  height: 100%;
  display: flex;
  padding: 15px;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
`

class App extends Component {
  public render() {
    return (
      <AppContainer>
        <LoggerPanel />
        <Options />
        <TerminalPanal />
      </AppContainer>
    )
  }
}

export default App
