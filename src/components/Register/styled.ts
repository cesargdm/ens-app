import styled from 'styled-components/macro'

export const InputContainer = styled.div`
  div {
    display: flex;

    svg {
      top: calc(50% - 11px);
      left: 10px;
      position: absolute;
    }

    input {
      outline: none;
      padding: 8px 12px 8px 40px;
      width: 100%;
      display: block;
      border: 1px solid var(--colors--border);

      :focus {
        box-shadow: 0 0 0 3px var(--colors--primary);
      }
    }

    button {
      border-radius: 0;
      color: white;
      background-color: #ddd;
      border-radius: 0;

      :enabled {
        background-color: var(--colors--primary);
      }
    }
  }

  input {
    border: none;
  }
`
