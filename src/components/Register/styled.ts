import styled from 'styled-components/macro'

export const SearchBar = styled.div`
  div {
    display: flex;
    border: 1px solid var(--colors--border);
    border-radius: 14px;
    overflow: hidden;

    :has(input:active),
    :has(input:focus) {
      box-shadow: 0 0 0 2px var(--colors--primary);
    }

    input {
      outline: none;
      padding: 8px 12px;
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
