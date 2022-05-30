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

export const YearInput = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
  input {
    padding: 8px !important;
    text-align: center;
    width: 100%;
    flex: 1;
  }

  button {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1;
  }
`

export const Info = styled.p<{ error?: boolean; success?: boolean }>`
  text-align: center;
  margin-top: 16px;
  margin-bottom: 8px;
  color: ${({ error, success }) =>
    error
      ? 'red'
      : success
      ? 'hsl(105.97014925373135, 99.01477832512316%, 39.80392156862745%)'
      : '#333'};
  background-color: ${({ error, success }) =>
    error
      ? 'rgba(255, 0, 0, 0.1)'
      : success
      ? 'rgb(246, 255, 246)'
      : '#f2f2f2'};
  font-weight: 900;
  padding: 8px 16px;
  border-radius: 16px;
`

export const Description = styled.p`
  text-align: center;
  opacity: 0.5;
  font-weight: 700;
  margin-bottom: 16px;
`
