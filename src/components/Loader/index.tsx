import styled from 'styled-components/macro'

import { ReactComponent as FeatherLoader } from './spinner.svg'

const Loader = styled(FeatherLoader)`
  right: 16px !important;
  left: auto !important;
  animation: spin 0.7s steps(8) infinite;
  will-change: transform;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }
`

export default Loader
