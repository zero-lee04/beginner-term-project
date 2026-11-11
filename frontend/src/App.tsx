import {
  useState,
  type CSSProperties } from 'react'
import './App.css'

type Team = {
  id: string
  name: string
  shortName: string
  mark: string
  accent: string
  motto: string
}

const teams: Team[] = [
  { id: 't1',
    name: 'T1',
    shortName: 'T1',
    mark: 'T1',
    accent: '#e84048',
    motto: 'T1' },
  { id: 'gen-g',
    name: 'Gen.G',
    shortName: 'Gen.G',
    mark: 'G',
    accent: '#cfaa43',
    motto: 'GEN.G'
  },
  { id: 'hle',
    name: 'Hanwha Life Esports',
    shortName: 'HLE',
    mark: 'H',
    accent: '#ff702d',
    motto: 'HLE'
  },
  { id: 'kt',
    name: 'KT Rolster',
    shortName: 'KT',
    mark: 'K',
    accent: '#ed2939',
    motto: 'KT'
  },
  { id: 'DK',
    name: 'Dplus KIA',
    shortName: 'DK',
    mark: 'D',
    accent: '#7e9cff',
    motto: 'DK'
  },
  { id: 'fearx',
    name: 'BNK FEARX',
    shortName: 'FEARX',
    mark: 'F',
    accent: '#ff8a28',
    motto: 'FEARX'
  },
  { id: 'drx',
    name: 'DRX',
    shortName: 'DRX',
    mark: 'D',
    accent: '#5b9dff',
    motto: 'DRX'
  },
  { id: 'nongshim',
    name: 'NS RedForce',
    shortName: 'NS',
    mark: 'N',
    accent: '#e53d48',
    motto: 'NS'
  },
  {
    id: 'brion',
    name: 'OK BRION',
    shortName: 'BRION',
    mark: 'B',
    accent: '#70bd56',
    motto: 'BRION'
  },
  {
    id: 'freecs',
    name: 'DN Freecs',
    shortName: 'DNF',
    mark: 'F',
    accent: '#e3a747',
    motto: 'FREECS'
  }
]