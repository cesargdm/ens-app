import styled from 'styled-components/macro'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export const DropDownItem = styled(DropdownMenu.Item)`
  padding: 8px;
  border-radius: 12px;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;

  &[data-disabled] {
    opacity: 0.5;
  }
  :hover:not([data-disabled]) {
    background-color: var(--colors--primary-translucent);
  }
`

export const DomainItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 16px;

  :hover {
    background-color: #fafafa;
  }
`

export const MenuContent = styled(DropdownMenu.Content)`
  background-color: var(--colors--background);
  padding: 4px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
`

export const AvatarImg = styled.img`
  width: 40;
  height: 40px;
  border-radius: 20px;
  background-color: #eee;
`
