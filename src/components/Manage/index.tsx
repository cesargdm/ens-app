import { gql, useQuery } from '@apollo/client'
import { Award, Image, MoreHorizontal, Plus, Trash } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useAccount, useContractWrite, useEnsName } from 'wagmi'
import styled from 'styled-components/macro'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

import IconButton from 'components/IconButton'
import Loader from 'components/Loader'

import { contractConfig } from 'utils/contracts/ens-controller'

const GET_REGISTRATIONS = gql`
  query GetRegistrations($id: String!) {
    account(id: $id) {
      id
      registrations {
        id
        labelName
        expiryDate
      }
    }
  }
`

const DropDownItem = styled(DropdownMenu.Item)`
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

const DomainItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 16px;

  :hover {
    background-color: #fafafa;
  }
`

function Manage() {
  const { t } = useTranslation()

  const { data: account } = useAccount()
  const { data: name, refetch } = useEnsName({ address: account?.address })

  const { data } = useQuery(GET_REGISTRATIONS, {
    variables: { id: account?.address?.toLowerCase() },
    skip: !account?.address,
  })

  const { write, isLoading } = useContractWrite(contractConfig, 'setName')

  function handleSetPrimary({ labelName }: any) {
    write({ args: [`${labelName}.eth`] })
    refetch()
  }

  function handleSetAvatar({ labelName }: any) {
    return labelName
  }

  return (
    <div>
      <h2>{t(`manage`)}</h2>
      {data?.account?.registrations?.map((registration: any) => (
        <DomainItem key={registration.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#eee',
              }}
              src=""
              alt=""
            />
            <div>
              <p style={{ fontSize: '1.1rem' }}>
                <b>{registration.labelName}.eth</b>
                {name === `${registration.labelName}.eth` && (
                  <span> ({t(`primary`)})</span>
                )}
              </p>
              {registration.expiryDate && (
                <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: 2 }}>
                  Expires in{' '}
                  {formatDistanceToNow(
                    new Date(Number(registration.expiryDate + '000')),
                  )}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu.Root>
            <IconButton as={DropdownMenu.Trigger}>
              {isLoading ? <Loader /> : <MoreHorizontal />}
            </IconButton>
            <DropdownMenu.Content
              style={{
                backgroundColor: 'white',
                padding: 4,
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 16,
              }}
            >
              <DropDownItem onSelect={() => handleSetPrimary(registration)}>
                <Award size={14} strokeWidth={3} />
                {t(`setAsPrimary`)}
              </DropDownItem>
              <DropDownItem onSelect={() => handleSetAvatar(registration)}>
                <Image size={14} strokeWidth={3} />
                {t(`setNFTAvatar`)}
              </DropDownItem>
              <DropDownItem disabled>
                <Plus size={14} strokeWidth={3} />
                {t(`addRecords`)}
              </DropDownItem>
              <DropDownItem disabled>
                <Trash size={14} strokeWidth={3} />
                {t(`renounceOwnership`)}
              </DropDownItem>
              <DropdownMenu.Arrow />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </DomainItem>
      ))}
    </div>
  )
}

export default Manage
