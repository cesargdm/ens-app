import styled from 'styled-components/macro'

const Button = styled.button<{ pulse?: boolean }>`
  background-color: var(--colors--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  :disabled {
    opacity: 0.5;
  }

  :active {
    transform: scale(0.98);
  }

  svg {
    height: 16px;
    width: 16px;
    stroke-width: 3px;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  ${({ pulse }) => pulse && `animation: pulse 1.5s infinite`}
`

export default Button
